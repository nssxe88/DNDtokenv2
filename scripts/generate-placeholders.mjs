#!/usr/bin/env node
/**
 * Generate placeholder SVG assets for the Asset Library.
 * These are simple geometric/decorative SVGs that serve as development placeholders.
 * Final artwork can replace these later.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT = join(import.meta.dirname, '..', 'public', 'assets');

// Ensure dirs exist
for (const dir of ['frames', 'borders', 'textures', 'icons', 'rings', 'thumbnails']) {
  mkdirSync(join(OUT, dir), { recursive: true });
}

const SIZE = 512;
const HALF = SIZE / 2;

function writeSVG(subpath, svgContent) {
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">${svgContent}</svg>`;
  writeFileSync(join(OUT, subpath), fullSvg);
  // Also write a thumbnail (same content, smaller is handled by browser)
  const name = subpath.split('/').pop().replace('.svg', '');
  writeFileSync(join(OUT, 'thumbnails', `${name}.svg`), fullSvg);
}

// ── FRAMES (6) ──────────────────────────────────────────────

// Gold Ornate Frame
writeSVG('frames/gold-ornate-01.svg', `
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="50%" stop-color="#DAA520"/>
      <stop offset="100%" stop-color="#B8860B"/>
    </linearGradient>
  </defs>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 4}" fill="none" stroke="url(#gold)" stroke-width="20"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 18}" fill="none" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 26}" fill="none" stroke="url(#gold)" stroke-width="2" stroke-dasharray="8 4"/>
`);

// Silver Ornate Frame
writeSVG('frames/silver-ornate-01.svg', `
  <defs>
    <linearGradient id="silver" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E8E8E8"/>
      <stop offset="50%" stop-color="#C0C0C0"/>
      <stop offset="100%" stop-color="#A0A0A0"/>
    </linearGradient>
  </defs>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 4}" fill="none" stroke="url(#silver)" stroke-width="20"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 18}" fill="none" stroke="url(#silver)" stroke-width="4"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 26}" fill="none" stroke="url(#silver)" stroke-width="2" stroke-dasharray="8 4"/>
`);

// Stone Frame
writeSVG('frames/stone-01.svg', `
  <defs>
    <linearGradient id="stone" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#8B8B83"/>
      <stop offset="50%" stop-color="#6B6B63"/>
      <stop offset="100%" stop-color="#4B4B43"/>
    </linearGradient>
  </defs>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 4}" fill="none" stroke="url(#stone)" stroke-width="24"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 20}" fill="none" stroke="#5B5B53" stroke-width="3"/>
`);

// Wood Frame
writeSVG('frames/wood-01.svg', `
  <defs>
    <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#8B6914"/>
      <stop offset="33%" stop-color="#A0742D"/>
      <stop offset="66%" stop-color="#8B6914"/>
      <stop offset="100%" stop-color="#6B4E0A"/>
    </linearGradient>
  </defs>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 4}" fill="none" stroke="url(#wood)" stroke-width="22"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 18}" fill="none" stroke="#6B4E0A" stroke-width="2"/>
`);

// Elvish Vine Frame
writeSVG('frames/elvish-vine-01.svg', `
  <defs>
    <linearGradient id="vine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2E8B57"/>
      <stop offset="50%" stop-color="#3CB371"/>
      <stop offset="100%" stop-color="#228B22"/>
    </linearGradient>
  </defs>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 4}" fill="none" stroke="url(#vine)" stroke-width="16"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 14}" fill="none" stroke="#228B22" stroke-width="3" stroke-dasharray="12 6"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 22}" fill="none" stroke="#3CB371" stroke-width="1.5" stroke-dasharray="4 8"/>
`);

// Dark/Infernal Frame
writeSVG('frames/dark-infernal-01.svg', `
  <defs>
    <linearGradient id="infernal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8B0000"/>
      <stop offset="50%" stop-color="#4A0000"/>
      <stop offset="100%" stop-color="#2A0000"/>
    </linearGradient>
  </defs>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 4}" fill="none" stroke="url(#infernal)" stroke-width="20"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 18}" fill="none" stroke="#FF4500" stroke-width="2"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 24}" fill="none" stroke="#8B0000" stroke-width="3" stroke-dasharray="3 6"/>
`);

// ── BORDERS (4) ─────────────────────────────────────────────

// Solid Colored Ring
writeSVG('borders/solid-ring-01.svg', `
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 8}" fill="none" stroke="#4A90D9" stroke-width="14"/>
`);

// Double Line Border
writeSVG('borders/double-line-01.svg', `
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 6}" fill="none" stroke="#D4AF37" stroke-width="6"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 20}" fill="none" stroke="#D4AF37" stroke-width="4"/>
`);

// Dashed Border
writeSVG('borders/dashed-01.svg', `
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 8}" fill="none" stroke="#A0A0A0" stroke-width="8" stroke-dasharray="20 10"/>
`);

// Gradient Glow Border
writeSVG('borders/gradient-glow-01.svg', `
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="80%" stop-color="transparent"/>
      <stop offset="90%" stop-color="#4FC3F7" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#29B6F6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF}" fill="url(#glow)"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF - 8}" fill="none" stroke="#4FC3F7" stroke-width="4"/>
`);

// ── TEXTURES (4) ────────────────────────────────────────────

// Parchment Texture
writeSVG('textures/parchment-01.svg', `
  <defs>
    <filter id="parchNoise">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
    </filter>
  </defs>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF}" fill="#D4C5A0" opacity="0.4"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF}" fill="#C4B590" opacity="0.2" filter="url(#parchNoise)"/>
`);

// Leather Texture
writeSVG('textures/leather-01.svg', `
  <defs>
    <filter id="leatherNoise">
      <feTurbulence type="turbulence" baseFrequency="0.08" numOctaves="3"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF}" fill="#6B4423" opacity="0.35"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF}" fill="#5A3A1A" opacity="0.15" filter="url(#leatherNoise)"/>
`);

// Stone Wall Texture
writeSVG('textures/stone-wall-01.svg', `
  <defs>
    <filter id="stoneNoise">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="5"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF}" fill="#7A7A72" opacity="0.35"/>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF}" fill="#6A6A62" opacity="0.2" filter="url(#stoneNoise)"/>
`);

// Dark Fabric Texture
writeSVG('textures/dark-fabric-01.svg', `
  <defs>
    <pattern id="fabric" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill="#1A1A2E"/>
      <rect x="0" y="0" width="4" height="4" fill="#16213E" opacity="0.5"/>
      <rect x="4" y="4" width="4" height="4" fill="#16213E" opacity="0.5"/>
    </pattern>
  </defs>
  <circle cx="${HALF}" cy="${HALF}" r="${HALF}" fill="url(#fabric)" opacity="0.4"/>
`);

// ── DnD CLASS ICONS (12) ────────────────────────────────────

const classIcons = [
  { name: 'fighter', symbol: '⚔', color: '#C0392B' },
  { name: 'wizard', symbol: '★', color: '#2980B9' },
  { name: 'rogue', symbol: '◆', color: '#2C3E50' },
  { name: 'cleric', symbol: '✚', color: '#F1C40F' },
  { name: 'ranger', symbol: '➤', color: '#27AE60' },
  { name: 'barbarian', symbol: '▲', color: '#E74C3C' },
  { name: 'bard', symbol: '♪', color: '#8E44AD' },
  { name: 'druid', symbol: '❋', color: '#16A085' },
  { name: 'monk', symbol: '☯', color: '#F39C12' },
  { name: 'paladin', symbol: '†', color: '#D4AF37' },
  { name: 'sorcerer', symbol: '✦', color: '#E91E63' },
  { name: 'warlock', symbol: '⬟', color: '#6C3483' },
];

for (const cls of classIcons) {
  writeSVG(`icons/class-${cls.name}-01.svg`, `
    <circle cx="${HALF}" cy="${HALF}" r="60" fill="${cls.color}" opacity="0.15"/>
    <circle cx="${HALF}" cy="${HALF}" r="50" fill="none" stroke="${cls.color}" stroke-width="3" opacity="0.5"/>
    <text x="${HALF}" y="${HALF + 18}" text-anchor="middle" font-size="64" fill="${cls.color}" opacity="0.7" font-family="serif">${cls.symbol}</text>
  `);
}

// ── COLOR RINGS (6) ─────────────────────────────────────────

const ringColors = [
  { name: 'red', color: '#E74C3C' },
  { name: 'blue', color: '#3498DB' },
  { name: 'green', color: '#2ECC71' },
  { name: 'yellow', color: '#F1C40F' },
  { name: 'purple', color: '#9B59B6' },
  { name: 'orange', color: '#E67E22' },
];

for (const ring of ringColors) {
  writeSVG(`rings/color-ring-${ring.name}-01.svg`, `
    <circle cx="${HALF}" cy="${HALF}" r="${HALF - 6}" fill="none" stroke="${ring.color}" stroke-width="10" opacity="0.85"/>
    <circle cx="${HALF}" cy="${HALF}" r="${HALF - 14}" fill="none" stroke="${ring.color}" stroke-width="2" opacity="0.4"/>
  `);
}

console.log('✅ Generated 32 placeholder assets');
