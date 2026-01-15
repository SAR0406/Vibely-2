import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class FeedService {
    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService
    ) { }

    async getFeed(userId: string) {
        return this.prisma.post.findMany({
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                },
                _count: {
                    select: { comments: true, likes: true }
                },
                likes: {
                    where: { userId },
                    select: { userId: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }

    async createPost(userId: string, content: string, file?: Express.Multer.File) {
        let imageUrl = null;
        if (file) {
            const result = await this.uploadService.uploadFile(file);
            // @ts-ignore
            imageUrl = result.secure_url;
        }

        return this.prisma.post.create({
            data: {
                authorId: userId,
                content,
                imageUrl
            },
            include: {
                author: { select: { id: true, name: true, avatar: true } }
            }
        });
    }

    async toggleLike(userId: string, postId: string) {
        const existing = await this.prisma.like.findUnique({
            where: {
                userId_postId: { userId, postId }
            }
        });

        if (existing) {
            await this.prisma.like.delete({
                where: { id: existing.id }
            });
            await this.prisma.post.update({
                where: { id: postId },
                data: { likesCount: { decrement: 1 } }
            });
            return { liked: false };
        } else {
            await this.prisma.like.create({
                data: { userId, postId }
            });
            await this.prisma.post.update({
                where: { id: postId },
                data: { likesCount: { increment: 1 } }
            });
            return { liked: true };
        }
    }

    async addComment(userId: string, postId: string, content: string) {
        return this.prisma.comment.create({
            data: {
                content,
                authorId: userId,
                postId
            },
            include: {
                author: { select: { id: true, name: true, avatar: true } }
            }
        });
    }

    async getComments(postId: string) {
        return this.prisma.comment.findMany({
            where: { postId },
            include: {
                author: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
    }
}
