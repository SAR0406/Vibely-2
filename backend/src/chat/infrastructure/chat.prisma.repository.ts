import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IChatRepository } from '../domain/chat.repository.interface';

@Injectable()
export class ChatPrismaRepository implements IChatRepository {
  constructor(private prisma: PrismaService) { }

  async createMessage(data: any) {
    return this.prisma.message.create({
      data,
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        reactions: true,
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: { select: { name: true } },
          },
        },
      },
    });
  }

  async updateConversationTimestamp(id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
      include: {
        participants: { select: { userId: true } },
      },
    });
  }

  async findReaction(userId: string, messageId: string, emoji: string) {
    return this.prisma.reaction.findUnique({
      where: {
        userId_messageId_emoji: { userId, messageId, emoji },
      },
    });
  }

  async addReaction(userId: string, messageId: string, emoji: string) {
    return this.prisma.reaction.create({
      data: { userId, messageId, emoji },
    });
  }

  async removeReaction(id: string) {
    return this.prisma.reaction.delete({ where: { id } });
  }

  async findConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async findMessages(conversationId: string, limit: number) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        reactions: true,
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: { select: { name: true } },
          },
        },
      },
    });
  }

  async createConversation(data: any) {
    return this.prisma.conversation.create({
      data,
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, isOnline: true },
            },
          },
        },
      },
    });
  }

  async findDirectConversation(userId1: string, userId2: string) {
    return this.prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, isOnline: true },
            },
          },
        },
      },
    });
  }

  async addParticipant(conversationId: string, userId: string, role: string) {
    return this.prisma.participant.create({
      data: { conversationId, userId, role },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, isOnline: true },
        },
      },
    });
  }

  async removeParticipant(conversationId: string, userId: string) {
    return this.prisma.participant.delete({
      where: {
        userId_conversationId: { userId, conversationId },
      },
    });
  }

  // ============================
  // READ RECEIPTS
  // ============================

  async markMessagesAsRead(userId: string, conversationId: string, messageIds?: string[]) {
    // Get messages in conversation that user hasn't read yet
    const unreadMessages = await this.prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        ...(messageIds ? { id: { in: messageIds } } : {}),
        reads: { none: { userId } },
      },
      select: { id: true },
    });

    if (unreadMessages.length === 0) return { count: 0 };

    // Create read records for all unread messages
    const readRecords = await this.prisma.messageRead.createMany({
      data: unreadMessages.map((msg) => ({
        messageId: msg.id,
        userId,
      })),
      skipDuplicates: true,
    });

    // Update participant's lastReadAt
    await this.prisma.participant.updateMany({
      where: { userId, conversationId },
      data: { lastReadAt: new Date() },
    });

    return { count: readRecords.count, messageIds: unreadMessages.map((m) => m.id) };
  }

  async getUnreadCount(userId: string, conversationId: string): Promise<number> {
    return this.prisma.message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        reads: { none: { userId } },
      },
    });
  }

  // ============================
  // MESSAGE MANAGEMENT
  // ============================

  async findMessageById(messageId: string) {
    return this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        conversation: { select: { id: true, participants: { select: { userId: true } } } },
      },
    });
  }

  async deleteMessage(messageId: string, userId: string, forAll: boolean) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) return null;

    // If forAll and user is sender, mark as deleted for everyone
    if (forAll && message.senderId === userId) {
      return this.prisma.message.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedForAll: true,
          content: 'This message was deleted',
        },
      });
    }

    // Otherwise, we'd need a per-user deletion tracking (simplified: just mark deleted)
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async forwardMessage(messageId: string, targetConversationIds: string[], userId: string) {
    const original = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!original) return [];

    const forwardedMessages = await Promise.all(
      targetConversationIds.map((convId) =>
        this.prisma.message.create({
          data: {
            content: original.content,
            type: original.type,
            attachmentUrl: original.attachmentUrl,
            senderId: userId,
            conversationId: convId,
            isForwarded: true,
            forwardedFromId: messageId,
          },
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        }),
      ),
    );

    // Update conversation timestamps
    await Promise.all(
      targetConversationIds.map((convId) =>
        this.prisma.conversation.update({
          where: { id: convId },
          data: { lastMessageAt: new Date() },
        }),
      ),
    );

    return forwardedMessages;
  }

  // ============================
  // CONVERSATION MANAGEMENT
  // ============================

  async getParticipant(userId: string, conversationId: string) {
    return this.prisma.participant.findUnique({
      where: { userId_conversationId: { userId, conversationId } },
    });
  }

  async updateParticipantSettings(
    userId: string,
    conversationId: string,
    settings: {
      isPinned?: boolean;
      isMuted?: boolean;
      muteUntil?: Date | null;
      isArchived?: boolean;
    },
  ) {
    return this.prisma.participant.update({
      where: { userId_conversationId: { userId, conversationId } },
      data: settings,
    });
  }
}
