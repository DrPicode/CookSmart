import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createIconSVG(size) {
  const cornerRadius = size * 0.1; // 10% du rayon pour les coins arrondis
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#gradient)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size/2}" fill="white" text-anchor="middle" dominant-baseline="middle">🍳</text>
</svg>`;
}

const sizes = [192, 512];
const publicDir = path.join(__dirname, 'public');

for (const size of sizes) {
  const svg = createIconSVG(size);
  const filename = `pwa-${size}x${size}.svg`;
  fs.writeFileSync(path.join(publicDir, filename), svg);
  console.log(`✓ Créé ${filename}`);
}

console.log('\n⚠️  IMPORTANT: Ces icônes sont des placeholders SVG.');
console.log('Pour la production, créez des vraies icônes PNG avec vos designs.');
console.log('Voir public/PWA-ICONS-README.md pour plus d\'informations.\n');
