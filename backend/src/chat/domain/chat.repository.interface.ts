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
}

export const IChatRepository = Symbol('IChatRepository');
