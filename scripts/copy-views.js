#!/usr/bin/env node

/**
 * Cross-platform script to copy views directory to dist
 * Replaces the need for shell cp -R command
 */

const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'backend', 'views');
const dest = path.join(__dirname, '..', 'dist', 'views');

function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
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

try {
  copyDir(src, dest);
  console.log('✓ Views copied successfully');
} catch (error) {
  console.error('Error copying views:', error);
  process.exit(1);
}
