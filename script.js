document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const previewTabs = [...document.querySelectorAll('[data-preview]')];
const previewPanels = [...document.querySelectorAll('[data-preview-panel]')];
const heroObject = document.querySelector('[data-hero-object]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const ambientVideos = [...document.querySelectorAll('[data-ambient-video]')];
const worldsBelts = [...document.querySelectorAll('[data-worlds-belt]')];
const enquiryForm = document.querySelector('[data-enquiry-form]');
const heroVideo = document.querySelector('.hero-film');
const heroVideoControl = document.querySelector('[data-video-control]');
const stripePaymentLinks = [...document.querySelectorAll('[data-stripe-payment-link]')];

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

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

function updateVideoControl() {
  if (!heroVideo || !heroVideoControl) return;
  const paused = heroVideo.paused;
  heroVideoControl.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} background film`);
  heroVideoControl.querySelector('[data-video-control-label]').textContent = `${paused ? 'Play' : 'Pause'} film`;
}

if (heroVideo && heroVideoControl) {
  heroVideo.addEventListener('play', updateVideoControl);
  heroVideo.addEventListener('pause', updateVideoControl);
  heroVideo.addEventListener('canplay', () => {
    if (!reducedMotion.matches && heroVideo.paused) heroVideo.play().catch(updateVideoControl);
  });
  heroVideoControl.addEventListener('click', () => {
    if (heroVideo.paused) heroVideo.play().catch(updateVideoControl);
    else heroVideo.pause();
  });
  updateVideoControl();
}

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

    heroObject.style.transform = `translate3d(${current.x}px, ${current.y + current.scroll}px, 0) rotateX(${current.y * -0.08}deg) rotateY(${current.x * 0.08}deg)`;

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

  enquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!enquiryForm.reportValidity()) return;

    const button = enquiryForm.querySelector('button[type="submit"]');
    const status = enquiryForm.querySelector('[data-form-status]');
    const payload = Object.fromEntries(new FormData(enquiryForm));
    const endpoint = enquiryForm.dataset.endpoint;

    button.disabled = true;
    status.hidden = false;
    status.dataset.state = '';
    status.textContent = 'Sending your enquiry...';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'We could not send your enquiry. Please try again or email us directly.');
      }

      enquiryForm.reset();
      status.dataset.state = 'success';
      status.textContent = 'Thank you. We will contact you within 1–3 business days.';
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error.message || 'We could not send your enquiry. Please try again or email us directly.';
    } finally {
      button.disabled = false;
    }
  });
}

stripePaymentLinks.forEach((link) => {
  const isPlaceholder = link.href.includes('YOUR_PAYMENT_LINK');
  if (!isPlaceholder) return;

  link.removeAttribute('target');
  link.removeAttribute('rel');
  link.href = 'contact.html?service=pay-what-you-want#enquiry-form';
  link.querySelector('strong').textContent = 'Request payment link →';
});
