import { Controller, Get, Post, Param, UseGuards, Request, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { StoriesService } from './stories.service';

@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoriesController {
    constructor(private storiesService: StoriesService) { }

    @Get()
    getStories(@Request() req) {
        return this.storiesService.getStories(req.user.id);
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    createStory(@Request() req, @UploadedFile() file: Express.Multer.File, @Body('type') type: 'IMAGE' | 'VIDEO') {
        return this.storiesService.createStory(req.user.id, file, type);
    }

    @Post(':id/view')
    viewStory(@Request() req, @Param('id') storyId: string) {
        return this.storiesService.viewStory(req.user.id, storyId);
    }
}
