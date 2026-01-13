import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IChatRepository } from '../domain/chat.repository.interface';

@Injectable()
export class ChatPrismaRepository implements IChatRepository {
  constructor(private prisma: PrismaService) {}

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
}
