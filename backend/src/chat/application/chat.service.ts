import { Injectable, Inject } from '@nestjs/common';
import { IChatRepository } from '../domain/chat.repository.interface';

@Injectable()
export class ChatService {
  constructor(
    @Inject(IChatRepository)
    private readonly chatRepository: IChatRepository,
  ) {}

  async sendMessage(
    userId: string,
    conversationId: string,
    content: string,
    type: any = 'TEXT',
    attachmentUrl?: string,
    replyToId?: string,
  ) {
    const message = await this.chatRepository.createMessage({
      content,
      type: type || 'TEXT',
      attachmentUrl,
      senderId: userId,
      conversationId,
      status: 'SENT',
      replyToId,
    });

    const updatedConversation =
      await this.chatRepository.updateConversationTimestamp(conversationId);

    return {
      ...message,
      participants: updatedConversation.participants.map((p) => p.userId),
    };
  }

  async addReaction(userId: string, messageId: string, emoji: string) {
    const existing = await this.chatRepository.findReaction(
      userId,
      messageId,
      emoji,
    );

    if (existing) {
      const deleted = await this.chatRepository.removeReaction(existing.id);
      return { ...deleted, isDeleted: true };
    }

    const created = await this.chatRepository.addReaction(
      userId,
      messageId,
      emoji,
    );
    return { ...created, isDeleted: false };
  }

  async getConversations(userId: string) {
    return this.chatRepository.findConversations(userId);
  }

  async getMessages(conversationId: string, limit = 50) {
    return this.chatRepository.findMessages(conversationId, limit);
  }

  async createGroup(
    creatorId: string,
    name: string,
    participantIds: string[],
    avatar?: string,
  ) {
    return this.chatRepository.createConversation({
      name,
      avatar,
      isGroup: true,
      participants: {
        create: [
          { userId: creatorId, role: 'ADMIN' },
          ...participantIds.map((id) => ({
            userId: id,
            role: 'MEMBER' as const,
          })),
        ],
      },
    });
  }

  async addMember(conversationId: string, userId: string) {
    return this.chatRepository.addParticipant(conversationId, userId, 'MEMBER');
  }

  async removeMember(conversationId: string, userId: string) {
    return this.chatRepository.removeParticipant(conversationId, userId);
  }

  async createDirectConversation(userId1: string, userId2: string) {
    const existing = await this.chatRepository.findDirectConversation(
      userId1,
      userId2,
    );
    if (existing) return existing;

    return this.chatRepository.createConversation({
      isGroup: false,
      participants: {
        create: [{ userId: userId1 }, { userId: userId2 }],
      },
    });
  }
}
