import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/infrastructure/guards/ws-jwt.guard';
import { UsersService } from '../users/application/users.service';
import { TokenValidationService } from '../auth/application/token-validation.service';
import { ChatService } from './application/chat.service';
import { VibeService } from './application/vibe.service';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private usersService: UsersService,
    private tokenService: TokenValidationService,
    private chatService: ChatService,
    private vibeService: VibeService,
  ) { }
  // ============================
  // GATEWAY LIFECYCLE
  // ============================

  afterInit() {
    this.logger.log('ChatGateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.authorization;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.tokenService.validateToken(
        token.replace('Bearer ', ''),
      );
      if (!payload) {
        client.disconnect();
        return;
      }

      // Attach user to socket
      client.data.user = payload;

      // Join their own room
      client.join(`user_${payload.sub}`);

      // Update status
      const updatedUser = await this.usersService.updateStatus(
        payload.sub,
        true,
      );

      if (updatedUser) {
        // Broadcast online status
        this.server.emit('user:status', {
          userId: payload.sub,
          isOnline: true,
        });
        this.logger.log(`User ${payload.sub} connected and online.`);
      } else {
        this.logger.warn(
          `User ${payload.sub} authenticated but not found in database.`,
        );
        client.emit('auth:stale');
        client.disconnect();
      }
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub;
    if (!userId) return;

    this.logger.log(`User ${userId} disconnected from chat gateway`);

    // Update status
    const updatedUser = await this.usersService.updateStatus(userId, false);

    if (updatedUser) {
      // Broadcast offline status
      this.server.emit('user:status', {
        userId,
        isOnline: false,
        lastSeen: updatedUser.lastSeen,
      });
    }

    client.broadcast.emit('call:user-left', { userId });
  }

  // ============================
  // CALL SIGNALING EVENTS
  // ============================

  @SubscribeMessage('call:join')
  handleJoinCall(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;

    client.join(data.roomId);

    this.logger.log(`User ${userId} joined call room ${data.roomId}`);

    client.to(data.roomId).emit('call:user-joined', { userId });
  }

  @SubscribeMessage('call:offer')
  handleOffer(
    @MessageBody() data: { roomId: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;

    client.to(data.roomId).emit('call:offer', {
      from: userId,
      offer: data.offer,
    });
  }

  @SubscribeMessage('call:answer')
  handleAnswer(
    @MessageBody() data: { roomId: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;

    client.to(data.roomId).emit('call:answer', {
      from: userId,
      answer: data.answer,
    });
  }

  @SubscribeMessage('call:start')
  handleCallStart(
    @MessageBody()
    data: {
      to: string;
      offer: RTCSessionDescriptionInit;
      conversationId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    const userName = client.data.user.name || 'User'; // Adjust based on token payload

    // Emit to the specific user
    // We need to join them to a room or just send to their user room
    this.logger.log(`User ${userId} starting call with ${data.to}`);

    // Send to the callee
    this.server.to(`user_${data.to}`).emit('call:incoming', {
      from: userId,
      callerName: userName, // You might need to fetch this or pass it
      offer: data.offer,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('call:accept')
  handleCallAccept(
    @MessageBody() data: { to: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    this.logger.log(`User ${userId} accepted call from ${data.to}`);

    this.server.to(`user_${data.to}`).emit('call:accepted', {
      from: userId,
      answer: data.answer,
    });
  }

  @SubscribeMessage('call:reject')
  handleCallReject(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    this.server.to(`user_${data.to}`).emit('call:rejected', {
      from: userId,
    });
  }

  @SubscribeMessage('call:ice-candidate')
  handleIceCandidate(
    @MessageBody()
    data: { to: string; candidate: RTCIceCandidateInit },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    // Relay candidate to the specific user (peer)
    this.server.to(`user_${data.to}`).emit('call:ice-candidate', {
      from: userId,
      candidate: data.candidate,
    });
  }

  // ============================
  // TYPING & STATUS EVENTS
  // ============================

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    // Broadcast to the conversation participants (excluding sender)
    // For simplicity, we'll emit to the conversation room if we had one,
    // or iterate participants. For now, assuming we don't have a direct conversation room,
    // we'd broadcast to known participants.
    // IMPROVEMENT: Ideally client joins a "conversation_ID" room.
    // Let's assume the client IS in a room for this conversation or we broadcast to all.
    // To keep it scoped, we should have clients join conversation rooms.

    // For this implementation, we will broadcast to the user's specific room if we knew the other user,
    // BUT, the current implementation blindly sends to `user_ID`.
    // Let's rely on the client joining a conversation room or broadcast to all (less efficient).

    // BETTER APPROACH:
    client.broadcast.emit('typing', {
      userId,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    client.broadcast.emit('stop_typing', {
      userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('markSeen')
  async handleMarkSeen(
    @MessageBody() data: { conversationId: string; messageIds?: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    // In a real app, update DB here
    // await this.chatService.markAsRead(userId, data.messageIds);

    // If messageIds not provided, assumes "all/latest". 
    // For now we just broadcast that "some messages" were seen or just valid for the conversation.

    client.broadcast.emit('messages:seen', {
      userId,
      conversationId: data.conversationId,
      messageIds: data.messageIds, // Pass through if available
    });
  }

  // ============================
  // CHAT EVENTS
  // ============================

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      type?: string;
      attachmentUrl?: string;
      replyToId?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    this.logger.log(
      `User ${userId} sending message to conversation ${data.conversationId}`,
    );

    const result = await this.chatService.sendMessage(
      userId,
      data.conversationId,
      data.content,
      data.type,
      data.attachmentUrl,
      data.replyToId,
    );

    result.participants.forEach((pId: string) => {
      this.server.to(`user_${pId}`).emit('message', result);
    });

    // VIBE CHECK
    const vibe = this.vibeService.analyze(data.content);
    // Broadcast vibe to conversation participants (or room)
    result.participants.forEach((pId: string) => {
      this.server.to(`user_${pId}`).emit('chat:vibe', {
        conversationId: data.conversationId,
        score: vibe.score,
        label: vibe.label,
      });
    });
  }

  @SubscribeMessage('react')
  async handleReact(
    @MessageBody()
    data: { messageId: string; emoji: string; conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub;
    this.logger.log(
      `User ${userId} reacting with ${data.emoji} to message ${data.messageId}`,
    );

    const reaction = await this.chatService.addReaction(
      userId,
      data.messageId,
      data.emoji,
    );

    // Broadcast reaction update to the conversation room
    this.server.emit('reactionAdded', {
      messageId: data.messageId,
      reaction,
      conversationId: data.conversationId,
    });
  }

  // ============================
  // ADMIN BROADCAST
  // ============================

  public broadcastToAll(content: string) {
    this.server.emit('system:announcement', {
      content,
      timestamp: new Date(),
      type: 'BROADCAST',
    });
  }
}
