import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post('requests')
  async sendRequest(@Request() req: any, @Body() body: { userId: string }) {
    return this.friendsService.sendRequest(req.user.id, body.userId);
  }

  @Get('requests')
  async getPendingRequests(@Request() req: any) {
    return this.friendsService.getPendingRequests(req.user.id);
  }

  @Patch('requests/:id')
  async respondToRequest(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { accept: boolean },
  ) {
    return this.friendsService.respondToRequest(id, req.user.id, body.accept);
  }

  @Get()
  async getFriends(@Request() req: any) {
    return this.friendsService.getFriends(req.user.id);
  }
}
