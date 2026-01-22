import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) {
      return { error: 'No file received' };
    }

    const start = Date.now();
    const user = req.user;
    const userTier = user.tier || 'FREE';

    // File Size Limits (in bytes)
    const LIMITS = {
      FREE: 5 * 1024 * 1024,      // 5MB
      PRO: 50 * 1024 * 1024,      // 50MB
      BUSINESS: 500 * 1024 * 1024 // 500MB
    };

    const limit = LIMITS[userTier];

    if (file.size > limit) {
      const limitMB = limit / (1024 * 1024);
      throw new BadRequestException(`File too large for ${userTier} plan. Limit is ${limitMB}MB. Upgrade for more.`);
    }

    const result = await this.uploadService.uploadFile(file);

    // Simple logging for now
    // console.log(`Upload by ${user.id} (${userTier}): ${file.size} bytes in ${Date.now() - start}ms`);

    return {
      url: result.secure_url,
      type: result.resource_type === 'image' ? 'IMAGE' : result.resource_type === 'video' ? 'VIDEO' : 'FILE', // Basic detection
      name: file.originalname,
      size: file.size
    };
  }
}
