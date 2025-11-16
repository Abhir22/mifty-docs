#!/usr/bin/env node

/**
 * Deployment script for Mifty Documentation
 * Handles build optimization, asset compression, and deployment preparation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const STATIC_DIR = path.join(BUILD_DIR, 'assets');

console.log('🚀 Starting deployment preparation...');

// Step 1: Clean previous build
console.log('🧹 Cleaning previous build...');
if (fs.existsSync(BUILD_DIR)) {
  execSync(`rm -rf ${BUILD_DIR}`, { stdio: 'inherit' });
}

// Step 2: Build the site
console.log('🔨 Building documentation site...');
execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

// Step 3: Optimize assets
console.log('⚡ Optimizing assets...');

// Compress images (if imagemin is available)
try {
  const imagemin = require('imagemin');
  const imageminPngquant = require('imagemin-pngquant');
  const imageminMozjpeg = require('imagemin-mozjpeg');
  const imageminSvgo = require('imagemin-svgo');

  const optimizeImages = async () => {
    const files = await imagemin([`${BUILD_DIR}/**/*.{jpg,jpeg,png,svg}`], {
      destination: BUILD_DIR,
      plugins: [
        imageminMozjpeg({ quality: 85 }),
        imageminPngquant({ quality: [0.6, 0.8] }),
        imageminSvgo({
          plugins: [
            { name: 'removeViewBox', active: false },
            { name: 'cleanupIDs', active: false },
          ],
        }),
      ],
    });
    console.log(`✅ Optimized ${files.length} images`);
  };

  optimizeImages().catch(() => {
    console.log('⚠️  Image optimization skipped (imagemin not available)');
  });
} catch (error) {
  console.log('⚠️  Image optimization skipped (imagemin not available)');
}

// Step 4: Generate additional performance files
console.log('📊 Generating performance files...');

// Create robots.txt if it doesn't exist
const robotsPath = path.join(BUILD_DIR, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  const robotsContent = `User-agent: *
Allow: /

Sitemap: https://mifty.dev/sitemap.xml
`;
  fs.writeFileSync(robotsPath, robotsContent);
  console.log('✅ Generated robots.txt');
}

// Create .htaccess for Apache servers
const htaccessPath = path.join(BUILD_DIR, '.htaccess');
const htaccessContent = `# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Enable browser caching
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType application/x-shockwave-flash "access plus 1 month"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

# Redirect HTTP to HTTPS
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
`;
fs.writeFileSync(htaccessPath, htaccessContent);
console.log('✅ Generated .htaccess');

// Step 5: Generate build report
console.log('📋 Generating build report...');
const buildReport = {
  timestamp: new Date().toISOString(),
  buildSize: getBuildSize(BUILD_DIR),
  files: getFileList(BUILD_DIR),
  performance: {
    buildTime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
  },
};

fs.writeFileSync(
  path.join(BUILD_DIR, 'build-report.json'),
  JSON.stringify(buildReport, null, 2)
);

console.log('✅ Deployment preparation complete!');
console.log(`📦 Build size: ${formatBytes(buildReport.buildSize)}`);
console.log(`📁 Total files: ${buildReport.files.length}`);
console.log(`⏱️  Build time: ${buildReport.performance.buildTime.toFixed(2)}s`);

// Helper functions
function getBuildSize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getBuildSize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}

function getFileList(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      getFileList(filePath, fileList);
    } else {
      fileList.push({
        path: path.relative(BUILD_DIR, filePath),
        size: stats.size,
        type: path.extname(file),
      });
    }
  }
  
  return fileList;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}