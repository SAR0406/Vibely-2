import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tier } from '@prisma/client';

@Injectable()
export class SubscriptionService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.seedPlans();
    }

    private async seedPlans() {
        const plans = [
            {
                name: 'Free Vibe',
                tier: Tier.FREE,
                price: 0,
                features: ['Standard Chat', 'Basic Feed', '1 Story/day'],
            },
            {
                name: 'Pro Vibe',
                tier: Tier.PRO,
                price: 9.99,
                features: ['Ad-free', 'Premium Themes', 'Unlimited Stories', 'Verified Badge', 'Profile Boosts'],
            },
            {
                name: 'Business Vibe',
                tier: Tier.BUSINESS,
                price: 49.99,
                features: ['All Pro features', 'Analytics Dashboard', 'Priority Support', 'API Access'],
            },
        ];

        for (const plan of plans) {
            await this.prisma.plan.upsert({
                where: { id: plan.name.toLowerCase().replace(' ', '-') },
                update: {},
                create: {
                    id: plan.name.toLowerCase().replace(' ', '-'),
                    ...plan,
                },
            });
        }
    }

    async getUserSubscription(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                tier: true,
                subscription: {
                    include: {
                        plan: true,
                    },
                },
            },
        });
    }

    async upgradeUser(userId: string, planId: string) {
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) throw new Error('Plan not found');

        const subscription = await this.prisma.subscription.upsert({
            where: { userId },
            update: {
                planId,
                status: 'ACTIVE',
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
            create: {
                userId,
                planId,
                status: 'ACTIVE',
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                tier: plan.tier,
                subscriptionId: subscription.id,
            },
        });

        return subscription;
    }

    async checkTier(userId: string, requiredTier: Tier): Promise<boolean> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) return false;

        const tiers = Object.values(Tier);
        const userTierIndex = tiers.indexOf(user.tier);
        const requiredTierIndex = tiers.indexOf(requiredTier);

        return userTierIndex >= requiredTierIndex;
    }
}
