#!/usr/bin/env node

/**
 * Generate PNG icons from SVG for PWA
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, 'public', 'icon.svg');
const svgBuffer = readFileSync(svgPath);

const sizes = [
  { name: 'icon-16.png', size: 16 },
  { name: 'icon-32.png', size: 32 },
  { name: 'icon-180.png', size: 180 }, // Apple touch icon
  { name: 'icon-192.png', size: 192 }, // Android
  { name: 'icon-512.png', size: 512 }, // Android maskable
  { name: 'favicon.ico', size: 32 },   // ICO format for legacy browsers
];

async function generateIcons() {
  console.log('Generating PNG icons from SVG...');

  for (const { name, size } of sizes) {
    try {
      const outputPath = join(__dirname, 'public', name);
      const format = name.endsWith('.ico') ? 'png' : 'png';

      await sharp(svgBuffer)
        .resize(size, size)
        [format]()
        .toFile(outputPath);

      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\nIcon generation complete!');
}

generateIcons().catch(console.error);
