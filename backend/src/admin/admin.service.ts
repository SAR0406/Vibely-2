import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) { }

  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

    let systemHealth = 'Optimal';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      systemHealth = 'Degraded';
    }

    const [
      totalUsers,
      totalConversations,
      totalMessages,
      totalReactions,
      activeToday,
      newUsersThisWeek,
      userGrowthRaw,
      activityRaw
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.conversation.count(),
      this.prisma.message.count(),
      this.prisma.reaction.count(),
      this.prisma.user.count({ where: { lastSeen: { gte: startOfDay } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.$queryRaw<any[]>`
                SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, CAST(COUNT(*) as INTEGER) as users
                FROM "User"
                WHERE "createdAt" >= ${startOfMonth}
                GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
                ORDER BY date ASC
            `,
      this.prisma.$queryRaw<any[]>`
                SELECT 
                    TO_CHAR("createdAt", 'YYYY-MM-DD') as date, 
                    CAST(COUNT(*) as INTEGER) as messages,
                    CAST(COUNT(DISTINCT "senderId") as INTEGER) as active
                FROM "Message"
                WHERE "createdAt" >= ${startOfMonth}
                GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
                ORDER BY date ASC
            `
    ]);

    const userGrowth = userGrowthRaw.map((r: any) => ({ date: r.date, users: Number(r.users) }));
    const activity = activityRaw.map((r: any) => ({
      date: r.date,
      messages: Number(r.messages),
      active: Number(r.active)
    }));

    const memoryUsage = process.memoryUsage();

    return {
      totalUsers,
      totalConversations,
      totalMessages,
      totalReactions,
      activeToday,
      newUsersThisWeek,
      uptime: process.uptime(),
      systemHealth,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
      charts: {
        userGrowth,
        activity
      }
    };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          isOnline: true,
          lastSeen: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserRole(id: string, role: string, adminId: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
    });
    await this.createAuditLog(adminId, 'UPDATE_USER_ROLE', id, { role });
    return user;
  }

  async updateStatus(id: string, isActive: boolean, adminId: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
    await this.createAuditLog(
      adminId,
      isActive ? 'UNBAN_USER' : 'BAN_USER',
      id,
    );
    return user;
  }

  async broadcastMessage(adminId: string, content: string) {
    const users = await this.prisma.user.findMany({
      where: { id: { not: adminId } },
      select: { id: true },
    });

    await this.createAuditLog(adminId, 'BROADCAST_MESSAGE', undefined, {
      content,
    });
    return { count: users.length, userIds: users.map((u) => u.id) };
  }

  async deleteUser(id: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.reaction.deleteMany({ where: { userId: id } });
      await tx.message.deleteMany({ where: { senderId: id } });
      await tx.participant.deleteMany({ where: { userId: id } });
      const user = await tx.user.delete({ where: { id } });
      await this.createAuditLog(adminId, 'DELETE_USER', id, {
        name: user.name,
        email: user.email,
      });
      return user;
    });
  }

  // Audit Logging
  async createAuditLog(
    adminId: string,
    action: string,
    targetId?: string,
    details?: any,
  ) {
    return this.prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetId,
        details: details ? JSON.stringify(details) : null,
      },
    });
  }

  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { logs, total, page, limit };
  }

  // System Configuration
  async getSystemConfig() {
    const configs = await this.prisma.systemConfig.findMany();
    return configs.reduce(
      (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
      {},
    );
  }

  async updateSystemConfig(key: string, value: string, adminId: string) {
    await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    await this.createAuditLog(adminId, 'UPDATE_CONFIG', key, { value });
    return { success: true };
  }

  async isMaintenanceMode() {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key: 'MAINTENANCE_MODE' },
    });
    return config?.value === 'true';
  }

  // Report Management
  async getReports(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count(),
    ]);

    // Fetch related users to avoid complex includes if schemas differ, 
    // but better to use include if Prisma allows (schema says no relations defined for Report model)
    // Since Report model doesn't have relations defined in schema.prisma, we'll fetch them manually or map.
    const reporterIds = [...new Set(reports.map(r => r.reporterId))];
    const targetIds = [...new Set(reports.map(r => r.targetId).filter(id => !!id))] as string[];

    const users = await this.prisma.user.findMany({
      where: { id: { in: [...reporterIds, ...targetIds] } },
      select: { id: true, name: true, email: true, avatar: true }
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const reportsWithUsers = reports.map(report => ({
      ...report,
      reporter: userMap.get(report.reporterId),
      target: report.targetId ? userMap.get(report.targetId) : null,
    }));

    return { reports: reportsWithUsers, total, page, limit };
  }

  async updateReportStatus(reportId: string, status: string, adminId: string) {
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        resolvedAt: status !== 'OPEN' ? new Date() : null,
        resolvedById: status !== 'OPEN' ? adminId : null,
      },
    });
    await this.createAuditLog(adminId, 'RESOLVE_REPORT', reportId, { status });
    return report;
  }

  // Moderation
  async getAllConversations(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        skip,
        take: limit,
        include: {
          participants: {
            include: {
              user: { select: { name: true, email: true, avatar: true } },
            },
          },
          _count: { select: { messages: true } },
        },
        orderBy: { lastMessageAt: 'desc' },
      }),
      this.prisma.conversation.count(),
    ]);
    return { conversations, total, page, limit };
  }

  async getConversationMessages(conversationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return this.prisma.message.findMany({
      where: { conversationId },
      skip,
      take: limit,
      include: { sender: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upgradeUserTier(userId: string, tier: 'FREE' | 'PRO' | 'BUSINESS', adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update User Record
      const user = await tx.user.update({
        where: { id: userId },
        data: { tier },
      });

      // 2. Manage Subscription Record
      let plan = await tx.plan.findFirst({ where: { tier } });

      // If plan doesn't exist, create it (seeding on the fly for robustness)
      if (!plan) {
        plan = await tx.plan.create({
          data: {
            name: `${tier} Plan`,
            tier,
            price: tier === 'FREE' ? 0 : tier === 'PRO' ? 29.99 : 99.99,
            features: tier === 'FREE' ? ['Basic Chat'] : tier === 'PRO' ? ['Basic Chat', 'HD Calls'] : ['Full Access', 'Priority Support'],
          }
        });
      }

      const existingSub = await tx.subscription.findUnique({
        where: { userId },
      });

      if (existingSub) {
        await tx.subscription.update({
          where: { userId },
          data: {
            planId: plan.id,
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
        });
      } else {
        await tx.subscription.create({
          data: {
            userId,
            planId: plan.id,
            status: 'ACTIVE',
          }
        });
      }

      await this.createAuditLog(adminId, 'UPGRADE_USER_TIER', userId, { tier });
      return user;
    });
  }

  async deleteMessage(messageId: string, adminId: string) {
    const message = await this.prisma.message.delete({
      where: { id: messageId },
    });
    await this.createAuditLog(adminId, 'DELETE_MESSAGE', messageId, {
      content: message.content,
      senderId: message.senderId,
    });
    return message;
  }
}
