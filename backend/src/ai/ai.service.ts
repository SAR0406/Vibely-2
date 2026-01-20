import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AIService {
    constructor(private prisma: PrismaService) { }

    async getMatchesByVibe(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) return [];

        // Simulate AI matching: fetch users who have similar keywords in their bio or posts
        // For now, we'll just fetch active users with a slightly randomized selection
        const potentialMatches = await this.prisma.user.findMany({
            where: {
                id: { not: userId },
                isActive: true,
            },
            take: 20,
        });

        // Mock "Vibe Score" calculation
        return potentialMatches.map(match => ({
            ...match,
            vibeScore: Math.floor(Math.random() * 40) + 60, // 60-100%
            matchReason: this.generateMatchReason(user, match),
        })).sort((a, b) => b.vibeScore - a.vibeScore);
    }

    private generateMatchReason(user: any, match: any) {
        const reasons = [
            'Similar taste in digital aesthetics',
            'Both active during late-night vibes',
            'Frequent poster of high-energy content',
            'Shared interest in creative expression',
            'Geographical proximity for local events',
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }

    async analyzePostSentiment(postId: string) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post) return null;

        // Simulate AI sentiment analysis
        const sentiments = ['Energetic', 'Calm', 'Moody', 'Hype', 'Chill'];
        return {
            sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
            confidence: 0.85 + Math.random() * 0.1,
        };
    }
}
