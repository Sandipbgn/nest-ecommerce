import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  original_filename: string;
  bytes: number;
  format: string;
  width?: number;
  height?: number;
}

export interface MulterFile {
  buffer?: Buffer;
  path?: string;
  mimetype: string;
  size: number;
  originalname: string;
}

@Injectable()
export class UploadService {
  async uploadImage(file: MulterFile): Promise<CloudinaryResponse | undefined> {
    try {
      this.validateFile(file);

      let uploadPromise: Promise<CloudinaryResponse>;

      if (file.buffer) {
        // Handle buffer upload (memory storage)
        uploadPromise = new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'uploads',
              timeout: 60000, // 60 seconds timeout
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) {
                reject(new Error(`Cloudinary error: ${error.message}`));
              } else if (result) {
                resolve(result as CloudinaryResponse);
              } else {
                reject(new Error('Upload failed: No result returned'));
              }
            },
          );
          stream.end(file.buffer);
        });
      } else if (file.path) {
        // Handle file path upload (disk storage)
        uploadPromise = cloudinary.uploader.upload(file.path, {
          folder: 'uploads',
          timeout: 60000, // 60 seconds timeout
          resource_type: 'auto',
        });
      } else {
        throw new BadRequestException('No file data provided');
      }

      const result = await Promise.race([
        uploadPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout')), 30000),
        ),
      ]);

      console.log('Upload successful:', result);

      return result as CloudinaryResponse;
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage === 'Upload timeout') {
        throw new InternalServerErrorException(
          'File upload timed out. Please try again with a smaller file.',
        );
      }
      throw new InternalServerErrorException(`Upload failed: ${errorMessage}`);
    }
  }

  validateFile(file: MulterFile): void {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
      );
    }

    if (file.size > maxSizeInBytes) {
      throw new BadRequestException('File size exceeds the 5MB limit.');
    }
  }
}
