const fs = require('fs');
const path = require('path');

function createIconSVG(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4F46E5"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size/4}" fill="white" text-anchor="middle" dominant-baseline="middle">🍳</text>
  <text x="50%" y="75%" font-family="Arial" font-size="${size/8}" fill="white" text-anchor="middle" dominant-baseline="middle">Recipe</text>
</svg>`;
}

const sizes = [192, 512];
const publicDir = path.join(__dirname, 'public');

sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `pwa-${size}x${size}.svg`;
  fs.writeFileSync(path.join(publicDir, filename), svg);
  console.log(`✓ Créé ${filename}`);
});

console.log('\n⚠️  IMPORTANT: Ces icônes sont des placeholders SVG.');
console.log('Pour la production, créez des vraies icônes PNG avec vos designs.');
console.log('Voir public/PWA-ICONS-README.md pour plus d\'informations.\n');
