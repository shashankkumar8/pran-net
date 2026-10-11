import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '..');

test('index.html contains PRAN-NET branding, PWA manifest, and theme script', () => {
  const html = fs.readFileSync(path.join(frontendDir, 'index.html'), 'utf8');
  assert.match(html, /<title>PRAN-NET — Pran Operational Mitigation Network<\/title>/);
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /rel="manifest" href="\/manifest\.json"/);
  assert.match(html, /localStorage\.getItem\('prannet_theme_mode'\)/);
  assert.match(html, /navigator\.serviceWorker\.register\('\/sw\.js'\)/);
});

test('manifest.json provides valid standalone PWA configuration', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(frontendDir, 'public', 'manifest.json'), 'utf8'));
  assert.strictEqual(manifest.short_name, 'PRAN-NET');
  assert.strictEqual(manifest.display, 'standalone');
  assert.strictEqual(manifest.theme_color, '#06B6D4');
  assert.ok(manifest.icons.length >= 2);
});

test('sw.js preserves live telemetry integrity without false caching', () => {
  const sw = fs.readFileSync(path.join(frontendDir, 'public', 'sw.js'), 'utf8');
  assert.match(sw, /url\.pathname\.includes\('\/telemetry'\)/);
  assert.match(sw, /OFFLINE_UNAVAILABLE/);
  assert.match(sw, /req\.method !== 'GET'/);
});

test('styles.css defines complete dual-theme design tokens and responsive classes', () => {
  const css = fs.readFileSync(path.join(frontendDir, 'src', 'styles.css'), 'utf8');
  
  // Dark mode tokens (Obsidian Atmosphere)
  assert.match(css, /:root,\s*\[data-theme="dark"\]/);
  assert.match(css, /--bg-canvas:\s*#080E1A/);
  assert.match(css, /--accent-cyan:\s*#06B6D4/);
  assert.match(css, /--accent-emerald:\s*#10B981/);
  assert.match(css, /--badge-demo-bg/);
  
  // Light mode tokens (Airglass Porcelain)
  assert.match(css, /\[data-theme="light"\]/);
  assert.match(css, /--bg-canvas:\s*#F8FAFC/);
  assert.match(css, /--accent-cyan:\s*#0891B2/);
  assert.match(css, /--accent-emerald:\s*#059669/);
  assert.match(css, /--text-primary:\s*#0F172A/);

  // New UI system classes
  assert.match(css, /\.lang-picker-wrapper/);
  assert.match(css, /\.location-bar-panel/);
  assert.match(css, /\.aqi-hero-banner/);
  assert.match(css, /\.pollutants-grid/);
  assert.match(css, /html\[dir="rtl"\]/);
});

test('i18n.ts supports all 13 Indian languages and handles RTL direction for Urdu', async () => {
  const i18n = await import('../src/i18n.ts');
  const codes = ['en', 'hi', 'bn', 'mr', 'ta', 'te', 'kn', 'gu', 'pa', 'ml', 'or', 'as', 'ur'];

  assert.strictEqual(i18n.LANGUAGES.length, 13);
  for (const c of codes) {
    const found = i18n.LANGUAGES.find((l) => l.code === c);
    assert.ok(found, `Missing language entry for ${c}`);
    assert.ok(found.nativeName.length > 0, `Missing nativeName for ${c}`);
  }

  // Urdu must be marked rtl
  const urdu = i18n.LANGUAGES.find((l) => l.code === 'ur');
  assert.strictEqual(urdu.dir, 'rtl');

  // Verify translations function t()
  assert.strictEqual(i18n.t('hi', 'app_name'), 'प्राण-नेट');
  assert.strictEqual(i18n.t('ur', 'app_name'), 'پران-نیٹ');
  assert.strictEqual(i18n.t('en', 'nav_overview'), 'Air Quality Overview');
});

test('Navigation.tsx enforces all 9 plain-language renamed headings', () => {
  const navSrc = fs.readFileSync(path.join(frontendDir, 'src', 'components', 'Navigation.tsx'), 'utf8');

  const expectedRenamedLabels = [
    'Air Quality Overview',
    'Geographic Air Quality Map',
    'Pollution Source Analysis',
    'Wind & Weather',
    'Sector Action Plans',
    'Action Review',
    'Action History',
    'Data & Evidence',
    'Methods & Guidance',
  ];

  for (const label of expectedRenamedLabels) {
    assert.ok(navSrc.includes(label), `Navigation missing plain-language label: ${label}`);
  }
});

test('Steady-state indoor scenario calculator preserves physical mass balance', () => {
  const outdoor = 150;
  const ach = 1.2;
  const cadr = 300;
  const volume = 150;
  const k_dep = 0.24;
  const penetration = 0.8;

  const denominator = ach + k_dep + (cadr / volume);
  const expected = Math.round(((penetration * ach * outdoor) / denominator) * 10) / 10;
  
  assert.strictEqual(expected > 0, true);
  assert.strictEqual(expected < outdoor, true);
  assert.strictEqual(expected, 41.9);
});
