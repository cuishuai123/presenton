// Quick verification script for PostCSS installation
const fs = require('fs');
const path = require('path');

const postcssPath = path.join(__dirname, 'node_modules', 'postcss');
const tailwindPath = path.join(__dirname, 'node_modules', 'tailwindcss');
const autoprefixerPath = path.join(__dirname, 'node_modules', 'autoprefixer');
const postcssConfigPath = path.join(__dirname, 'postcss.config.cjs');

console.log('Checking PostCSS setup...');
console.log('postcss exists:', fs.existsSync(postcssPath));
console.log('tailwindcss exists:', fs.existsSync(tailwindPath));
console.log('autoprefixer exists:', fs.existsSync(autoprefixerPath));
console.log('postcss.config.cjs exists:', fs.existsSync(postcssConfigPath));

if (fs.existsSync(postcssPath)) {
  try {
    const postcss = require(postcssPath);
    console.log('✓ postcss can be required');
  } catch (e) {
    console.error('✗ postcss require failed:', e.message);
  }
}

if (fs.existsSync(postcssConfigPath)) {
  try {
    const config = require(postcssConfigPath);
    console.log('✓ postcss.config.cjs can be loaded:', JSON.stringify(config, null, 2));
  } catch (e) {
    console.error('✗ postcss.config.cjs load failed:', e.message);
  }
}

