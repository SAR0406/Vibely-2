import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
    constructor(private readonly aiService: AIService) { }

    @Get('discovery')
    async getDiscovery(@Req() req) {
        return this.aiService.getMatchesByVibe(req.user.id);
    }

    @Get('post-analysis/:id')
    async analyzePost(@Param('id') id: string) {
        return this.aiService.analyzePostSentiment(id);
    }
}
