import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
    try {
      console.log('uploaded file buffer', file.buffer);
      return await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'uploads/images', resource_type: 'auto' },
          (error, result) => {
            if (error) {
              reject(new Error(error.message || 'Upload failed'));
            } else {
              resolve(result as CloudinaryResponse);
            }
          },
        );
        stream.end(file.buffer);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      throw new InternalServerErrorException(`Upload failed: ${message}`);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    try {
      const uploadPromises = files.map((file) => this.uploadImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      throw new InternalServerErrorException(`Upload failed: ${message}`);
    }
  }

  async deleteImage(publicId: string): Promise<{ result: string }> {
    try {
      return cloudinary.uploader.destroy(publicId) as Promise<{
        result: string;
      }>;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Deletion failed';
      throw new InternalServerErrorException(`Deletion failed: ${message}`);
    }
  }

  //Assignment: TODO: Add methods for uploadMultipleImages and create controller endpoints
}
