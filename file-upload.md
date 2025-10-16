# File Upload API with Multer and Cloudinary in NestJS

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Required Dependencies](#required-dependencies)
4. [Cloudinary Setup](#cloudinary-setup)
5. [Environment Configuration](#environment-configuration)
6. [Basic Implementation](#basic-implementation)
7. [API Endpoints](#api-endpoints)
8. [Best Practices](#best-practices)

## Overview

This guide demonstrates how to implement a robust file upload system in NestJS using:
- **Multer**: For handling multipart/form-data (file uploads)
- **Cloudinary**: For cloud storage and image processing
- **NestJS**: Framework for building scalable Node.js applications

### What We'll Build
- **Upload Single File**: POST endpoint to upload one file
- **Upload Multiple Files**: POST endpoint to upload multiple files
- **Delete Single File**: DELETE endpoint to remove one file
- **Delete Multiple Files**: DELETE endpoint to remove multiple files

## Prerequisites

Before starting, ensure you have:
- Node.js (v16 or higher)
- NestJS CLI installed globally
- A Cloudinary account (free tier available)
- Basic understanding of NestJS concepts (modules, services, controllers)
- PostgreSQL database (as shown in your current setup)

## Required Dependencies

First, install the necessary packages:

```bash
# Core file upload dependencies
npm install @nestjs/platform-express multer

# Cloudinary SDK
npm install cloudinary

# Type definitions
npm install -D @types/multer

# Optional: For file validation
npm install file-type mime-types
npm install -D @types/mime-types
```

### Dependency Explanation

- `@nestjs/platform-express`: Provides Express platform for NestJS (includes Multer support)
- `multer`: Middleware for handling multipart/form-data
- `cloudinary`: Official Cloudinary SDK for Node.js
- `@types/multer`: TypeScript definitions for Multer
- `file-type`: For detecting file types from buffer
- `mime-types`: For working with MIME types

## Cloudinary Setup

### 1. Create Cloudinary Account
1. Visit [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Navigate to Dashboard to get your credentials

### 2. Get Cloudinary Credentials
From your Cloudinary Dashboard, note down:
- **Cloud Name**: Your unique cloud identifier
- **API Key**: Your public API key
- **API Secret**: Your private API secret (keep this secure!)

## Environment Configuration

### 1. Update .env File
Create or update your `.env` file with Cloudinary credentials:

```env
# Database Configuration (existing)
DB_HOST=localhost
DB_PORT=1234
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=ecommerce

# JWT Configuration (existing)
JWT_SECRET=your_jwt_secret

# Cloudinary Configuration (new)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Upload Configuration (optional)
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

### 2. Create Configuration Module
Create a configuration service to handle environment variables:

```typescript
// src/config/cloudinary.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}));
```

## Basic Implementation

### 1. Generate Upload Module
Using NestJS CLI, generate the upload module:

```bash
nest generate module upload
nest generate service upload
nest generate controller upload
```

### 2. Basic File Structure
```
src/
  upload/
    ├── upload.controller.ts
    ├── upload.service.ts
    └── upload.module.ts
```

### 3. Cloudinary Interface
```typescript
// Add this interface at the top of your upload.service.ts
interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  original_filename: string;
  bytes: number;
  format: string;
  width?: number;
  height?: number;
}
```

### 4. Upload Service (Basic Implementation)

```typescript
// src/upload/upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

// Add this interface at the top of your upload.service.ts
interface CloudinaryResponse {
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
  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  // Upload single file
  async uploadSingle(file: Express.Multer.File) {
    this.validateFile(file);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'ecommerce' },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            success: true,
            data: {
              url: result.secure_url,
              publicId: result.public_id,
              originalName: result.original_filename,
            }
          });
        }
      ).end(file.buffer);
    });
  }

  // Upload multiple files
  async uploadMultiple(files: Express.Multer.File[]) {
    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files allowed');
    }

    files.forEach(file => this.validateFile(file));

    const uploadPromises = files.map(file => this.uploadSingle(file));
    const results = await Promise.all(uploadPromises);

    return {
      success: true,
      message: `${files.length} files uploaded successfully`,
      data: results.map(result => result.data)
    };
  }

  // Delete single file
  async deleteSingle(publicId: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve({
          success: true,
          message: 'File deleted successfully'
        });
      });
    });
  }

  // Delete multiple files
  async deleteMultiple(publicIds: string[]) {
    const deletePromises = publicIds.map(id => this.deleteSingle(id));
    await Promise.all(deletePromises);

    return {
      success: true,
      message: `${publicIds.length} files deleted successfully`
    };
  }

  // Basic file validation
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Only images
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }
  }
}
```

## API Endpoints

### Upload Controller (Basic Implementation)
```typescript
// src/upload/upload.controller.ts
import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // Upload single file
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.uploadService.uploadSingle(file);
  }

  // Upload multiple files
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    return this.uploadService.uploadMultiple(files);
  }

  // Delete single file
  @Delete('single/:publicId')
  async deleteSingle(@Param('publicId') publicId: string) {
    const decodedPublicId = decodeURIComponent(publicId);
    return this.uploadService.deleteSingle(decodedPublicId);
  }

  // Delete multiple files
  @Delete('multiple')
  async deleteMultiple(@Body('publicIds') publicIds: string[]) {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('No public IDs provided');
    }
    return this.uploadService.deleteMultiple(publicIds);
  }
}
```

### Upload Module
```typescript
// src/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
```

Don't forget to add the `UploadModule` to your main `app.module.ts`:

```typescript
// src/app.module.ts
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // ... other imports
    UploadModule,
  ],
  // ...
})
export class AppModule {}
```

## Best Practices

### 1. Security & Validation
- Always validate file types and sizes
- Set reasonable file size limits (5MB in our example)
- Use authentication for upload endpoints
- Validate file content, not just extensions

### 2. Error Handling
- Provide clear error messages
- Handle Cloudinary API failures gracefully
- Log errors for debugging

### 3. Performance
- Use Cloudinary's auto-optimization features
- Consider implementing file compression
- Use appropriate folder structure in Cloudinary

### 4. Environment Management
- Keep Cloudinary credentials secure in environment variables
- Use different Cloudinary accounts for development/production
- Monitor your Cloudinary usage and quotas

## Conclusion

This simplified guide provides the basic file upload functionality you need:

✅ **Upload single file** - POST `/upload/single`  
✅ **Upload multiple files** - POST `/upload/multiple`  
✅ **Delete single file** - DELETE `/upload/single/:publicId`  
✅ **Delete multiple files** - DELETE `/upload/multiple`

### Key Points:
1. Install required dependencies: `cloudinary`, `multer`, `@types/multer`
2. Set up Cloudinary credentials in environment variables  
3. Create simple service with upload/delete methods
4. Create controller with 4 basic endpoints
5. Add basic file validation (type and size)

This basic implementation can be extended with more features as needed, such as:
- Authentication/authorization
- Advanced file validation
- Image transformations
- Database integration
- More sophisticated error handling

The code is kept simple and focused on the core functionality for educational purposes.