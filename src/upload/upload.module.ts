import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { v2 as cloudinary } from 'cloudinary';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        const isAllowed = allowedMimes.includes(file.mimetype);
        cb(isAllowed ? null : new Error('Invalid file type'), isAllowed);
      },
    }),
  ],
  providers: [
    {
      provide: 'CLOUDINARY_CONFIG',
      useFactory: () => {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ddxel6kwn',
          api_key: process.env.CLOUDINARY_API_KEY || '318155394468573',
          api_secret:
            process.env.CLOUDINARY_API_SECRET || '9DCrK19HrckdVqG9IjGzhUWCpo4',
        });
      },
    },
    UploadService,
  ],
  controllers: [UploadController],
})
export class UploadModule {}
