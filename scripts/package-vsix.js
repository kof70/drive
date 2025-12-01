/**
 * Script to package the VS Code extension as a .vsix file
 * 
 * This script runs vsce package from the dist directory
 * and moves the resulting .vsix file to the project root
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('\n📦 Packaging VS Code extension...\n');

// Verify dist/package.json exists
const packageJsonPath = path.join(distDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: dist/package.json not found. Run copy:extension-assets first.');
  process.exit(1);
}

try {
  // Run vsce package from dist directory using local installation
  console.log('Running vsce package...');
  const vscePath = path.join(rootDir, 'node_modules', '@vscode', 'vsce', 'vsce');
  const relativeVscePath = path.relative(distDir, vscePath);
  execSync(`node "${relativeVscePath}" package --allow-missing-repository`, {
    cwd: distDir,
    stdio: 'inherit'
  });

  // Find the generated .vsix file
  const files = fs.readdirSync(distDir);
  const vsixFile = files.find(f => f.endsWith('.vsix'));

  if (vsixFile) {
    // Move .vsix to root directory
    const srcPath = path.join(distDir, vsixFile);
    const destPath = path.join(rootDir, vsixFile);
    
    // Remove existing .vsix if present
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
    }
    
    fs.renameSync(srcPath, destPath);
    console.log(`\n✅ Extension packaged successfully: ${vsixFile}`);
    console.log(`\nTo install: code --install-extension ${vsixFile}`);
  } else {
    console.error('Error: No .vsix file generated');
    process.exit(1);
  }
} catch (error) {
  console.error('Error packaging extension:', error.message);
  process.exit(1);
}
