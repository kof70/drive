/**
 * Script to copy extension assets for VS Code extension packaging
 * 
 * This script prepares the dist folder for vsce packaging:
 * 1. Copies package.extension.json as package.json to root (for vsce)
 * 2. Verifies server and client builds exist
 * 3. Creates a placeholder icon if missing
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

/**
 * Recursively copy a directory
 */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Error: Source directory does not exist: ${src}`);
    process.exit(1);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Copy a single file
 */
function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Error: Source file does not exist: ${src}`);
    process.exit(1);
  }

  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(src, dest);
  console.log(`  ✓ ${path.relative(rootDir, src)} -> ${path.relative(rootDir, dest)}`);
}


/**
 * Create a simple placeholder icon (1x1 transparent PNG)
 */
function createPlaceholderIcon(dest) {
  // Minimal 1x1 transparent PNG
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  fs.writeFileSync(dest, pngData);
  console.log(`  ✓ Created placeholder icon at ${path.relative(rootDir, dest)}`);
}

/**
 * Verify required build artifacts exist
 */
function verifyBuilds() {
  const required = [
    { path: 'dist/server/index.js', name: 'Server build' },
    { path: 'dist/client/index.html', name: 'Client build' },
    { path: 'dist/extension/extension.js', name: 'Extension build' },
  ];

  let allExist = true;
  for (const item of required) {
    const fullPath = path.join(rootDir, item.path);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✓ ${item.name} found`);
    } else {
      console.error(`  ✗ ${item.name} missing: ${item.path}`);
      allExist = false;
    }
  }

  return allExist;
}

console.log('\n📦 Preparing extension assets for packaging...\n');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run build first.');
  process.exit(1);
}

// Verify all builds exist
console.log('Verifying builds:');
if (!verifyBuilds()) {
  console.error('\nError: Missing required builds. Run the following commands:');
  console.error('  pnpm build          # Build server and client');
  console.error('  pnpm build:extension # Build extension');
  process.exit(1);
}

console.log('\nCopying assets:');

// Copy package.extension.json to dist/package.json for the extension
copyFile(
  path.join(rootDir, 'package.extension.json'),
  path.join(distDir, 'package.json')
);

// Create placeholder icon if it doesn't exist
const iconPath = path.join(distDir, 'icon.png');
if (!fs.existsSync(iconPath)) {
  createPlaceholderIcon(iconPath);
}

// Create LICENSE file
const licenseDest = path.join(distDir, 'LICENSE');
const licenseContent = `MIT License

Copyright (c) ${new Date().getFullYear()} Local Collaborative Workspace

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
fs.writeFileSync(licenseDest, licenseContent);
console.log(`  ✓ LICENSE created`);

// Create .vscodeignore for the dist folder
const vscodeignoreDest = path.join(distDir, '.vscodeignore');
const vscodeignoreContent = `# Exclude source maps in production
*.map
*.d.ts
*.d.ts.map

# Exclude test files
**/__tests__/**
**/__mocks__/**
*.test.js
*.spec.js
`;
fs.writeFileSync(vscodeignoreDest, vscodeignoreContent);
console.log(`  ✓ .vscodeignore created`);

// Create a simple README for the extension
const readmeDest = path.join(distDir, 'README.md');
const extensionReadme = `# Local Collaborative Workspace

Real-time collaborative canvas for local networks - share files, notes, and organize content visually without internet connectivity.

## Features

- **Visual Canvas**: Interactive infinite canvas with drag-and-drop
- **Real-time Collaboration**: Multi-user synchronization via WebSocket
- **Cross-platform**: Works on desktop, mobile, and tablet browsers
- **Local Network**: No internet dependency - works on your LAN
- **File Sharing**: Share files, notes, folders, and images

## Usage

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run "Local Workspace: Start Server"
3. Run "Local Workspace: Open Canvas" to view in VS Code
4. Share the URL with colleagues on your local network

## Commands

- **Local Workspace: Start Server** - Start the collaboration server
- **Local Workspace: Stop Server** - Stop the server
- **Local Workspace: Restart Server** - Restart the server
- **Local Workspace: Open Canvas** - Open the canvas in VS Code
- **Local Workspace: Copy URL** - Copy server URL to clipboard
- **Local Workspace: Show QR Code** - Display QR code for mobile access

## Settings

- \`localWorkspace.port\`: Server port (default: 8080)
- \`localWorkspace.autoStart\`: Auto-start server on VS Code launch
- \`localWorkspace.storagePath\`: Storage directory path

## Security Note

This extension is designed for trusted local networks only. Do not expose to the internet.
`;
fs.writeFileSync(readmeDest, extensionReadme);
console.log(`  ✓ Extension README.md created`);

console.log('\n✅ Extension assets prepared successfully!');
console.log('\nNext steps:');
console.log('  cd dist && vsce package --no-dependencies');
console.log('  # or: pnpm package:extension');
