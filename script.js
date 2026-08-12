document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileNav = document.querySelector('[data-mobile-nav]');
const previewTabs = [...document.querySelectorAll('[data-preview]')];
const previewPanels = [...document.querySelectorAll('[data-preview-panel]')];
const heroObject = document.querySelector('[data-hero-object]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const ambientVideos = [...document.querySelectorAll('[data-ambient-video]')];
const worldsBelts = [...document.querySelectorAll('[data-worlds-belt]')];
const enquiryForm = document.querySelector('[data-enquiry-form]');

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

function setMenu(open) {
  if (!menuButton || !mobileNav) return;

  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav.hidden = !open;
  document.body.classList.toggle('menu-open', open);

  if (open) {
    mobileNav.querySelector('a')?.focus();
  }
}

menuButton?.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || menuButton?.getAttribute('aria-expanded') !== 'true') return;
  setMenu(false);
  menuButton.focus();
});

function activatePreview(name, moveFocus = false) {
  previewTabs.forEach((tab) => {
    const active = tab.dataset.preview === name;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && moveFocus) tab.focus();
  });

  previewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.previewPanel !== name;
  });
}

previewTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activatePreview(tab.dataset.preview));

  tab.addEventListener('keydown', (event) => {
    let nextIndex = null;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % previewTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + previewTabs.length) % previewTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = previewTabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    activatePreview(previewTabs[nextIndex].dataset.preview, true);
  });
});

const revealElements = [...document.querySelectorAll('.reveal')];

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px' });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

if (heroObject && !reducedMotion.matches) {
  const current = { x: 0, y: 0, scroll: 0 };
  const target = { x: 0, y: 0, scroll: 0 };
  let frameId = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function animateHero() {
    current.x += (target.x - current.x) * 0.1;
    current.y += (target.y - current.y) * 0.1;
    current.scroll += (target.scroll - current.scroll) * 0.1;

    heroObject.style.transform = `translate3d(${current.x}px, ${current.y + current.scroll}px, 0) scale(1.035)`;

    const moving = Math.abs(target.x - current.x) > 0.08
      || Math.abs(target.y - current.y) > 0.08
      || Math.abs(target.scroll - current.scroll) > 0.08;

    frameId = moving ? requestAnimationFrame(animateHero) : 0;
  }

  function requestHeroFrame() {
    if (!frameId) frameId = requestAnimationFrame(animateHero);
  }

  window.addEventListener('pointermove', (event) => {
    target.x = ((event.clientX / window.innerWidth) - 0.5) * 12;
    target.y = ((event.clientY / window.innerHeight) - 0.5) * 8;
    requestHeroFrame();
  }, { passive: true });

  document.querySelector('.hero')?.addEventListener('pointerleave', () => {
    target.x = 0;
    target.y = 0;
    requestHeroFrame();
  });

  window.addEventListener('scroll', () => {
    target.scroll = clamp(window.scrollY * -0.035, -28, 0);
    requestHeroFrame();
  }, { passive: true });
}

worldsBelts.forEach((belt) => {
  const originalSet = belt.querySelector('.worlds-belt-set');
  if (!originalSet) return;

  const duplicateSet = originalSet.cloneNode(true);
  duplicateSet.setAttribute('aria-hidden', 'true');
  duplicateSet.querySelectorAll('img').forEach((image) => image.alt = '');
  duplicateSet.querySelectorAll('video').forEach((video) => video.removeAttribute('data-ambient-video'));
  belt.append(duplicateSet);
});

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;

      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.15 });

  ambientVideos.forEach((video) => videoObserver.observe(video));
} else {
  ambientVideos.forEach((video) => video.pause());
}

if (enquiryForm) {
  const serviceSelect = enquiryForm.elements.service;
  const requestedService = new URLSearchParams(window.location.search).get('service');
  const requestedOption = [...serviceSelect.options].find(
    (option) => option.dataset.serviceKey === requestedService,
  );

  if (requestedOption) serviceSelect.value = requestedOption.value;

  enquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!enquiryForm.reportValidity()) return;

    const data = new FormData(enquiryForm);
    const subject = `Blueprints Partner enquiry: ${data.get('service')}`;
    const body = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Service: ${data.get('service')}`,
      `Timeline: ${data.get('timeline')}`,
      `Website or social link: ${data.get('link') || 'Not provided'}`,
      '',
      'What I am building:',
      data.get('building'),
      '',
      'What feels stuck, unclear or urgent:',
      data.get('stuck') || 'Not provided',
    ].join('\n');
    const mailto = `mailto:info@blueprintspartner.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    enquiryForm.dataset.preparedMailto = mailto;
    enquiryForm.querySelector('[data-form-status]').hidden = false;
    window.location.href = mailto;
  });
}
