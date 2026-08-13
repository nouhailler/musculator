// Generates PWA icon PNGs from a single source SVG. Run with: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const ACCENT = '#9184d9';
const BG = '#161826';

function iconSvg({ size, padding }) {
  const inner = size - padding * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <g transform="translate(${padding},${padding})">
    <svg width="${inner}" height="${inner}" viewBox="0 0 24 24" fill="none">
      <path d="M2 9v6M5 7v10M19 7v10M22 9v6" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round"/>
      <path d="M5 12h14" stroke="${ACCENT}" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="6.4" y="9.4" width="2.6" height="5.2" rx="1" fill="${ACCENT}"/>
      <rect x="15" y="9.4" width="2.6" height="5.2" rx="1" fill="${ACCENT}"/>
    </svg>
  </g>
</svg>`;
}

mkdirSync('public/icons', { recursive: true });

const targets = [
  { file: 'public/icons/icon-192.png', size: 192, padding: 40 },
  { file: 'public/icons/icon-512.png', size: 512, padding: 104 },
  { file: 'public/icons/maskable-192.png', size: 192, padding: 30 },
  { file: 'public/icons/maskable-512.png', size: 512, padding: 80 },
  { file: 'public/icons/apple-touch-icon.png', size: 180, padding: 30 },
];

for (const t of targets) {
  await sharp(Buffer.from(iconSvg(t))).png().toFile(t.file);
  console.log('wrote', t.file);
}

// standalone favicon (transparent-ish, just the mark on bg square) reuse 192
await sharp(Buffer.from(iconSvg({ size: 64, padding: 12 }))).png().toFile('public/favicon.png');
console.log('wrote public/favicon.png');
