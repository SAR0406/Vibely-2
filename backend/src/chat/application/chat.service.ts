import { Injectable, Inject } from '@nestjs/common';
import { IChatRepository } from '../domain/chat.repository.interface';

@Injectable()
export class ChatService {
  constructor(
    @Inject(IChatRepository)
    private readonly chatRepository: IChatRepository,
  ) { }

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

  // ============================
  // READ RECEIPTS
  // ============================

  async markAsRead(userId: string, conversationId: string, messageIds?: string[]) {
    return this.chatRepository.markMessagesAsRead(userId, conversationId, messageIds);
  }

  async getUnreadCount(userId: string, conversationId: string) {
    return this.chatRepository.getUnreadCount(userId, conversationId);
  }

  // ============================
  // MESSAGE MANAGEMENT
  // ============================

  async deleteMessage(messageId: string, userId: string, forAll: boolean = false) {
    const message = await this.chatRepository.findMessageById(messageId);
    if (!message) return null;

    // Only sender can delete for all
    if (forAll && message.senderId !== userId) {
      return null;
    }

    return this.chatRepository.deleteMessage(messageId, userId, forAll);
  }

  async forwardMessage(messageId: string, targetConversationIds: string[], userId: string) {
    return this.chatRepository.forwardMessage(messageId, targetConversationIds, userId);
  }

  // ============================
  // CONVERSATION MANAGEMENT
  // ============================

  async pinConversation(userId: string, conversationId: string, isPinned: boolean) {
    return this.chatRepository.updateParticipantSettings(userId, conversationId, { isPinned });
  }

  async muteConversation(userId: string, conversationId: string, duration?: number) {
    const muteUntil = duration ? new Date(Date.now() + duration) : null;
    return this.chatRepository.updateParticipantSettings(userId, conversationId, {
      isMuted: !!duration,
      muteUntil,
    });
  }

  async archiveConversation(userId: string, conversationId: string, isArchived: boolean) {
    return this.chatRepository.updateParticipantSettings(userId, conversationId, { isArchived });
  }

  async getConversationSettings(userId: string, conversationId: string) {
    return this.chatRepository.getParticipant(userId, conversationId);
  }
}
