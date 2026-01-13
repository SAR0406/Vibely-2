import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import { ChatService } from './application/chat.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateGroupDto } from './dto/create-group.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  async getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.id);
  }

  @Post()
  async createConversation(
    @Request() req: any,
    @Body() body: { userId: string },
  ) {
    return this.chatService.createDirectConversation(req.user.id, body.userId);
  }

  @Post('groups')
  async createGroup(@Request() req: any, @Body() body: CreateGroupDto) {
    return this.chatService.createGroup(
      req.user.id,
      body.name,
      body.participantIds,
      body.avatar,
    );
  }

  @Post(':id/members')
  async addMember(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.chatService.addMember(id, body.userId);
  }

  @Delete(':id/members/:userId')
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.chatService.removeMember(id, userId);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string, @Query('limit') limit: string) {
    return this.chatService.getMessages(id, limit ? parseInt(limit) : 50);
  }
}
