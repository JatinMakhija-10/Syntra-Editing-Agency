import { useEffect, useRef } from 'react';

export function useReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Check for reduced motion preference
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          
          if (prefersReducedMotion) {
            // Skip animation for reduced motion
            entry.target.classList.add('is-visible');
          } else {
            // Use requestAnimationFrame for smoother animation
            requestAnimationFrame(() => {
              entry.target.classList.add('is-visible');
            });
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    observer.observe(el);

    return () => {
      if (el) observer.disconnect();
    };
  }, [options]);

  return ref;
}

