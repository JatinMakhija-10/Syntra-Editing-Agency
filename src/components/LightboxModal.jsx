import { useState, useEffect, useCallback } from 'react';

export default function LightboxModal({ item, onClose }) {
  if (!item) return null;

  // Determine if this is a carousel with multiple slides
  const isCarousel = Array.isArray(item.slides) && item.slides.length > 0;
  const slides = isCarousel ? item.slides : [{ image: item.src, title: item.alt || item.title || '' }];
  const [activeIdx, setActiveIdx] = useState(item.initialIndex || 0);

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
      className="fixed inset-0 z-50 flex flex-col justify-between p-4 md:p-6 bg-black/92 backdrop-blur-xl select-none animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between gap-4 w-full max-w-5xl mx-auto z-10 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {isCarousel ? (
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider text-yellow-400 bg-yellow-400/10 border border-yellow-400/30">
                Slide {activeIdx + 1} of {slides.length}
              </span>
              <h3 className="text-sm md:text-base font-bold text-white truncate max-w-md">
                {item.title || 'Carousel Deck'}
              </h3>
            </div>
          ) : (
            <h3 className="text-sm md:text-base font-bold text-white truncate max-w-md">
              {item.alt || item.title || 'Image Preview'}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          {item.folderLink && (
            <a
              href={item.folderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-wider uppercase font-bold text-stone-300 hover:text-yellow-400 border border-white/10 hover:border-yellow-400/50 bg-white/5 transition-all"
            >
              <span>Drive Folder</span>
              <span>↗</span>
            </a>
          )}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all hover:scale-105"
            aria-label="Close image viewer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        className="relative flex-1 flex items-center justify-center min-h-0 py-2 max-w-5xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-full max-w-full flex items-center justify-center">
          <img
            src={currentSlide.image || currentSlide.src}
            alt={currentSlide.title || item.title || 'Slide'}
            className="max-h-[75vh] md:max-h-[80vh] w-auto max-w-full object-contain rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10"
          />

          {/* Left Arrow */}
          {isCarousel && slides.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 md:-left-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white bg-black/70 hover:bg-yellow-400 hover:text-black border border-white/20 backdrop-blur-md transition-all hover:scale-110 shadow-2xl"
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
              className="absolute right-2 md:-right-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white bg-black/70 hover:bg-yellow-400 hover:text-black border border-white/20 backdrop-blur-md transition-all hover:scale-110 shadow-2xl"
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
          className="w-full max-w-2xl mx-auto z-10 pt-2 flex items-center justify-center gap-2 overflow-x-auto pb-1"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative shrink-0 w-11 md:w-14 aspect-[3/4] rounded-lg overflow-hidden border transition-all duration-200 ${
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
        <div className="text-center text-xs text-stone-500 py-1">
          Click outside or press Escape to close
        </div>
      )}
    </div>
  );
}
