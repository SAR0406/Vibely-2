import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Post,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import { ChatGateway } from '../chat/chat.gateway';
import { Roles } from '../auth/infrastructure/guards/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Request() req: any,
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.adminService.updateUserRole(id, role, req.user.id);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.updateStatus(id, isActive, req.user.id);
  }

  @Delete('users/:id')
  deleteUser(@Request() req: any, @Param('id') id: string) {
    return this.adminService.deleteUser(id, req.user.id);
  }

  @Get('audit-logs')
  getAuditLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAuditLogs(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('config')
  getSystemConfig() {
    return this.adminService.getSystemConfig();
  }

  @Patch('config')
  updateSystemConfig(
    @Request() req: any,
    @Body('key') key: string,
    @Body('value') value: string,
  ) {
    return this.adminService.updateSystemConfig(key, value, req.user.id);
  }

  @Get('reports')
  getReports(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getReports(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Patch('reports/:id/status')
  updateReportStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateReportStatus(id, status, req.user.id);
  }

  @Get('conversations')
  getConversations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllConversations(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('conversations/:id/messages')
  getConversationMessages(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getConversationMessages(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('broadcast')
  async broadcast(@Request() req: any, @Body('content') content: string) {
    const result = await this.adminService.broadcastMessage(
      req.user.id,
      content,
    );
    this.chatGateway.broadcastToAll(content);
    return result;
  }
}
