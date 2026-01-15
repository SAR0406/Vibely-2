import { Controller, Get, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { FeedService } from './feed.service';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
    constructor(private feedService: FeedService) { }

    @Get()
    getFeed(@Request() req) {
        return this.feedService.getFeed(req.user.id);
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    createPost(@Request() req, @Body('content') content: string, @UploadedFile() file: Express.Multer.File) {
        return this.feedService.createPost(req.user.id, content, file);
    }

    @Post(':id/like')
    toggleLike(@Request() req, @Param('id') postId: string) {
        return this.feedService.toggleLike(req.user.id, postId);
    }

    @Post(':id/comments')
    addComment(@Request() req, @Param('id') postId: string, @Body('content') content: string) {
        return this.feedService.addComment(req.user.id, postId, content);
    }

    @Get(':id/comments')
    getComments(@Param('id') postId: string) {
        return this.feedService.getComments(postId);
    }
}
