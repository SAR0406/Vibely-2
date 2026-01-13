import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './application/users.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('search')
  async searchUsers(@Query('q') query: string, @Request() req: any) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.usersService.searchUsers(query, req.user.id);
  }

  @Get('me')
  async getMe(@Request() req: any) {
    return this.usersService.getUserById(req.user.id);
  }

  @Patch('me')
  async updateMe(@Request() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}
