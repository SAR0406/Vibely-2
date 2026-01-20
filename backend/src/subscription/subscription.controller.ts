import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) { }

    @Get('me')
    async getMySubscription(@Req() req) {
        return this.subscriptionService.getUserSubscription(req.user.id);
    }

    @Post('upgrade')
    async upgrade(@Req() req, @Body('planId') planId: string) {
        return this.subscriptionService.upgradeUser(req.user.id, planId);
    }

    @Get('plans')
    async getPlans() {
        // In a real app, you might want to fetch this from DB
        return this.subscriptionService['prisma'].plan.findMany();
    }
}
