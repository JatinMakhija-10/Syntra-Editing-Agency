export function smoothScrollTo(elem, duration = 450, headerOffset = 72) {
  const target = typeof elem === 'string' ? document.querySelector(elem) : elem;
  if (!target) return;

  const start = window.pageYOffset;
  const rawTop = target.getBoundingClientRect().top + start;
  const targetPosition = Math.max(0, rawTop - headerOffset);
  const startTime = performance.now();

  const ease = (t) => 1 - Math.pow(1 - t, 3); // ease-out-cubic

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const easeProgress = ease(progress);
    window.scrollTo(0, start + (targetPosition - start) * easeProgress);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

export function scrollToTop(duration = 400) {
  const start = window.pageYOffset;
  if (start <= 2) {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    return;
  }
  const startTime = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    window.scrollTo(0, start * (1 - ease(progress)));
    if (progress < 1) requestAnimationFrame(step);
  }

  if (window.location.pathname !== '/' || window.location.hash) {
    window.history.pushState({}, '', '/');
  }
  requestAnimationFrame(step);
}

// Handle anchor link clicks with clean shareable URLs
export function handleSmoothScroll(e) {
  const href = e.currentTarget.getAttribute('href');
  if (href === '#') {
    e.preventDefault();
    scrollToTop();
    return;
  }
  if (href && href.startsWith('#')) {
    e.preventDefault();
    const sectionName = href.replace(/^#/, '');
    if (sectionName && window.location.pathname !== `/${sectionName}`) {
      window.history.pushState({}, '', `/${sectionName}`);
    }
    const target = document.querySelector(href);
    if (target) {
      smoothScrollTo(target, 450);
    }
  }
}

