import { SetMetadata } from '@nestjs/common';
import { Tier } from '@prisma/client';

export const TIER_KEY = 'tier';
export const RequireTier = (tier: Tier) => SetMetadata(TIER_KEY, tier);
