export function smoothScrollTo(elem, duration = 500) {
  const target = typeof elem === 'string' ? document.querySelector(elem) : elem;
  if (!target) return;

  const start = window.pageYOffset;
  const targetPosition = target.getBoundingClientRect().top + start;
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

// Handle anchor link clicks with clean shareable URLs
export function handleSmoothScroll(e) {
  const href = e.currentTarget.getAttribute('href');
  if (href && href.startsWith('#')) {
    e.preventDefault();
    const sectionName = href.replace(/^#/, '');
    if (sectionName && window.location.pathname !== `/${sectionName}`) {
      window.history.pushState({}, '', `/${sectionName}`);
    }
    const target = document.querySelector(href);
    if (target) {
      smoothScrollTo(target, 500);
    }
  }
}

