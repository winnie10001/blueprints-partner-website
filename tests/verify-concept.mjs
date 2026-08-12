import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pageNames = ['index.html', 'services.html', 'worlds.html', 'journal.html', 'about.html', 'contact.html'];
const pageEntries = await Promise.all(
  pageNames.map(async (name) => [name, await readFile(resolve(root, name), 'utf8')]),
);
const pages = Object.fromEntries(pageEntries);
const allHtml = Object.values(pages).join('\n');
const [css, script] = await Promise.all([
  readFile(resolve(root, 'styles.css'), 'utf8'),
  readFile(resolve(root, 'script.js'), 'utf8'),
]);

for (const asset of [
  'blueprint-sculpture.png',
  'brand-strategy-sculpture.png',
  'operations-system-sculpture.png',
  'logo-transparent.png',
]) {
  await access(resolve(root, 'assets', asset));
}

for (const asset of [
  'wellness-packaging.webp',
  'identity-print.webp',
  'orange-package.webp',
  'creator-portrait.webp',
  'digital-storefront.webp',
  'founder-studio.webp',
  'beverage-object.webp',
  'beauty-packaging.webp',
  'campaign-posters.webp',
  'fashion-materials.webp',
  'artist-book.webp',
  'dts-cut-paste-tube.webp',
  'dts-glossed-soap.webp',
  'dts-glossed-cherries.webp',
  'dts-skin-deep-dropper.webp',
  'dts-dainty-scissors.webp',
  'dts-eat-rich-cherries.webp',
  'dts-girl-next-door.webp',
  'dts-reform-materials.webp',
  'dts-reform-still-life.webp',
  'dts-silver-hour.webp',
]) {
  await access(resolve(root, 'assets', 'worlds', asset));
}

for (const asset of ['drip-sip-overhead.mp4', 'drip-sip-working.mp4', 'overtime-paper.mp4']) {
  await access(resolve(root, 'assets', 'video', asset));
}

for (const [name, html] of Object.entries(pages)) {
  for (const link of ['index.html', 'services.html', 'worlds.html', 'journal.html', 'about.html', 'contact.html']) {
    assert.ok(html.includes(`href="${link}"`), `${name} is missing navigation to ${link}`);
  }
  assert.match(html, /data-menu-button/);
  assert.match(html, /data-mobile-nav/);
  assert.match(html, /class="header-actions"/);
  assert.match(html, /title="Book a call"/);
  assert.match(html, /title="Send an email"/);
}

for (const phrase of [
  'STRATEGY, BRANDING + EXECUTION FOR FOUNDERS &amp; CREATORS.',
  'Brand Strategy &amp; Identity',
  'Fractional Chief of Staff',
  '$1,500',
  '$599',
  '$500',
  'Custom quote',
  'Inside an Engagement',
]) {
  assert.ok(allHtml.includes(phrase), `Missing required copy: ${phrase}`);
}

for (const phrase of [
  'First 3 bookings',
  'First 2 pilots',
  'Client: fictional',
  'Countries reached',
  'Powered by',
  'DLVD',
  'Our team',
  'Madrid / Working internationally',
]) {
  assert.ok(!allHtml.includes(phrase), `Forbidden or unsupported copy found: ${phrase}`);
}

assert.match(pages['index.html'], /data-preview="brand"/);
assert.match(pages['index.html'], /data-preview="chief-of-staff"/);
assert.match(pages['services.html'], /Three name recommendations/);
assert.match(pages['services.html'], /Up to five hours per week/);
assert.match(pages['services.html'], /Websites &amp; e-commerce/);
assert.match(pages['services.html'], /Selected AI workflows/);
assert.match(pages['journal.html'], /Why the brand work starts before the logo/);
assert.match(pages['journal.html'], /What a two-week Chief of Staff pilot should move/);
assert.match(pages['about.html'], /Clarity before output/);
assert.match(pages['contact.html'], /https:\/\/cal\.com\/blueprints-partner\/introductory-call/);
assert.match(pages['contact.html'], /mailto:info@blueprintspartner\.com/);
assert.match(pages['contact.html'], /data-enquiry-form/);
assert.match(pages['contact.html'], /name="service"/);
assert.match(pages['contact.html'], /name="building"/);
assert.match(pages['contact.html'], /name="timeline"/);
assert.match(pages['worlds.html'], /data-worlds-belt/);
assert.ok((pages['worlds.html'].match(/class="world-tile/g) || []).length >= 20, 'Worlds needs at least 20 visual tiles');
assert.ok(!pages['worlds.html'].includes('Concept study'), 'Worlds must not label individual images as concept studies');

assert.match(css, /@media \(max-width: 700px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /\.is-visible/);
assert.match(css, /\[aria-selected="true"\]/);

assert.match(script, /aria-expanded/);
assert.match(script, /aria-selected/);
assert.match(script, /IntersectionObserver/);
assert.match(script, /requestAnimationFrame/);
assert.match(script, /worldsBelts/);
assert.match(script, /videoObserver/);
assert.match(script, /preparedMailto/);
assert.match(script, /mailto:info@blueprintspartner\.com/);
assert.ok(!css.includes('.worlds-field:hover .worlds-belt'), 'Worlds motion must continue while hovering');

console.log('Six-page Blueprints Partner concept verified.');
