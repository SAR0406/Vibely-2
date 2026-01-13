import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendRequest(fromId: string, toId: string) {
    if (fromId === toId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if request already exists
    const existing = await this.prisma.friendRequest.findUnique({
      where: {
        fromId_toId: { fromId, toId },
      },
    });

    if (existing) {
      throw new BadRequestException('Friend request already exists');
    }

    return this.prisma.friendRequest.create({
      data: {
        fromId,
        toId,
      },
      include: {
        from: {
          select: { id: true, name: true, avatar: true },
        },
        to: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async getPendingRequests(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: {
        toId: userId,
        status: 'PENDING',
      },
      include: {
        from: {
          select: { id: true, name: true, avatar: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respondToRequest(requestId: string, userId: string, accept: boolean) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.toId !== userId) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request already processed');
    }

    const updated = await this.prisma.friendRequest.update({
      where: { id: requestId },
      data: {
        status: accept ? 'ACCEPTED' : 'REJECTED',
      },
    });

    // If accepted, create a direct conversation
    if (accept) {
      const existing = await this.prisma.conversation.findFirst({
        where: {
          isGroup: false,
          AND: [
            { participants: { some: { userId: request.fromId } } },
            { participants: { some: { userId: request.toId } } },
          ],
        },
      });

      if (!existing) {
        await this.prisma.conversation.create({
          data: {
            isGroup: false,
            participants: {
              create: [{ userId: request.fromId }, { userId: request.toId }],
            },
          },
        });
      }
    }

    return updated;
  }

  async getFriends(userId: string) {
    // Get accepted requests where user is either sender or receiver
    const requests = await this.prisma.friendRequest.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ fromId: userId }, { toId: userId }],
      },
      include: {
        from: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isOnline: true,
            statusMessage: true,
          },
        },
        to: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isOnline: true,
            statusMessage: true,
          },
        },
      },
    });

    // Map to friend objects (the other user)
    return requests.map((req) => {
      return req.fromId === userId ? req.to : req.from;
    });
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const request = await this.prisma.friendRequest.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { fromId: userId1, toId: userId2 },
          { fromId: userId2, toId: userId1 },
        ],
      },
    });

    return !!request;
  }
}
