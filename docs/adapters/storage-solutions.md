---
sidebar_position: 3
title: Storage & Cloud Services
description: Complete guide to file storage solutions including S3, local storage, and Cloudinary with Mifty
keywords: [storage, s3, aws, cloudinary, file upload, local storage, cloud storage]
---

import AdapterGuide from '@site/src/components/AdapterGuide';

# Storage & Cloud Services

Mifty provides flexible storage adapters that support local file storage, cloud storage services, and media management platforms. You can easily switch between different storage providers without changing your application code.

## Universal Storage Service Adapter

The universal storage service adapter allows you to switch between local and cloud storage providers through environment configuration, making it perfect for development and production environments.

<AdapterGuide
  name="Universal Storage Service"
  command="npm run adapter install storage-service"
  description="Universal storage adapter supporting local file system, AWS S3, and other cloud providers with seamless switching"
  category="storage"
  envVars={[
    {
      name: "STORAGE_TYPE",
      description: "Storage provider to use",
      required: true,
      example: "local"
    },
    {
      name: "STORAGE_BASE_URL",
      description: "Base URL for accessing stored files",
      required: true,
      example: "http://localhost:3000/uploads"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Install the Universal Storage Adapter",
      description: "Install the storage service adapter that supports multiple providers",
      code: "npm run adapter install storage-service",
      language: "bash"
    },
    {
      step: 2,
      title: "Choose Your Storage Provider",
      description: "Configure your preferred storage provider in the .env file",
      code: `# Choose one of: local, s3, cloudinary
STORAGE_TYPE=local
STORAGE_BASE_URL=http://localhost:3000/uploads`,
      language: "bash"
    },
    {
      step: 3,
      title: "Configure Provider-Specific Settings",
      description: "Add the specific configuration for your chosen provider (see provider sections below)"
    }
  ]}
  examples={[
    {
      title: "Basic File Upload",
      description: "Upload files using the universal storage service",
      code: `import { StorageService } from '@mifty/storage-service';

const storageService = new StorageService();

// Upload a single file
const uploadResult = await storageService.upload({
  file: req.file, // Multer file object
  folder: 'user-avatars',
  filename: \`avatar-\${userId}.jpg\`
});

console.log('File uploaded:', uploadResult.url);

// Upload multiple files
const files = req.files; // Array of files
const uploadPromises = files.map(file => 
  storageService.upload({
    file,
    folder: 'gallery',
    generateFilename: true // Auto-generate unique filename
  })
);

const results = await Promise.all(uploadPromises);`,
      language: "typescript"
    },
    {
      title: "File Management Operations",
      description: "Perform common file operations like delete, copy, and move",
      code: `// Delete a file
await storageService.delete('user-avatars/avatar-123.jpg');

// Copy a file
await storageService.copy(
  'temp/upload-abc.jpg',
  'permanent/document-123.jpg'
);

// Move a file
await storageService.move(
  'temp/upload-xyz.pdf',
  'documents/final-report.pdf'
);

// Check if file exists
const exists = await storageService.exists('documents/report.pdf');

// Get file metadata
const metadata = await storageService.getMetadata('images/photo.jpg');
console.log('File size:', metadata.size);
console.log('Last modified:', metadata.lastModified);`,
      language: "typescript"
    },
    {
      title: "File Upload with Validation",
      description: "Implement file validation and processing before upload",
      code: `import multer from 'multer';
import { StorageService } from '@mifty/storage-service';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload route with validation
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await storageService.upload({
      file: req.file,
      folder: 'images',
      options: {
        resize: { width: 800, height: 600 }, // Auto-resize
        quality: 80 // Compress image
      }
    });
    
    res.json({ success: true, url: result.url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "File upload fails silently",
      solution: "Check file size limits, MIME type restrictions, and ensure the storage directory has write permissions"
    },
    {
      problem: "Uploaded files not accessible via URL",
      solution: "Verify STORAGE_BASE_URL is correct and your web server is configured to serve static files from the upload directory"
    },
    {
      problem: "Out of disk space errors",
      solution: "Monitor disk usage and implement file cleanup policies or switch to cloud storage for scalability"
    }
  ]}
/>

## Local File Storage

<AdapterGuide
  name="Local File Storage"
  command="npm run adapter install storage-local"
  description="Store files on the local file system with automatic directory management and URL generation"
  category="storage"
  envVars={[
    {
      name: "STORAGE_TYPE",
      description: "Set to 'local' to use local file storage",
      required: true,
      example: "local"
    },
    {
      name: "LOCAL_UPLOAD_DIR",
      description: "Directory path for storing uploaded files",
      required: true,
      example: "./uploads"
    },
    {
      name: "LOCAL_BASE_URL",
      description: "Base URL for accessing uploaded files",
      required: true,
      example: "http://localhost:3000/uploads"
    },
    {
      name: "LOCAL_MAX_FILE_SIZE",
      description: "Maximum file size in bytes",
      required: false,
      example: "10485760",
      default: "5242880"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Configure Local Storage",
      description: "Set up local file storage configuration in your .env file",
      code: `STORAGE_TYPE=local
LOCAL_UPLOAD_DIR=./uploads
LOCAL_BASE_URL=http://localhost:3000/uploads
LOCAL_MAX_FILE_SIZE=10485760`,
      language: "bash"
    },
    {
      step: 2,
      title: "Set up Static File Serving",
      description: "Configure your web server to serve uploaded files",
      code: `// app.ts - Express.js example
import express from 'express';
import path from 'path';

const app = express();

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure uploads directory exists
import fs from 'fs';
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}`,
      language: "typescript"
    },
    {
      step: 3,
      title: "Configure File Permissions",
      description: "Ensure proper file permissions for the upload directory",
      code: `# Linux/macOS
chmod 755 uploads/
chown www-data:www-data uploads/

# Or for development
chmod 777 uploads/`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "Local Storage with Organization",
      description: "Organize files in folders by date and type",
      code: `// services/storage/local.ts
import { LocalStorageService } from '@mifty/storage-local';

const localStorage = new LocalStorageService({
  uploadDir: process.env.LOCAL_UPLOAD_DIR,
  baseUrl: process.env.LOCAL_BASE_URL,
  organizationStrategy: 'date', // Creates YYYY/MM/DD folders
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ]
});

// Upload with automatic organization
const result = await localStorage.upload({
  file: req.file,
  folder: 'documents' // Will create: uploads/documents/2024/01/15/
});`,
      language: "typescript"
    },
    {
      title: "File Cleanup and Maintenance",
      description: "Implement automatic cleanup of old or unused files",
      code: `// scripts/cleanup-files.ts
import { LocalStorageService } from '@mifty/storage-local';
import { Database } from '../database';

const cleanupOldFiles = async () => {
  const localStorage = new LocalStorageService();
  const db = new Database();
  
  // Find files older than 30 days not referenced in database
  const oldFiles = await localStorage.findOldFiles(30);
  
  for (const file of oldFiles) {
    const isReferenced = await db.query(
      'SELECT COUNT(*) as count FROM files WHERE path = ?',
      [file.path]
    );
    
    if (isReferenced.count === 0) {
      await localStorage.delete(file.path);
      console.log(\`Deleted unused file: \${file.path}\`);
    }
  }
};

// Run cleanup daily
setInterval(cleanupOldFiles, 24 * 60 * 60 * 1000);`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Permission denied errors",
      solution: "Ensure the upload directory has proper write permissions for the web server user"
    },
    {
      problem: "Files not accessible via HTTP",
      solution: "Configure your web server to serve static files from the upload directory"
    },
    {
      problem: "Disk space issues",
      solution: "Implement file rotation, compression, or migration to cloud storage for large files"
    }
  ]}
/>

## AWS S3 Storage

<AdapterGuide
  name="AWS S3 Storage"
  command="npm run adapter install aws-s3"
  description="Scalable cloud storage with AWS S3 including CDN integration and advanced features"
  category="storage"
  envVars={[
    {
      name: "STORAGE_TYPE",
      description: "Set to 's3' to use AWS S3 storage",
      required: true,
      example: "s3"
    },
    {
      name: "AWS_S3_BUCKET",
      description: "S3 bucket name for file storage",
      required: true,
      example: "my-app-uploads"
    },
    {
      name: "AWS_REGION",
      description: "AWS region for the S3 bucket",
      required: true,
      example: "us-east-1"
    },
    {
      name: "AWS_ACCESS_KEY_ID",
      description: "AWS access key ID with S3 permissions",
      required: true,
      example: "AKIAIOSFODNN7EXAMPLE"
    },
    {
      name: "AWS_SECRET_ACCESS_KEY",
      description: "AWS secret access key",
      required: true,
      example: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    },
    {
      name: "S3_CDN_URL",
      description: "CloudFront CDN URL for faster file delivery",
      required: false,
      example: "https://d1234567890.cloudfront.net"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Create S3 Bucket",
      description: "Create an S3 bucket in your AWS account",
      code: `1. Go to AWS S3 Console
2. Click 'Create bucket'
3. Choose a unique bucket name
4. Select your preferred region
5. Configure public access settings as needed`,
      language: "text"
    },
    {
      step: 2,
      title: "Set up IAM User",
      description: "Create an IAM user with S3 permissions",
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-app-uploads",
        "arn:aws:s3:::my-app-uploads/*"
      ]
    }
  ]
}`,
      language: "json"
    },
    {
      step: 3,
      title: "Configure CORS (if needed)",
      description: "Set up CORS for browser uploads",
      code: `[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]`,
      language: "json"
    },
    {
      step: 4,
      title: "Configure Environment Variables",
      description: "Add AWS S3 credentials to your .env file",
      code: `STORAGE_TYPE=s3
AWS_S3_BUCKET=my-app-uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_CDN_URL=https://d1234567890.cloudfront.net`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "S3 Upload with Metadata",
      description: "Upload files to S3 with custom metadata and storage classes",
      code: `// services/storage/s3.ts
import { S3StorageService } from '@mifty/aws-s3';

const s3Storage = new S3StorageService({
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  cdnUrl: process.env.S3_CDN_URL
});

// Upload with metadata and storage class
const result = await s3Storage.upload({
  file: req.file,
  key: 'documents/report-2024.pdf',
  metadata: {
    userId: '12345',
    uploadedBy: 'john@example.com',
    department: 'finance'
  },
  storageClass: 'STANDARD_IA', // Infrequent Access
  serverSideEncryption: 'AES256'
});`,
      language: "typescript"
    },
    {
      title: "Presigned URLs for Direct Upload",
      description: "Generate presigned URLs for secure direct browser uploads",
      code: `// Generate presigned URL for upload
const presignedUrl = await s3Storage.getPresignedUploadUrl({
  key: 'user-uploads/image-123.jpg',
  contentType: 'image/jpeg',
  expiresIn: 3600, // 1 hour
  conditions: [
    ['content-length-range', 0, 5242880] // Max 5MB
  ]
});

// Client-side upload using presigned URL
const formData = new FormData();
formData.append('file', file);

fetch(presignedUrl.url, {
  method: 'POST',
  body: formData
}).then(response => {
  console.log('Upload successful');
});`,
      language: "typescript"
    },
    {
      title: "S3 with CloudFront CDN",
      description: "Serve files through CloudFront for better performance",
      code: `// Configure S3 with CloudFront
const s3Storage = new S3StorageService({
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_REGION,
  cdnUrl: process.env.S3_CDN_URL,
  useCdnForPublicUrls: true
});

// URLs will use CloudFront domain
const fileUrl = s3Storage.getPublicUrl('images/photo.jpg');
// Returns: https://d1234567890.cloudfront.net/images/photo.jpg`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Access denied errors",
      solution: "Check IAM permissions and ensure the user has the required S3 actions for your bucket"
    },
    {
      problem: "CORS errors in browser uploads",
      solution: "Configure CORS policy on your S3 bucket to allow requests from your domain"
    },
    {
      problem: "Slow upload/download speeds",
      solution: "Use CloudFront CDN for faster delivery and consider multipart uploads for large files"
    }
  ]}
/>

## Cloudinary Integration

<AdapterGuide
  name="Cloudinary Media Management"
  command="npm run adapter install cloudinary"
  description="Advanced media management with automatic optimization, transformations, and CDN delivery"
  category="storage"
  envVars={[
    {
      name: "CLOUDINARY_CLOUD_NAME",
      description: "Your Cloudinary cloud name",
      required: true,
      example: "my-cloud-name"
    },
    {
      name: "CLOUDINARY_API_KEY",
      description: "Cloudinary API key from your dashboard",
      required: true,
      example: "123456789012345"
    },
    {
      name: "CLOUDINARY_API_SECRET",
      description: "Cloudinary API secret from your dashboard",
      required: true,
      example: "abcdefghijklmnopqrstuvwxyz123456"
    },
    {
      name: "CLOUDINARY_FOLDER",
      description: "Default folder for organizing uploads",
      required: false,
      example: "my-app",
      default: ""
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Create Cloudinary Account",
      description: "Sign up for a Cloudinary account and get your credentials"
    },
    {
      step: 2,
      title: "Get API Credentials",
      description: "Find your API credentials in the Cloudinary dashboard",
      code: `1. Go to Cloudinary Dashboard
2. Copy Cloud Name, API Key, and API Secret
3. Note: Keep API Secret secure and never expose it in client-side code`,
      language: "text"
    },
    {
      step: 3,
      title: "Configure Environment Variables",
      description: "Add Cloudinary credentials to your .env file",
      code: `CLOUDINARY_CLOUD_NAME=my-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
CLOUDINARY_FOLDER=my-app`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "Image Upload with Transformations",
      description: "Upload images with automatic optimization and transformations",
      code: `// services/storage/cloudinary.ts
import { CloudinaryService } from '@mifty/cloudinary';

const cloudinary = new CloudinaryService({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  folder: process.env.CLOUDINARY_FOLDER
});

// Upload with transformations
const result = await cloudinary.upload({
  file: req.file,
  publicId: 'user-avatar-123',
  transformations: [
    { width: 300, height: 300, crop: 'fill' },
    { quality: 'auto' },
    { format: 'auto' }
  ],
  tags: ['avatar', 'user-content']
});

console.log('Optimized image URL:', result.secure_url);`,
      language: "typescript"
    },
    {
      title: "Dynamic Image Transformations",
      description: "Generate different image sizes and formats on-the-fly",
      code: `// Generate multiple image variants
const baseImageUrl = 'https://res.cloudinary.com/my-cloud/image/upload/v1234567890/sample.jpg';

// Generate different sizes
const thumbnailUrl = cloudinary.url(baseImageUrl, {
  width: 150,
  height: 150,
  crop: 'thumb',
  gravity: 'face'
});

const mediumUrl = cloudinary.url(baseImageUrl, {
  width: 500,
  height: 300,
  crop: 'fill'
});

const webpUrl = cloudinary.url(baseImageUrl, {
  format: 'webp',
  quality: 'auto'
});

// Use in responsive images
const responsiveImage = \`
  <picture>
    <source srcset="\${webpUrl}" type="image/webp">
    <img src="\${mediumUrl}" 
         srcset="\${thumbnailUrl} 150w, \${mediumUrl} 500w"
         sizes="(max-width: 600px) 150px, 500px"
         alt="Responsive image">
  </picture>
\`;`,
      language: "typescript"
    },
    {
      title: "Video Upload and Processing",
      description: "Upload and process videos with Cloudinary",
      code: `// Upload video with processing
const videoResult = await cloudinary.uploadVideo({
  file: req.file,
  publicId: 'product-demo-video',
  transformations: [
    { quality: 'auto' },
    { format: 'mp4' },
    { width: 1280, height: 720, crop: 'limit' }
  ],
  eagerTransformations: [
    { width: 640, height: 360, format: 'mp4' }, // Mobile version
    { width: 1920, height: 1080, format: 'mp4' } // HD version
  ]
});

// Generate video thumbnail
const thumbnailUrl = cloudinary.url(videoResult.public_id, {
  resource_type: 'video',
  format: 'jpg',
  start_offset: '5s' // Thumbnail from 5 seconds
});`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Upload quota exceeded",
      solution: "Check your Cloudinary plan limits and upgrade if necessary, or implement image compression before upload"
    },
    {
      problem: "Transformation not applied",
      solution: "Verify transformation parameters are correct and supported by Cloudinary"
    },
    {
      problem: "Slow image loading",
      solution: "Use Cloudinary's auto format and quality features, and implement responsive images with srcset"
    }
  ]}
/>

## File Security and Best Practices

### Secure File Uploads

```typescript
// Implement comprehensive file validation
import { FileValidator } from '@mifty/storage-service';

const fileValidator = new FileValidator({
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  scanForMalware: true, // Enable virus scanning
  validateImageDimensions: {
    minWidth: 100,
    maxWidth: 4000,
    minHeight: 100,
    maxHeight: 4000
  }
});

// Validate before upload
const validation = await fileValidator.validate(req.file);
if (!validation.isValid) {
  return res.status(400).json({ 
    error: validation.errors 
  });
}
```

### Performance Optimization

```typescript
// Implement image optimization pipeline
const optimizeImage = async (file) => {
  const sharp = require('sharp');
  
  // Auto-optimize based on file type and size
  let optimized = sharp(file.buffer);
  
  if (file.size > 1024 * 1024) { // Files > 1MB
    optimized = optimized
      .resize(1920, 1080, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80 });
  }
  
  return optimized.toBuffer();
};
```

### Backup and Disaster Recovery

```typescript
// Implement cross-provider backup
const backupService = new BackupService({
  primary: 's3',
  backup: 'cloudinary',
  syncInterval: '24h'
});

// Automatic backup of critical files
await backupService.backup('user-documents/*');
```

## Monitoring and Analytics

### Storage Usage Tracking

```typescript
// Track storage usage and costs
const storageAnalytics = new StorageAnalytics({
  providers: ['s3', 'cloudinary'],
  trackMetrics: ['usage', 'costs', 'performance']
});

// Generate monthly reports
const report = await storageAnalytics.generateReport('monthly');
console.log('Storage costs:', report.totalCost);
console.log('Most accessed files:', report.topFiles);
```

## Next Steps

After setting up storage solutions, you might want to:

- [Configure authentication adapters](./authentication.md) for user file access control
- [Set up email services](./email-services.md) for file sharing notifications
- [Implement payment processing](./payment-processing.md) for premium storage features
- [Add AI services](./ai-services.md) for automatic file tagging and processing

## Migration Between Providers

When you need to migrate from one storage provider to another:

```bash
# Use the built-in migration tool
npm run storage:migrate --from=local --to=s3

# Migrate specific folders
npm run storage:migrate --from=local --to=s3 --folder=user-uploads

# Dry run to see what would be migrated
npm run storage:migrate --from=local --to=s3 --dry-run
```