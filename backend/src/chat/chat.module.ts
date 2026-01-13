import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './application/chat.service';
import { ChatController } from './chat.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { IChatRepository } from './domain/chat.repository.interface';
import { ChatPrismaRepository } from './infrastructure/chat.prisma.repository';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get('JWT_SECRET') || 'super-secret-key-change-in-prod',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    {
      provide: IChatRepository,
      useClass: ChatPrismaRepository,
    },
  ],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
