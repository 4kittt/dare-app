#!/usr/bin/env node

/**
 * Pixel Art Processing Demo for DareUp
 * Using tilf (https://github.com/danterolle/tilf)
 *
 * This script demonstrates how to apply pixel art effects to DareUp visuals
 * Safe usage: Offline processing only, results saved as static assets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import tilf - using dynamic import for flexibility
let tilf;
try {
  const tilfModule = await import('tilf');
  tilf = tilfModule.default || tilfModule;
} catch (error) {
  console.log('tilf not installed. Using simulation mode for demo...');
  tilf = null;
}

/**
 * Pixel art processing settings for DareUp's social theme
 */
const pixelSettings = {
  socialFriendly: {
    blockSize: 6,
    colorPalette: 'pastel',
    subtleEffect: true,
  },
  vintageBorder: {
    blockSize: 8,
    colorPalette: 'monochrome',
    subtleEffect: false,
  },
  modernIcon: {
    blockSize: 4,
    colorPalette: 'colorful',
    subtleEffect: true,
  }
};

/**
 * Process an image with pixel art effect
 */
async function pixelateImage(inputPath, outputPath, settings) {
  if (!tilf) {
    console.log(`⚠️  SIMULATING: ${inputPath} → ${outputPath}`);
    console.log(`   Applied pixel effect: ${settings.blockSize}px blocks, ${settings.colorPalette} palette`);
    return `simulated_${path.basename(outputPath)}`;
  }

  try {
    const imageBuffer = fs.readFileSync(inputPath);

    // Apply tilf pixelation
    const processedImage = await tilf.process(imageBuffer, {
      blockSize: settings.blockSize,
      palette: settings.colorPalette,
      subtle: settings.subtleEffect
    });

    // Save processed image
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, processedImage);
    console.log(`✅ Processed: ${inputPath} → ${outputPath}`);
    return outputPath;

  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
    return null;
  }
}

/**
 * Create pixelated versions of DareUp's key visual elements
 */
async function createDareUpPixelAssets() {
  console.log('🎨 DareUp Pixel Art Processing Demo\n');

  // Define assets to pixelate
  const assetsToProcess = [
    // Icons (assuming they exist in public folder)
    { name: 'heart-icon', settings: pixelSettings.modernIcon },
    { name: 'star-icon', settings: pixelSettings.socialFriendly },
    { name: 'badge-icon', settings: pixelSettings.socialFriendly },
    { name: 'connect-icon', settings: pixelSettings.vintageBorder },
    { name: 'hero-pattern', settings: pixelSettings.socialFriendly, inputExt: 'svg' }
  ];

  const processedAssets = [];

  for (const asset of assetsToProcess) {
    const inputFile = asset.name + (asset.inputExt ? `.${asset.inputExt}` : '.png');
    const outputFile = `${asset.name}-pixelated.png`;

    // Assume input files are in the base directory or create dummy paths
    const inputPath = path.join(__dirname, '..', 'public', inputFile);

    if (fs.existsSync(inputPath)) {
      // Real processing
      const result = await pixelateImage(inputPath, path.join(__dirname, outputFile), asset.settings);
      if (result) processedAssets.push(result);
    } else {
      // Simulation for demo
      const simulatedResult = await pixelateImage(inputPath, outputFile, asset.settings);
      processedAssets.push(simulatedResult || outputFile);
    }
  }

  console.log('\n📋 Processed Assets Summary:');
  processedAssets.forEach(asset => console.log(`   • ${asset}`));

  console.log('\n💡 Usage in DareUp components:');
  console.log(`   import heartIcon from '../../pixel-assets/heart-icon-pixelated.png'`);
  console.log(`   <img src={heartIcon} alt="heart" className="pixelated-element" />`);

  return processedAssets;
}

/**
 * Generate CSS classes for pixelated elements
 */
function generatePixelCSS() {
  const css = `
/* DareUp Pixel Art Effects */
.pixelated-element {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.pixelated-social {
  filter: contrast(1.1) brightness(1.05);
  transition: filter 0.2s ease;
}

.pixelated-hover:hover {
  transform: scale(1.02);
  filter: brightness(1.1);
}`;

  const cssPath = path.join(__dirname, 'pixelated-styles.css');
  fs.writeFileSync(cssPath, css);
  console.log(`🎨 Generated CSS: ${cssPath}`);
  return cssPath;
}

/**
 * Create usage documentation
 */
function createUsageGuide(assets) {
  const guide = `# DareUp Pixel Art Assets

This folder contains pixelated versions of DareUp's visual elements, processed for optimal display on mobile and web platforms.

## Generated Assets

${assets.map(asset => `- \`${asset}\` - Pixelated version for social theme`).join('\n')}

## Implementation Examples

### React Component Usage
\`\`\`typescript
import pixelatedHeart from '../pixel-assets/heart-icon-pixelated.png';

export function PixelavaComponent() {
  return (
    <div className="pixelated-element">
      <img
        src={pixelatedHeart}
        alt="Social connection"
        className="pixelated-social pixelated-hover"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
\`\`\`

### CSS Styling
Apply pixelated rendering and subtle effects using the generated CSS classes.

## Processing Details
- Block size: 4-8px (optimized for mobile display)
- Color preservation: Maintained social-friendly palette
- Performance: Static assets, zero runtime processing

## Attributidön

Pixel art processing powered by tilf - https://github.com/danterolle/tilf (MIT License)
`;

  const guidePath = path.join(__dirname, 'README-pixel-art.md');
  fs.writeFileSync(guidePath, guide);
  console.log(`📖 Generated documentation: ${guidePath}`);
  return guidePath;
}

// Main execution
async function main() {
  console.log('🚀 Starting DareUp Pixel Art Processing...\n');

  // Create pixelated assets
  const processedAssets = await createDareUpPixelAssets();

  // Generate supporting files
  const cssFile = generatePixelCSS();
  const docsFile = createUsageGuide(processedAssets);

  console.log('\n✨ Demo completed! Check generated files:');
  console.log(`   📁 ../../pixel-assets/ - Pixelated image assets`);
  console.log(`   🎨 ${path.basename(cssFile)} - CSS classes`);
  console.log(`   📖 ${path.basename(docsFile)} - Usage guide`);

  console.log('\n🎯 Ready for DareUp integration!');
}

export { createDareUpPixelAssets, generatePixelCSS };

// Run if called directly
if (import.meta.url === `file:///${process.argv[1]}`) {
  main().catch(console.error);
}
