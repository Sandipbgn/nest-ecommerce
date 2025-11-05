import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { v2 as cloudinary } from 'cloudinary';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import config from 'config/config';

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
          cloud_name: config().cloudinary.cloudName,
          api_key: config().cloudinary.apiKey,
          api_secret: config().cloudinary.apiSecret,
        });
      },
    },
    UploadService,
  ],
  controllers: [UploadController],
})
export class UploadModule {}
