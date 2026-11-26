import { useState, useEffect } from 'react';
import SocialCarouselCard from './SocialCarouselCard';

export default function CampaignModal({ campaign, onClose, onImageClick, onFilterGrid }) {
  const [formatTab, setFormatTab] = useState('all');

  useEffect(() => {
    setFormatTab('all');
  }, [campaign?.id]);

  if (!campaign) return null;

  const carousels = campaign.carousels || [];
  const posters = campaign.posters || [];
  const hasBoth = carousels.length > 0 && posters.length > 0;
  const showCarousels = formatTab === 'all' || formatTab === 'carousels';
  const showPosters = formatTab === 'all' || formatTab === 'posters';

  const posterSlides = posters.map((p) => ({
    image: p.src,
    title: p.title,
  }));

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-xl animate-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${campaign.title} campaign deliverables`}
    >
      <div
        className="w-full max-w-6xl max-h-[88vh] rounded-3xl border flex flex-col overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)]"
        style={{
          borderColor: 'var(--border-hover)',
          backgroundColor: 'var(--modal-bg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div
          className="px-5 py-4 sm:px-7 sm:py-5 border-b shrink-0"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[9px] tracking-[0.2em] uppercase font-bold bg-yellow-400 text-black">
                  <span>✦</span> {campaign.badge}
                </span>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-lg border font-semibold"
                  style={{ borderColor: 'var(--border-hover)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}
                >
                  {campaign.metricsLabel}
                </span>
              </div>

              <h3
                className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                {campaign.title}
              </h3>
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {campaign.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {campaign.visitUrl && (
                <a
                  href={campaign.visitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold border transition-all hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
                  style={{ borderColor: 'var(--border-hover)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}
                >
                  <span>Visit Site</span>
                  <span>↗</span>
                </a>
              )}
              {onFilterGrid && (
                <button
                  type="button"
                  onClick={() => onFilterGrid(campaign.id)}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold bg-yellow-400 text-black hover:bg-yellow-300 transition-colors cursor-pointer"
                >
                  Filter Below ↓
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all hover:border-yellow-400 hover:bg-yellow-400 hover:text-black cursor-pointer"
                style={{ borderColor: 'var(--border-hover)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}
                aria-label="Close campaign viewer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description + Format Tabs Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-3">
            <p className="text-xs sm:text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {campaign.description}
            </p>

            {hasBoth && (
              <div
                className="inline-flex items-center gap-1 p-1 rounded-xl border shrink-0 self-start sm:self-end"
                style={{ borderColor: 'var(--border-hover)', backgroundColor: 'var(--bg-card)' }}
              >
                {[
                  { id: 'all', label: `All (${carousels.length + posters.length})` },
                  { id: 'carousels', label: `Carousels (${carousels.length})` },
                  { id: 'posters', label: `Posters (${posters.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFormatTab(tab.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      formatTab === tab.id
                        ? 'bg-yellow-400 text-black font-bold shadow-sm'
                        : 'hover:opacity-80'
                    }`}
                    style={formatTab === tab.id ? {} : { color: 'var(--text-secondary)' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Deliverables Viewport */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-8">
          {showCarousels && carousels.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-xs font-mono uppercase tracking-[0.2em] font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-yellow-400 text-black text-[10px]">✦</span>
                  <span>Swipeable Carousel Decks ({carousels.length})</span>
                </p>
                <span className="text-[11px] hidden sm:inline" style={{ color: 'var(--text-tertiary)' }}>
                  Swipe or click any slide to inspect fullscreen
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {carousels.map((carousel) => (
                  <SocialCarouselCard
                    key={carousel.id}
                    carousel={carousel}
                    onImageClick={onImageClick}
                  />
                ))}
              </div>
            </div>
          )}

          {showPosters && posters.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-xs font-mono uppercase tracking-[0.2em] font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-yellow-400 text-black text-[10px]">✦</span>
                  <span>Static Ad Creatives &amp; Posters ({posters.length})</span>
                </p>
                <span className="text-[11px] hidden sm:inline" style={{ color: 'var(--text-tertiary)' }}>
                  Click any creative to zoom &amp; cycle all {posters.length}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {posters.map((poster, pIdx) => (
                  <button
                    key={poster.id || pIdx}
                    type="button"
                    onClick={() =>
                      onImageClick &&
                      onImageClick({
                        src: poster.src,
                        alt: poster.title,
                        title: `${campaign.title} — Creatives`,
                        slides: posterSlides,
                        initialIndex: pIdx,
                      })
                    }
                    className="group/card text-left rounded-2xl border p-3 flex flex-col gap-2.5 transition-all duration-200 hover:border-yellow-400/60 hover:-translate-y-0.5 cursor-pointer"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}
                  >
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/40 border" style={{ borderColor: 'var(--border-color)' }}>
                      <img
                        src={poster.src}
                        alt={poster.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                          Inspect ↗
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      {poster.badge && (
                        <span className="inline-block text-[9px] font-mono uppercase tracking-wider font-bold text-yellow-400 mb-0.5">
                          {poster.badge}
                        </span>
                      )}
                      <h4
                        className="text-xs font-bold leading-snug line-clamp-2 group-hover/card:text-yellow-400 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {poster.title}
                      </h4>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
