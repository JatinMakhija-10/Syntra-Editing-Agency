import { useState, useEffect, useCallback } from 'react';

export default function LightboxModal({ item, onClose }) {
  if (!item) return null;

  // Determine if this is a carousel with multiple slides
  const isCarousel = Array.isArray(item.slides) && item.slides.length > 0;
  const slides = isCarousel ? item.slides : [{ image: item.src, title: item.alt || item.title || '' }];
  const [activeIdx, setActiveIdx] = useState(item.initialIndex || 0);
  const [touchStartX, setTouchStartX] = useState(null);

  // Sync if initialIndex changes
  useEffect(() => {
    if (typeof item.initialIndex === 'number') {
      setActiveIdx(item.initialIndex);
    } else {
      setActiveIdx(0);
    }
  }, [item]);

  const currentSlide = slides[activeIdx] || slides[0];

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Touch Swipe for mobile gestures
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  // Keyboard navigation: Escape to close, Left/Right for slides
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (isCarousel && e.key === 'ArrowRight') {
        handleNext();
      } else if (isCarousel && e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCarousel, handleNext, handlePrev, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-5 md:p-6 bg-black/94 backdrop-blur-xl select-none animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between gap-3 w-full max-w-5xl mx-auto z-10 py-1 sm:py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 pr-2">
          {isCarousel ? (
            <div className="flex items-center gap-2">
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider text-yellow-400 bg-yellow-400/10 border border-yellow-400/30">
                {activeIdx + 1} / {slides.length}
              </span>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {item.title || 'Carousel Deck'}
              </h3>
            </div>
          ) : (
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-white truncate max-w-[240px] sm:max-w-md">
              {item.alt || item.title || 'Image Preview'}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all hover:scale-105"
            aria-label="Close image viewer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Image Viewport with touch support */}
      <div
        className="relative flex-1 flex items-center justify-center min-h-0 py-1 max-w-5xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative max-h-full max-w-full flex items-center justify-center">
          <img
            src={currentSlide.image || currentSlide.src}
            alt={currentSlide.title || item.title || 'Slide'}
            className="max-h-[72vh] sm:max-h-[76vh] md:max-h-[80vh] w-auto max-w-full object-contain rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10"
          />

          {/* Left Arrow */}
          {isCarousel && slides.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-1.5 sm:left-2 md:-left-14 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white bg-black/75 hover:bg-yellow-400 hover:text-black border border-white/20 backdrop-blur-md transition-all hover:scale-110 shadow-2xl"
              aria-label="Previous slide (Left Arrow)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow */}
          {isCarousel && slides.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-1.5 sm:right-2 md:-right-14 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white bg-black/75 hover:bg-yellow-400 hover:text-black border border-white/20 backdrop-blur-md transition-all hover:scale-110 shadow-2xl"
              aria-label="Next slide (Right Arrow)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Thumbnails Dock (when carousel) */}
      {isCarousel && slides.length > 1 ? (
        <div
          className="w-full max-w-2xl mx-auto z-10 pt-2 flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative shrink-0 w-10 sm:w-12 md:w-14 aspect-[3/4] rounded-lg overflow-hidden border transition-all duration-200 ${
                activeIdx === idx
                  ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-105 opacity-100'
                  : 'border-white/10 opacity-50 hover:opacity-90 hover:border-white/30'
              }`}
            >
              <img
                src={s.image || s.src}
                alt={`Slide ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 text-[8px] font-bold text-center bg-black/80 text-white/90 py-0.5">
                {idx + 1}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-[11px] text-stone-500 py-1">
          Tap outside or press Escape to close
        </div>
      )}
    </div>
  );
}
