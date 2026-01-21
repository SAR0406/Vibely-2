import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { RequireTier } from '../common/decorators/tier.decorator';
import { Tier } from '@prisma/client';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
    constructor(private readonly aiService: AIService) { }

    @Get('discovery')
    async getDiscovery(@Req() req) {
        return this.aiService.getMatchesByVibe(req.user.id);
    }

    @RequireTier(Tier.PRO)
    @Get('post-analysis/:id')
    async analyzePost(@Param('id') id: string) {
        return this.aiService.analyzePostSentiment(id);
    }
}
