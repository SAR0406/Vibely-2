import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Tier } from '@prisma/client';
import { TIER_KEY } from '../decorators/tier.decorator';

@Injectable()
export class TierGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredTier = this.reflector.getAllAndOverride<Tier>(TIER_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredTier) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            return false;
        }

        // Mapping tiers to numeric values for comparison
        const tierRanks: Record<Tier, number> = {
            [Tier.FREE]: 0,
            [Tier.PRO]: 1,
            [Tier.BUSINESS]: 2,
        };

        const userTier = user.tier as Tier || Tier.FREE;

        if (tierRanks[userTier] < tierRanks[requiredTier]) {
            throw new ForbiddenException(
                `This feature requires a ${requiredTier} subscription or higher. Upgrade to Nexus ${requiredTier} to unlock.`
            );
        }

        return true;
    }
}
