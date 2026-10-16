import { useState } from 'react';

// Extract the Instagram reel shortcode from an embed URL like:
// https://www.instagram.com/reel/DZGL-4kxhji/embed  →  DZGL-4kxhji
const getInstagramShortcode = (src) => {
  const match = src.match(/\/reel\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
};

// Build the thumbnail URL using the public oEmbed thumbnail endpoint fallback
// Instagram no longer serves thumbnails without login, so we show a styled card instead
const InstagramCard = ({ video, serviceTitle, index }) => {
  const shortcode = getInstagramShortcode(video.src);
  // Strip /embed from the src to get the watch URL
  const watchUrl = video.src.replace('/embed', '').replace(/\/$/, '');

  return (
    <a
      href={watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch ${video.title || `Instagram Reel ${index + 1}`} for ${serviceTitle} on Instagram`}
      className="group block w-full h-full relative overflow-hidden rounded-lg"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      {/* Gradient background art */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(255,100,130,0.5) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(130,100,255,0.4) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* Instagram gradient ring */}
      <div
        className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          padding: '2px',
        }}
        aria-hidden="true"
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{ background: '#1a1a2e' }}
        >
          {/* Instagram camera icon */}
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
      </div>

      {/* Reel play button — centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="white"
            className="w-7 h-7 ml-1"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {video.title && (
          <p className="text-white text-sm font-semibold text-center px-4 max-w-[80%] leading-snug">
            {video.title}
          </p>
        )}
        {video.description && (
          <p className="text-white/60 text-xs text-center">{video.description}</p>
        )}
      </div>

      {/* "Watch on Instagram" hover CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}
        aria-hidden="true"
      >
        <span
          className="text-xs tracking-widest uppercase font-semibold"
          style={{
            background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Watch on Instagram ↗
        </span>
      </div>

      {/* Reel tag */}
      <div
        className="absolute top-4 right-4 px-2 py-1 rounded text-white text-[10px] tracking-widest uppercase font-bold"
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}
        aria-hidden="true"
      >
        Reel
      </div>
    </a>
  );
};

export const VideoEmbed = ({ video, serviceTitle, index }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Instagram: render a clean link card instead of a broken iframe
  if (video.type === 'instagram') {
    return (
      <div
        className="w-full max-w-[340px] mx-auto relative overflow-hidden rounded-xl"
        style={{ aspectRatio: '9/16' }}
      >
        <InstagramCard video={video} serviceTitle={serviceTitle} index={index} />
      </div>
    );
  }

  const isPdf = video.type === 'pdf';
  const isWeb = video.type === 'website';

  return (
    <div
      className={`w-full bg-black/5 relative overflow-hidden ${isPdf ? 'aspect-[3/4]' : 'aspect-video'}`}
      style={{ backgroundColor: 'var(--bg-overlay)' }}
    >
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-overlay)' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Loading...</span>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-overlay)' }}>
          <div className="text-center p-4">
            <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Unable to load item</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>It may be private or unavailable</p>
          </div>
        </div>
      )}

      {video.type === 'youtube' ? (
        <iframe
          className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          src={`${video.src}${video.src.includes('?') ? '&' : '?'}autoplay=0&rel=0&modestbranding=1`}
          title={video.title || `${serviceTitle} - Video ${index + 1}`}
          frameBorder="0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          aria-label={`Video ${index + 1} for ${serviceTitle}`}
        />
      ) : video.type === 'drive' ? (
        <iframe
          className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          src={video.src}
          title={video.title || `${serviceTitle} - Video ${index + 1}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          onLoad={handleLoad}
          onError={handleError}
          aria-label={`Video ${index + 1} for ${serviceTitle}`}
        />
      ) : isPdf || isWeb ? (
        <iframe
          className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          src={video.src}
          title={video.title || `${serviceTitle} - Embed ${index + 1}`}
          frameBorder="0"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups"
          onLoad={handleLoad}
          onError={handleError}
          aria-label={`Embed ${index + 1} for ${serviceTitle}`}
        />
      ) : null}
    </div>
  );
};
