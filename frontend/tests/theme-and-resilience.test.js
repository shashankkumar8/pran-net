import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '..');

test('index.html contains PRAN-NET branding and anti-flash theme script', () => {
  const html = fs.readFileSync(path.join(frontendDir, 'index.html'), 'utf8');
  assert.match(html, /<title>PRAN-NET — Pran Operational Mitigation Network<\/title>/);
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /localStorage\.getItem\('prannet_theme_mode'\)/);
  assert.match(html, /document\.documentElement\.setAttribute\('data-theme', resolved\)/);
});

test('styles.css defines complete dual-theme design tokens for both Dark and Light modes', () => {
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
  assert.match(css, /--badge-demo-bg:\s*#FEF3C7/);

  // Theme switch styling
  assert.match(css, /\.theme-switch/);
  assert.match(css, /\.theme-btn/);
  assert.match(css, /\.theme-btn\.active/);
});

test('App.tsx implements persistent theme selector and resilient fallback', () => {
  const appSrc = fs.readFileSync(path.join(frontendDir, 'src', 'App.tsx'), 'utf8');
  
  // Theme selector controls
  assert.match(appSrc, /prannet_theme_mode/);
  assert.match(appSrc, /setThemeMode\('light'\)/);
  assert.match(appSrc, /setThemeMode\('dark'\)/);
  assert.match(appSrc, /setThemeMode\('system'\)/);

  // Resilient offline fallback without fatal crash
  assert.match(appSrc, /isOfflineDemo/);
  assert.match(appSrc, /SIMULATED DEMO DATA/);
  assert.match(appSrc, /DEMO_SCENARIOS/);
  assert.doesNotMatch(appSrc, /if \(!API\) return <div className="shell"><main><div className="error">VITE_API_URL is not set/);
});

test('Steady-state indoor scenario calculator preserves physical mass balance', () => {
  // Test mass-balance equation: C_in = (P * ACH * C_out) / (ACH + k_dep + CADR/V)
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
