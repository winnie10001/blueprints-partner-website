import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pageNames = ['index.html', 'services.html', 'worlds.html', 'journal.html', 'about.html', 'contact.html', 'privacy.html', 'cookies.html'];
const pageEntries = await Promise.all(
  pageNames.map(async (name) => [name, await readFile(resolve(root, name), 'utf8')]),
);
const pages = Object.fromEntries(pageEntries);
const allHtml = Object.values(pages).join('\n');
const [css, script] = await Promise.all([
  readFile(resolve(root, 'styles.css'), 'utf8'),
  readFile(resolve(root, 'script.js'), 'utf8'),
]);

for (const asset of ['blueprint-sculpture.png', 'brand-strategy-sculpture.png', 'operations-system-sculpture.png']) {
  await access(resolve(root, 'assets', asset));
}

for (const asset of ['logo-primary.svg', 'logo-primary-reverse.svg', 'logo-stacked.svg', 'symbol.svg', 'symbol-mono.svg', 'favicon.svg', 'logo-dimensional.png', 'logo-dimensional.webp', 'logo-primary.png', 'logo-stacked.png', 'symbol.png', 'social-icon.png', 'linkedin-personal-banner.html', 'linkedin-personal-banner.png', 'linkedin-company-banner.html', 'linkedin-company-banner.png', 'BRAND-GUIDE.md', 'brand-guide.html']) {
  await access(resolve(root, 'assets', 'brand', asset));
}

for (const asset of ['instrument-serif-regular.ttf', 'instrument-serif-italic.ttf', 'manrope-regular.ttf', 'manrope-semibold.ttf', 'manrope-bold.ttf']) {
  await access(resolve(root, 'assets', 'fonts', asset));
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

for (const asset of ['drip-sip-overhead.mp4', 'drip-sip-overhead-web.mp4', 'drip-sip-working.mp4', 'overtime-paper.mp4']) {
  await access(resolve(root, 'assets', 'video', asset));
}

for (const [name, html] of Object.entries(pages)) {
  for (const link of ['index.html', 'services.html', 'worlds.html', 'journal.html', 'about.html', 'contact.html']) {
    assert.ok(html.includes(`href="${link}"`), `${name} is missing navigation to ${link}`);
  }
  assert.match(html, /class="header-actions"/);
  assert.match(html, /title="Book a call"/);
  assert.match(html, /title="Fill the enquiry form"/);
  assert.match(html, /title="Send an email"/);
  assert.ok(!html.includes('data-menu-button'), `${name} must not contain a dropdown trigger`);
}

for (const phrase of [
  'Strategy, branding + execution <em>for founders &amp; creators.</em>',
  'Brand Strategy &amp; Identity',
  'Fractional Chief of Staff',
  'Scoped after enquiry',
  'Pay what feels right',
  'data-stripe-payment-link',
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
assert.match(pages['index.html'], /data-video-control/);
assert.match(pages['index.html'], /data-preview="chief-of-staff"/);
assert.match(pages['services.html'], /Three name recommendations/);
assert.match(pages['services.html'], /Up to five hours per week/);
assert.match(pages['services.html'], /Websites &amp; e-commerce/);
assert.match(pages['services.html'], /Selected AI workflows/);
assert.ok((pages['services.html'].match(/>Book now </g) || []).length >= 2, 'Each core service needs a Book now action');
assert.ok((pages['services.html'].match(/Request more information/g) || []).length >= 2, 'Each core service needs an information route');
assert.match(pages['services.html'], /The proposal confirms the payment schedule before work begins/);
assert.match(pages['journal.html'], /Why the brand work starts before the logo/);
assert.match(pages['journal.html'], /What a two-week Chief of Staff pilot should move/);
assert.match(pages['about.html'], /Clarity before output/);
assert.match(pages['contact.html'], /https:\/\/cal\.com\/blueprints-partner\/introductory-call/);
assert.match(pages['contact.html'], /mailto:info@blueprintspartner\.com/);
assert.match(pages['contact.html'], /data-enquiry-form/);
assert.match(pages['contact.html'], /data-endpoint="https:\/\/email-relay-mcp\.davidbanjo-cos\.workers\.dev\/api\/blueprint-enquiry"/);
assert.match(pages['contact.html'], /name="companySite"/);
assert.match(pages['contact.html'], /name="service"/);
assert.match(pages['contact.html'], /name="building"/);
assert.match(pages['contact.html'], /name="timeline"/);
assert.match(pages['worlds.html'], /data-worlds-belt/);
assert.ok((pages['worlds.html'].match(/class="world-tile/g) || []).length >= 20, 'Worlds needs at least 20 visual tiles');
assert.ok(!pages['worlds.html'].includes('Concept study'), 'Worlds must not label individual images as concept studies');
assert.match(pages['privacy.html'], /Duplicate-protection hashes are retained for seven days/i);
assert.match(pages['cookies.html'], /does not currently load Google Analytics, Meta Pixel/i);

assert.match(css, /@media\(max-width:760px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /\.is-visible/);
assert.match(css, /\[aria-selected="true"\]/);

assert.match(script, /aria-selected/);
assert.match(script, /IntersectionObserver/);
assert.match(script, /requestAnimationFrame/);
assert.match(script, /worldsBelts/);
assert.match(script, /videoObserver/);
assert.match(script, /fetch\(endpoint/);
assert.match(script, /Thank you\. We will contact you within 1–3 business days\./);
assert.ok(!script.includes('preparedMailto'), 'Form must not prepare an email in the customer browser');
assert.ok(!css.includes('.worlds-field:hover .worlds-belt'), 'Worlds motion must continue while hovering');
assert.match(css, /Instrument Serif/);
assert.match(css, /border-left:8px solid var\(--signal\)/);
assert.ok(!css.includes('letter-spacing:-'), 'Brand system must not use negative letter spacing');

console.log('Eight-page Blueprints Partner redesign verified.');
