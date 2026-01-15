import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class StoriesService {
    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService
    ) { }

    async createStory(userId: string, file: Express.Multer.File, type: 'IMAGE' | 'VIDEO' = 'IMAGE') {
        const uploadResult = await this.uploadService.uploadFile(file);
        // @ts-ignore
        const mediaUrl = uploadResult.secure_url;

        // Expires in 24 hours
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        return this.prisma.story.create({
            data: {
                authorId: userId,
                mediaUrl,
                type,
                expiresAt
            }
        });
    }

    async getStories(currentUserId: string) {
        const stories = await this.prisma.story.findMany({
            where: {
                expiresAt: { gt: new Date() }
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                },
                views: {
                    where: { viewerId: currentUserId }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const grouped = new Map();
        for (const story of stories) {
            if (!grouped.has(story.authorId)) {
                grouped.set(story.authorId, {
                    user: story.author,
                    stories: [],
                    hasUnseen: false
                });
            }
            const group = grouped.get(story.authorId);
            const viewed = story.views.length > 0;
            group.stories.push({ ...story, viewed });
            if (!viewed) group.hasUnseen = true;
        }

        return Array.from(grouped.values());
    }

    async viewStory(userId: string, storyId: string) {
        return this.prisma.storyView.create({
            data: {
                viewerId: userId,
                storyId
            }
        }).catch(() => {
            return { status: 'already_viewed' };
        });
    }
}
