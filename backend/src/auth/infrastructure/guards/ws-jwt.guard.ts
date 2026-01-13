import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { TokenValidationService } from '../../application/token-validation.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly tokenValidationService: TokenValidationService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    const authHeader = client.handshake.headers.authorization;
    const token = client.handshake.auth?.token || authHeader?.split(' ')[1];

    if (!token) {
      client.disconnect();
      return false;
    }

    try {
      const decoded = this.tokenValidationService.validateToken(token);
      client.data.user = decoded;
      client.join(`user_${decoded.sub}`);
      return true;
    } catch {
      client.disconnect();
      return false;
    }
  }
}
