import React, { useState } from 'react';

export default function SocialCarouselCard({ carousel, onImageClick, compact = false }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  if (!carousel || !carousel.slides || carousel.slides.length === 0) {
    return null;
  }

  const slides = carousel.slides;
  const currentSlide = slides[currentIdx] || slides[0];

  const nextSlide = (e) => {
    if (e) e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (e) => {
    if (e) e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 28) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  const openFullscreen = (e) => {
    if (e) e.stopPropagation();
    if (onImageClick) {
      onImageClick({
        src: currentSlide.image,
        alt: `${carousel.title} - Slide ${currentIdx + 1}`,
        slides: carousel.slides,
        initialIndex: currentIdx,
        title: carousel.title,
      });
    }
  };

  return (
    <div
      className="rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-colors hover:border-stone-500 group/card"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--bg-card)',
      }}
    >
      {/* Top Header */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 mb-2">
          {carousel.subtitle || `${slides.length}-Slide Deck`}
        </span>
        <h4
          className="text-base font-semibold leading-snug"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {carousel.title}
        </h4>
      </div>

      {/* Slide Container (Aspect 3/4) */}
      <div
        className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border cursor-pointer select-none group/slide"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={openFullscreen}
      >
        <img
          src={currentSlide.image}
          alt={`${carousel.title} - Slide ${currentIdx + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />

        {/* Top Badges: Slide counter & Expand */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wider text-white bg-black/75 backdrop-blur-md border border-white/10 shadow-sm">
            Slide {currentIdx + 1} of {slides.length}
          </span>
          <button
            type="button"
            className="pointer-events-auto p-1.5 rounded text-white/90 hover:text-yellow-400 bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/10 transition-colors shadow-sm"
            title="Read in fullscreen viewer"
            onClick={openFullscreen}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-white bg-black/75 hover:bg-yellow-400 hover:text-black border border-white/15 backdrop-blur-md transition-colors opacity-90 md:opacity-0 group-hover/slide:opacity-100 shadow-lg"
          aria-label="Previous slide"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-white bg-black/75 hover:bg-yellow-400 hover:text-black border border-white/15 backdrop-blur-md transition-colors opacity-90 md:opacity-0 group-hover/slide:opacity-100 shadow-lg"
          aria-label="Next slide"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Bottom Slide Dots */}
        <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1 pointer-events-none">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 pointer-events-auto">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIdx(dotIdx);
                }}
                className={`transition-colors rounded-sm ${
                  dotIdx === currentIdx
                    ? 'w-4 h-1 bg-yellow-400'
                    : 'w-1 h-1 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {!compact && (
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {slides.map((slide, thumbIdx) => (
            <button
              key={thumbIdx}
              type="button"
              onClick={() => setCurrentIdx(thumbIdx)}
              className={`relative shrink-0 w-11 md:w-12 aspect-[3/4] rounded-lg overflow-hidden border transition-all duration-200 ${
                thumbIdx === currentIdx
                  ? 'border-yellow-400 ring-2 ring-yellow-400/40 scale-105'
                  : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/40'
              }`}
            >
              <img
                src={slide.image}
                alt={`Thumb ${thumbIdx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute bottom-0 inset-x-0 text-[8px] font-bold text-center bg-black/75 text-white/90 py-0.5">
                {thumbIdx + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Action footer */}
      <div className="mt-3.5 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border-color)' }}>
        <span style={{ color: 'var(--text-tertiary)' }}>
          {slides.length} slides in this deck
        </span>
        <button
          type="button"
          onClick={openFullscreen}
          className="font-bold text-yellow-400 hover:underline inline-flex items-center gap-1 transition-all"
        >
          <span>Read Full Deck</span>
          <span>↗</span>
        </button>
      </div>
    </div>
  );
}
