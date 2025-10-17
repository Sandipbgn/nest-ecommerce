# Upload System Assignment - Relation-Based File Management

## What We Have vs What We Need

### ✅ Already Implemented
- Single file upload API (`POST /upload/image`)
- Multiple files upload API (`POST /upload/images`) 
- Basic Cloudinary integration in `UploadService`
- Empty `upload.entity.ts` file ready for implementation

### 🎯 Your Assignment: Complete the Relation-Based Upload System

Currently, we're just uploading to Cloudinary and returning URLs. We need to create a proper database-backed file management system.

## Task 1: Create Upload Entity

Complete the empty `src/upload/upload.entity.ts` file:

**What to include:**
- Store all Cloudinary response data (publicId, secureUrl, originalFilename, bytes, format, width, height)
- Basic fields (id, createdAt, updatedAt)
- Keep it simple - NO tracking fields, NO relations for now

**Just store the Cloudinary response data, nothing else!**

## Task 2: Enhance Upload Service (DON'T CHANGE EXISTING METHODS!)

**IMPORTANT:** Do NOT modify existing `uploadImage()` and `uploadMultipleImages()` methods!

**New behavior:** Upload to Cloudinary → Save to database → Return BOTH Cloudinary response AND Upload entity

**Add these NEW methods only:**
```typescript
// Save Cloudinary response to database
async saveToDatabase(cloudinaryResult): Promise<Upload>

// Find upload by ID
async findUploadById(uploadId: string): Promise<Upload>

// Delete single upload (Cloudinary + database)
async deleteUpload(uploadId: string): Promise<void>

// 🎯 MAIN TASK: Delete multiple uploads
async deleteMultipleUploads(uploadIds: string[]): Promise<void>
```

## Task 3: Implement Delete Multiple Files

This is the main missing functionality. Create:

**Service Method:**
```typescript
async deleteMultipleUploads(uploadIds: string[]): Promise<void> {
  // Your implementation here
  // Handle both Cloudinary deletion and database cleanup
  // Consider: What if some deletions fail? How do you handle partial failures?
}
```

**Controller Endpoint:**
```typescript
@Delete('multiple')
async deleteMultipleUploads(@Body() { uploadIds }: { uploadIds: string[] }) {
  // Your implementation here
}
```

**Consider:**
- Input validation (array of valid UUIDs)
- Error handling (what if some files don't exist?)
- Response format (success count, failed deletions, etc.)
- Transaction handling (all or nothing vs partial success)

## Task 4: Update Upload Controller (Minimal Changes)

**DON'T change existing upload logic!** Just add database saving:

```typescript
// In existing upload endpoints, after Cloudinary upload:
const cloudinaryResult = await this.uploadService.uploadImage(file);
const uploadRecord = await this.uploadService.saveToDatabase(cloudinaryResult);

// Return both for now (frontend decides what to use)
return {
  cloudinary: cloudinaryResult,  // Keep existing response
  upload: uploadRecord           // Add database record
};
```

## Task 5: Connect to Other Entities (Simple Relations)

Other entities should reference uploads by ID, NOT direct relations:

### Option A: User Profile Pictures
```typescript
// Add to User entity
@Column({ nullable: true })
profilePictureId: string;  // Just store the upload ID

// In UsersService - let frontend handle the Upload entity lookup
```

### Option B: Product Images  
```typescript
// Add to Product entity
@Column({ type: 'text', array: true, default: [] })
imageIds: string[];  // Array of upload IDs

// Frontend will fetch Upload entities separately using these IDs
```

**No complex relations needed - keep it simple with IDs!**

## Expected File Structure After Completion

```
src/upload/
├── upload.entity.ts           ← Complete this (Task 1)
├── upload.service.ts          ← Enhance this (Tasks 2 & 3)  
├── upload.controller.ts       ← Update endpoints (Task 4)
└── upload.module.ts           ← Add entity to imports
```

## Testing Your Implementation

1. **Upload files** → Verify Upload entities are created in database (existing endpoints still work)
2. **Delete single file** → Check both Cloudinary and database cleanup  
3. **Delete multiple files** → Test your new endpoint
4. **Store upload IDs** → Save upload.id in User or Product entity

## Evaluation Checklist

- [ ] Upload entity stores Cloudinary response data
- [ ] Existing upload endpoints still work + save to database
- [ ] Delete multiple files endpoint works correctly
- [ ] Proper error handling for edge cases
- [ ] At least one entity stores upload IDs (not relations)
- [ ] Code is clean and well-documented

## Bonus Points

- Handle partial failures in multiple delete gracefully
- Add file validation (size, type restrictions)
- Implement soft delete vs hard delete options
- Add upload usage tracking
- Create cleanup job for orphaned files

---

**Goal:** Transform the current "upload and forget" system into a robust, trackable, relation-based file management system that gives you full control over your application's assets.