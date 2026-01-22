export interface IChatRepository {
  createMessage(data: any): Promise<any>;
  updateConversationTimestamp(id: string): Promise<any>;
  addReaction(userId: string, messageId: string, emoji: string): Promise<any>;
  removeReaction(id: string): Promise<any>;
  findReaction(userId: string, messageId: string, emoji: string): Promise<any>;
  findConversations(userId: string): Promise<any[]>;
  findMessages(conversationId: string, limit: number): Promise<any[]>;
  createConversation(data: any): Promise<any>;
  findDirectConversation(userId1: string, userId2: string): Promise<any>;
  addParticipant(
    conversationId: string,
    userId: string,
    role: string,
  ): Promise<any>;
  removeParticipant(conversationId: string, userId: string): Promise<any>;

  // Read Receipts
  markMessagesAsRead(userId: string, conversationId: string, messageIds?: string[]): Promise<any>;
  getUnreadCount(userId: string, conversationId: string): Promise<number>;

  // Message Management
  deleteMessage(messageId: string, userId: string, forAll: boolean): Promise<any>;
  forwardMessage(messageId: string, targetConversationIds: string[], userId: string): Promise<any[]>;
  findMessageById(messageId: string): Promise<any>;

  // Conversation Management
  updateParticipantSettings(userId: string, conversationId: string, settings: {
    isPinned?: boolean;
    isMuted?: boolean;
    muteUntil?: Date | null;
    isArchived?: boolean;
  }): Promise<any>;
  getParticipant(userId: string, conversationId: string): Promise<any>;
}

export const IChatRepository = Symbol('IChatRepository');
