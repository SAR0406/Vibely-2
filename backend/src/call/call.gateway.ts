import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TokenValidationService } from '../auth/application/token-validation.service';

interface CallData {
  to: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  conversationId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CallGateway {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('CallGateway');

  // Map userId -> socketId
  private userSockets = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private tokenValidationService: TokenValidationService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.headers.authorization?.split(' ')[1] ||
        client.handshake.auth?.token;
      if (!token) {
        this.logger.warn(`Call connection without token: ${client.id}`);
        client.disconnect();
        return;
      }

      try {
        const decoded = this.tokenValidationService.validateToken(token);
        client.data.user = decoded;
        this.userSockets.set(decoded.sub, client.id);
        this.logger.log(`User ${decoded.sub} authenticated for calls`);
      } catch (e) {
        this.logger.warn(`Call auth failed for ${client.id}: ${e.message}`);
        client.disconnect();
      }
    } catch (e) {
      this.logger.error(`Connection error: ${e.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub;
    if (userId) {
      this.logger.log(`User ${userId} disconnected from call gateway`);
      this.userSockets.delete(userId);
    }
  }

  @SubscribeMessage('callUser')
  handleCallUser(
    @MessageBody() data: CallData,
    @ConnectedSocket() client: Socket,
  ) {
    const callerId = client.data.user?.sub;
    const callerName = client.data.user?.name || 'Someone';
    const targetSocketId = this.userSockets.get(data.to);

    if (targetSocketId) {
      this.logger.log(`Call initiated: ${callerId} -> ${data.to}`);
      this.server.to(targetSocketId).emit('incomingCall', {
        from: callerId,
        callerName,
        offer: data.offer,
        conversationId: data.conversationId,
      });
    } else {
      // User offline
      client.emit('callFailed', { reason: 'User is offline' });
    }
  }

  @SubscribeMessage('answerCall')
  handleAnswerCall(
    @MessageBody() data: CallData,
    @ConnectedSocket() client: Socket,
  ) {
    const answererId = client.data.user?.sub;
    const targetSocketId = this.userSockets.get(data.to);

    if (targetSocketId) {
      this.logger.log(`Call answered: ${answererId} -> ${data.to}`);
      this.server.to(targetSocketId).emit('callAnswered', {
        from: answererId,
        answer: data.answer,
      });
    }
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(
    @MessageBody() data: CallData,
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.user?.sub;
    const targetSocketId = this.userSockets.get(data.to);

    if (targetSocketId) {
      this.server.to(targetSocketId).emit('iceCandidate', {
        from: senderId,
        candidate: data.candidate,
      });
    }
  }

  @SubscribeMessage('endCall')
  handleEndCall(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: Socket,
  ) {
    const enderId = client.data.user?.sub;
    const targetSocketId = this.userSockets.get(data.to);

    if (targetSocketId) {
      this.logger.log(`Call ended by ${enderId}`);
      this.server.to(targetSocketId).emit('callEnded', {
        from: enderId,
      });
    }
  }

  @SubscribeMessage('rejectCall')
  handleRejectCall(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: Socket,
  ) {
    const rejecterId = client.data.user?.sub;
    const targetSocketId = this.userSockets.get(data.to);

    if (targetSocketId) {
      this.logger.log(`Call rejected by ${rejecterId}`);
      this.server.to(targetSocketId).emit('callRejected', {
        from: rejecterId,
      });
    }
  }
}
