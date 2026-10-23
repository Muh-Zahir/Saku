const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Copy favicon.svg to public/
const rootFavicon = path.join(__dirname, '..', 'favicon.svg');
const publicFavicon = path.join(publicDir, 'favicon.svg');
if (fs.existsSync(rootFavicon)) {
  fs.copyFileSync(rootFavicon, publicFavicon);
}

// Standard full-bleed SVG for icons
const standardSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#134e3f"/>
  <g transform="translate(64, 64) scale(8)">
    <circle cx="24" cy="24" r="13" stroke="#2dd4bf" stroke-width="2.5" opacity="0.4" fill="none"/>
    <path d="M19 28C19 23.0294 23.0294 19 28 19C28 23.9706 23.9706 28 19 28Z" fill="#34d399"/>
    <path d="M23 19C23 15.134 26.134 12 30 12C30 15.866 26.866 19 23 19Z" fill="#a7f3d0"/>
    <path d="M17 26V30C17 31.6569 18.3431 33 20 33H27" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </g>
</svg>
`;

// Maskable SVG with safe margin for Android adaptive icon cropping (safe zone is 80% circle)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#134e3f"/>
  <g transform="translate(102.4, 102.4) scale(6.4)">
    <circle cx="24" cy="24" r="13" stroke="#2dd4bf" stroke-width="2.5" opacity="0.4" fill="none"/>
    <path d="M19 28C19 23.0294 23.0294 19 28 19C28 23.9706 23.9706 28 19 28Z" fill="#34d399"/>
    <path d="M23 19C23 15.134 26.134 12 30 12C30 15.866 26.866 19 23 19Z" fill="#a7f3d0"/>
    <path d="M17 26V30C17 31.6569 18.3431 33 20 33H27" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </g>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  const standardBuffer = Buffer.from(standardSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  for (const size of sizes) {
    await sharp(standardBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  // Apple touch icon (180x180)
  await sharp(standardBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Also put one at public/apple-touch-icon.png for iOS auto-detection
  await sharp(standardBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Maskable icons
  await sharp(maskableBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192-maskable.png'));
  console.log('Generated icon-192-maskable.png');

  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512-maskable.png'));
  console.log('Generated icon-512-maskable.png');

  console.log('All PWA icons generated successfully!');
}

generate().catch(console.error);
