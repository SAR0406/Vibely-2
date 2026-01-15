import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) { }

  async getStats() {
    const [totalUsers, totalConversations, totalMessages, totalReactions] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.conversation.count(),
        this.prisma.message.count(),
        this.prisma.reaction.count(),
      ]);

    const activeToday = await this.prisma.user.count({
      where: {
        lastSeen: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = await this.prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    const uptime = Math.floor(process.uptime());
    const memoryUsage = process.memoryUsage();

    // Mock data for charts (in a real app, this would come from analytics tables)
    const userGrowth = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      users: totalUsers - Math.floor(Math.random() * 10 * (6 - i)),
    }));

    const activityData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      messages: Math.floor(Math.random() * 500) + 100,
      active: Math.floor(Math.random() * 50) + 10,
    }));

    return {
      totalUsers,
      totalConversations,
      totalMessages,
      totalReactions,
      activeToday,
      newUsersThisWeek,
      uptime,
      systemHealth: 'Optimal',
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
      charts: {
        userGrowth,
        activity: activityData
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
    return { reports, total, page, limit };
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
}
