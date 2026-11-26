import { useState, useEffect } from 'react';
import { VideoEmbed } from './VideoEmbed';
import { ThemeSwitch } from './ThemeSwitch';
import { slugify } from '../utils/slug';
import SocialCarouselCard from './SocialCarouselCard';

function GalleryCard({ item, idx, slides, serviceTitle, onImageClick, isThumbnails }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border cursor-pointer select-none transition-all duration-300 hover:border-yellow-400/60 hover:shadow-[0_12px_28px_rgba(255,209,0,0.08)] ${
        isThumbnails ? 'aspect-video' : 'aspect-[4/3]'
      } bg-stone-900/50`}
      style={{ borderColor: 'var(--border-color)' }}
      onClick={() =>
        onImageClick({
          src: item.image,
          alt: item.title || serviceTitle,
          title: item.title || serviceTitle,
          slides,
          initialIndex: idx,
        })
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onImageClick({
            src: item.image,
            alt: item.title || serviceTitle,
            title: item.title || serviceTitle,
            slides,
            initialIndex: idx,
          });
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View ${item.title || serviceTitle} - Image ${idx + 1}`}
    >
      {/* Shimmer skeleton while loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-white/[0.03] animate-pulse flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border border-yellow-400/20 border-t-yellow-400 animate-spin" />
        </div>
      )}

      {/* Main Image */}
      {!error ? (
        <img
          src={item.image}
          alt={item.title || `${serviceTitle} example ${idx + 1}`}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.04] ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : (
        /* Branded Fallback if image fails */
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-stone-950 border border-white/5">
          <span className="text-yellow-400 text-lg mb-1 font-bold">✦</span>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {item.title || serviceTitle}
          </p>
          <span className="text-[10px] tracking-wider uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Syntra Deliverable
          </span>
        </div>
      )}

      {/* Hover Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3.5"
      >
        <p className="text-xs font-semibold text-white leading-tight line-clamp-2">
          {item.title || `${serviceTitle} Deliverable ${idx + 1}`}
        </p>
        <span className="shrink-0 p-1.5 rounded-xl bg-yellow-400 text-black font-bold shadow-md ml-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export function ServicePage({
  service,
  category,
  theme,
  onToggleTheme,
  onBack,
  onImageClick,
  allServices = [],
  onSelectService,
  onOpenPalette,
  onSelectCategory,
}) {
  const [copied, setCopied] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [galleryBrandFilter, setGalleryBrandFilter] = useState('All');

  useEffect(() => {
    setGalleryBrandFilter('All');
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${service.title} | Syntra Studio`;
    return () => {
      document.title = 'Syntra - Editing Agency | Video, Design & Web Services';
    };
  }, [service.title]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const whatsappMessage = encodeURIComponent(
    service.isUpcoming
      ? `Hi Syntra, I would like to reserve an early access spot for ${service.title}.`
      : `Hi Syntra, I'm interested in your ${service.title} service. Can we discuss a project?`
  );
  const whatsappUrl = `https://wa.me/+918448865446?text=${whatsappMessage}`;

  const instagramVideos = (service.videoShowcase || []).filter(v => v.type === 'instagram');
  const otherVideos = (service.videoShowcase || []).filter(v => v.type !== 'instagram');

  // Sibling services in same category + global Previous/Next navigation
  const siblingServices = allServices.filter(s => s.category === category);
  const currentIndex = allServices.findIndex(s => s.title === service.title && s.category === category);
  const prevService = allServices.length > 1
    ? allServices[(currentIndex - 1 + allServices.length) % allServices.length]
    : null;
  const nextService = allServices.length > 1
    ? allServices[(currentIndex + 1) % allServices.length]
    : null;

  // Build quick media jump links for this page
  const sectionAnchors = [
    service.clientShowcases?.length > 0 && { id: 'sp-clients', label: `Client Showcases (${service.clientShowcases.length})` },
    service.carousels?.length > 0 && { id: 'sp-carousels', label: `Carousels (${service.carousels.length})` },
    service.webPreview?.length > 0 && { id: 'sp-web', label: `Live Demos (${service.webPreview.length})` },
    service.examples?.length > 0 && { id: 'sp-gallery', label: `Gallery (${service.examples.length})` },
    instagramVideos.length > 0 && { id: 'sp-reels', label: `Reels (${instagramVideos.length})` },
    otherVideos.length > 0 && { id: 'sp-videos', label: `Videos (${otherVideos.length})` },
  ].filter(Boolean);

  const jumpToAnchor = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 88;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden flex flex-col justify-between"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Ambient background glow blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #FFD100 0%, transparent 70%)', filter: 'blur(70px)' }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #FFD100 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
      </div>

      {/* ── TOP HEADER ── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-2xl transition-colors duration-300"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--header-bg)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 sm:gap-2 text-xs tracking-wider uppercase font-bold hover:text-yellow-400 transition-colors py-1.5 px-3 rounded-xl border shrink-0 cursor-pointer"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <span>←</span>
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Syntra Logo */}
            <button
              onClick={onBack}
              className="flex items-center focus:outline-none group cursor-pointer shrink-0"
              title="Return to Syntra Home"
            >
              <img src="/assets/syntra-logo.png" alt="Syntra" className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105" />
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs min-w-0" style={{ color: 'var(--text-tertiary)' }}>
              <span>/</span>
              <button
                type="button"
                onClick={() => (onSelectCategory ? onSelectCategory(category) : onBack())}
                className="text-[11px] tracking-widest uppercase font-bold text-yellow-400 hover:underline cursor-pointer shrink-0"
                title={`Browse all ${category} services`}
              >
                {category === 'AI_UGC' ? '✦ AI UGC' : category === 'AUTOMATION' ? '✦ AUTOMATION' : category}
              </button>
              <span>/</span>
              <span className="truncate max-w-[200px] font-bold" style={{ color: 'var(--text-primary)' }}>{service.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {onOpenPalette && (
              <button
                type="button"
                onClick={onOpenPalette}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors hover:border-yellow-400 hover:text-yellow-400 cursor-pointer"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                title="Quick Switch Services (Ctrl+K)"
              >
                <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Jump</span>
                <span className="kbd-key">⌘K</span>
              </button>
            )}

            {/* Share button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all duration-300 hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              title="Copy shareable link"
            >
              {copied ? (
                <>
                  <span className="text-green-400 font-bold">✓</span>
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share<span className="hidden sm:inline"> Page</span></span>
                </>
              )}
            </button>

            <ThemeSwitch theme={theme} onToggle={onToggleTheme} />

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shimmer hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs tracking-[0.14em] uppercase font-bold shadow-md hover:scale-105 transition-all duration-300"
            >
              Inquire Now →
            </a>
          </div>
        </div>

        {/* Scroll Progress Rail */}
        <div className="h-[2px] w-full bg-transparent overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-[width] duration-75"
            style={{ width: `${scrollPct}%` }}
          />
        </div>
      </header>

      {/* ── SIBLING SERVICE QUICK SWITCHER BAR ── */}
      {siblingServices.length > 1 && onSelectService && (
        <div
          className="border-b"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold shrink-0 mr-1" style={{ color: 'var(--text-tertiary)' }}>
              In {category === 'AI_UGC' ? 'AI UGC' : category}:
            </span>
            {siblingServices.map((sib) => {
              const isActive = sib.title === service.title;
              return (
                <button
                  key={sib.title}
                  type="button"
                  onClick={() => !isActive && onSelectService(sib.title, sib.category)}
                  className={`shrink-0 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-yellow-400 text-black border-yellow-400 shadow-sm'
                      : 'hover:border-yellow-400 hover:text-yellow-400'
                  }`}
                  style={
                    isActive
                      ? {}
                      : { borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }
                  }
                >
                  {sib.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── HERO BANNER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16 w-full flex-1">
        <div className="mb-10 md:mb-14 border-b pb-8 md:pb-12" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="pill-label">{service.tag || category}</div>
            {service.isUpcoming && (
              <span className="text-[10px] tracking-wider uppercase font-bold px-3 py-1 rounded-lg border border-yellow-400/40 bg-yellow-400/15 text-yellow-400 shadow-[0_0_16px_rgba(255,209,0,0.18)] flex items-center gap-1.5">
                <span>✦</span> UPCOMING DISCIPLINE · {service.upcomingBadge || 'EARLY ACCESS'} · {service.targetRelease || 'Q1 2027'}
              </span>
            )}
          </div>
          <h1
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-5 tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {service.title}
          </h1>
          <p
            className="text-sm sm:text-base md:text-xl font-light max-w-3xl leading-relaxed mb-6 md:mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            {service.desc}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shimmer w-full sm:w-auto text-center justify-center inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[11px] tracking-[0.2em] uppercase font-bold shadow-lg hover:scale-105 transition-all duration-300"
            >
              {service.isUpcoming ? 'Reserve Early Access on WhatsApp →' : 'Book on WhatsApp →'}
            </a>
            <div className="grid grid-cols-2 sm:flex items-center gap-2.5">
              <a
                href="mailto:jatinmakhija1005@gmail.com?subject=Inquiry%20regarding%20Syntra%20Services"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[11px] tracking-[0.15em] uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Email Us
              </a>
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] tracking-[0.15em] uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400 cursor-pointer"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                {copied ? '✓ Copied' : 'Share Link'}
              </button>
            </div>
          </div>

          {/* Quick Jump Anchors inside this service page */}
          {sectionAnchors.length > 1 && (
            <div className="mt-6 pt-5 border-t flex flex-wrap items-center gap-2" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold mr-1" style={{ color: 'var(--text-muted)' }}>
                On this page:
              </span>
              {sectionAnchors.map((anc) => (
                <button
                  key={anc.id}
                  type="button"
                  onClick={() => jumpToAnchor(anc.id)}
                  className="px-3 py-1 rounded-xl text-[11px] font-bold border transition-all hover:border-yellow-400 hover:text-yellow-400 cursor-pointer"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)', color: 'var(--text-primary)' }}
                >
                  {anc.label} ↓
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── AI UGC CLIENT SHOWCASES ── */}
        {service.clientShowcases?.length > 0 && (
          <section id="sp-clients" className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(255,209,0,0.3), transparent)' }} />
              <p className="eyebrow" style={{ color: 'var(--brand-yellow)' }}>Client Showcases</p>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(255,209,0,0.3), transparent)' }} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {service.clientShowcases.map((showcase, idx) => (
                <div key={idx} className="rounded-3xl border p-4 sm:p-6 md:p-8 relative overflow-hidden transition-all duration-300 hover:border-yellow-400/40"
                  style={{ borderColor: 'var(--border-color)', background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)` }}>
                  <div className="flex items-start justify-between mb-4 sm:mb-5">
                    <div>
                      <div className="pill-label mb-2 sm:mb-3 inline-flex">
                        AI Static Ads
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{showcase.client}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{showcase.clientDesc}</p>
                    </div>
                    {showcase.clientLink && !showcase.clientLink.includes('drive.google.com') && (
                      <a href={showcase.clientLink} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] tracking-[0.2em] uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400 hover:scale-105"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-overlay)' }}>
                        Visit site ↗
                      </a>
                    )}
                  </div>
                  {showcase.examples?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {showcase.examples.map((ex, exIdx) => (
                        <div key={exIdx} className="group/item relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer border transition-all duration-300 hover:border-yellow-400/60 hover:scale-[1.03]"
                          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}
                          onClick={() =>
                            onImageClick &&
                            onImageClick({
                              src: ex.image,
                              alt: ex.title || showcase.client,
                              title: `${showcase.client} Deliverables`,
                              slides: showcase.examples,
                              initialIndex: exIdx,
                            })
                          }
                          title={`Click to view: ${ex.title || showcase.client}`}>
                          <img src={ex.image} alt={ex.title || showcase.client} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end p-2.5">
                            <span className="text-[10px] font-semibold text-white leading-tight">
                              {ex.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl flex items-center justify-center min-h-[100px]"
                      style={{ background: 'var(--bg-overlay)', border: '1px dashed var(--border-color)' }}>
                      <div className="text-center py-6 px-4">
                        <p className="text-[9px] tracking-[0.3em] uppercase font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Ad creatives coming soon</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Static ad gallery will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SHOWCASE: MULTI-SLIDE SOCIAL CAROUSELS ── */}
        {service.carousels?.length > 0 && (
          <section id="sp-carousels" className="mb-16">
            <div className="mb-8">
              <div className="pill-label mb-2 inline-flex">
                ✦ Multi-Slide Narrative Creatives
              </div>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Interactive Social Carousels
              </h2>
              <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Swipe or use arrows to flip through multi-slide educational carousels engineered for high engagement and studio retention.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.carousels.map((carousel) => (
                <SocialCarouselCard
                  key={carousel.id}
                  carousel={carousel}
                  onImageClick={onImageClick}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── SHOWCASE: WEBSITE PREVIEWS ── */}
        {service.webPreview?.length > 0 && (
          <section id="sp-web" className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="eyebrow mb-2">Live Websites</p>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  Interactive Web Previews
                </h2>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {service.webPreview.map((item, idx) => (
                <article
                  key={`preview-${idx}`}
                  className="bento-card overflow-hidden"
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,209,0,0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                >
                  <div className="aspect-[16/10] w-full bg-black/20">
                    <iframe
                      src={item.link}
                      title={`Preview of ${item.title}`}
                      className="w-full h-full border-0"
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      aria-label={`Website preview: ${item.title}`}
                    />
                  </div>
                  <div className="p-5" style={{ backgroundColor: 'var(--bg-overlay)' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </h3>
                        {item.desc && (
                          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                            {item.desc}
                          </p>
                        )}
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black text-[10px] tracking-[0.15em] uppercase font-semibold hover:bg-yellow-300 transition-all hover:scale-105"
                      >
                        Visit Live →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── SHOWCASE: IMAGE GALLERY ── */}
        {service.examples?.length > 0 && (() => {
          const KNOWN_BRANDS = ['Shilpa Pilates', 'Tapas Yog Shala', 'Prana Studio', 'Anohga', 'Arovia.ai'];
          const brandCounts = {};
          service.examples.forEach((item) => {
            const t = item.title || '';
            const match = KNOWN_BRANDS.find((b) => t.toLowerCase().includes(b.toLowerCase()));
            if (match) {
              brandCounts[match] = (brandCounts[match] || 0) + 1;
            }
          });
          const activeBrands = Object.keys(brandCounts);
          const filteredExamples =
            galleryBrandFilter === 'All'
              ? service.examples
              : service.examples.filter((item) =>
                  (item.title || '').toLowerCase().includes(galleryBrandFilter.toLowerCase())
                );

          return (
            <section id="sp-gallery" className="mb-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <p className="eyebrow mb-2">Portfolio</p>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    Visual Gallery
                  </h2>
                  <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Explore {filteredExamples.length} studio deliverables. Click any item to inspect &amp; cycle in high resolution.
                  </p>
                </div>

                {activeBrands.length >= 2 && (
                  <div
                    className="flex items-center gap-1.5 p-1 rounded-xl border overflow-x-auto max-w-full scrollbar-none"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}
                  >
                    <button
                      type="button"
                      onClick={() => setGalleryBrandFilter('All')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        galleryBrandFilter === 'All'
                          ? 'bg-yellow-400 text-black shadow-sm'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      All ({service.examples.length})
                    </button>
                    {activeBrands.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => setGalleryBrandFilter(brand)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          galleryBrandFilter === brand
                            ? 'bg-yellow-400 text-black font-bold shadow-sm'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        {brand} ({brandCounts[brand]})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div key={galleryBrandFilter} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 animate-panel">
                {filteredExamples.map((item, idx) => (
                  <GalleryCard
                    key={`${galleryBrandFilter}-${idx}`}
                    item={item}
                    idx={idx}
                    slides={filteredExamples}
                    serviceTitle={service.title}
                    onImageClick={onImageClick}
                    isThumbnails={
                      service.title?.toLowerCase().includes('thumbnail') ||
                      service.tag?.toLowerCase().includes('thumbnail') ||
                      service.tag?.toLowerCase().includes('elite')
                    }
                  />
                ))}
              </div>
            </section>
          );
        })()}

        {/* ── SHOWCASE: INSTAGRAM REELS ── */}
        {instagramVideos.length > 0 && (
          <section id="sp-reels" className="mb-16">
            <div className="mb-8">
              <p className="eyebrow mb-2">Short-Form Content</p>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Instagram Reels Showcase
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {instagramVideos.map((video, idx) => (
                <div key={`ig-${idx}`} className="rounded-xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
                  <VideoEmbed video={video} serviceTitle={service.title} index={idx} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SHOWCASE: YOUTUBE & OTHER VIDEOS ── */}
        {otherVideos.length > 0 && (
          <section id="sp-videos" className="mb-16">
            <div className="mb-8">
              <p className="eyebrow mb-2">Video Productions</p>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Featured Edits &amp; Playlists
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherVideos.map((video, idx) => (
                <div
                  key={`vid-${idx}`}
                  className="rounded-xl overflow-hidden border transition-all duration-300"
                  style={{ borderColor: 'var(--border-color)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,209,0,0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                >
                  <VideoEmbed video={video} serviceTitle={service.title} index={idx} />
                  {(video.title || video.description) && (
                    <div className="p-4" style={{ backgroundColor: 'var(--bg-overlay)' }}>
                      {video.title && <h3 className="font-semibold text-yellow-400 mb-1">{video.title}</h3>}
                      {video.description && (
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {video.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── UPCOMING DISCIPLINE: FEATURES ARCHITECTURE & ROADMAP ── */}
        {service.isUpcoming ? (
          <section className="mb-16 space-y-12">
            {/* Feature Architecture Matrix */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(255,209,0,0.3), transparent)' }} />
                <p className="eyebrow" style={{ color: 'var(--brand-yellow)' }}>✦ Architecture &amp; Capabilities</p>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(255,209,0,0.3), transparent)' }} />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(service.features || [
                  { title: 'Enterprise Architecture', desc: 'Engineered for high throughput, security, and sub-second execution.' },
                  { title: 'Custom Brand Integration', desc: 'Configured precisely to your workflows, databases, and customer journey.' },
                  { title: 'Continuous Refinement', desc: 'Ongoing performance telemetry, prompt tuning, and conversion tracking.' },
                ]).map((feat, idx) => (
                  <div key={idx} className="bento-card p-6 flex flex-col justify-between transition-all duration-300 hover:border-yellow-400/50">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold tracking-widest text-yellow-400 uppercase">
                          0{idx + 1}
                        </span>
                        <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-lg border"
                          style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-overlay)' }}>
                          Specification
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        {feat.title}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Development & Rollout Roadmap */}
            {service.roadmap?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(255,209,0,0.3), transparent)' }} />
                  <p className="eyebrow" style={{ color: 'var(--brand-yellow)' }}>✦ Rollout Roadmap &amp; Stages</p>
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(255,209,0,0.3), transparent)' }} />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {service.roadmap.map((stage, sIdx) => {
                    const isDone = stage.status === 'Completed';
                    const isInProgress = stage.status === 'In Progress' || stage.status === 'Active';
                    return (
                      <div
                        key={sIdx}
                        className="p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300"
                        style={{
                          borderColor: isInProgress ? 'rgba(255, 209, 0, 0.6)' : isDone ? 'rgba(255, 209, 0, 0.25)' : 'var(--border-color)',
                          backgroundColor: isInProgress ? 'rgba(255, 209, 0, 0.05)' : 'var(--bg-card)',
                          boxShadow: isInProgress ? '0 0 24px rgba(255, 209, 0, 0.12)' : undefined,
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] tracking-widest uppercase font-bold text-yellow-400">
                              {stage.phase}
                            </span>
                            <span
                              className={`text-[9px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-xl border ${
                                isInProgress
                                  ? 'border-yellow-400 bg-yellow-400 text-black animate-pulse'
                                  : isDone
                                  ? 'border-yellow-400/40 text-yellow-400 bg-yellow-400/10'
                                  : 'border-white/10 text-stone-400 bg-white/5'
                              }`}
                            >
                              {stage.status}
                            </span>
                          </div>
                          <h4 className="text-base font-bold mb-2 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                            {stage.title}
                          </h4>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {stage.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIP Early Access Guarantee Banner */}
            <div
              className="rounded-3xl border p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              style={{
                borderColor: 'rgba(255, 209, 0, 0.4)',
                background: 'linear-gradient(135deg, rgba(255, 209, 0, 0.08) 0%, var(--bg-card) 100%)',
              }}
            >
              <div>
                <span className="pill-label mb-2 inline-flex">✦ Private Beta Benefits</span>
                <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  Lock In Founding Client Pricing &amp; Priority Onboarding.
                </h3>
                <p className="text-xs sm:text-sm max-w-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Early access partners receive bespoke workflow engineering, direct WhatsApp/Slack channel access with our engineering team, and permanent grandfathered retainer rates.
                </p>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer px-7 py-3 rounded-xl text-xs font-bold shrink-0 text-center uppercase tracking-wider"
              >
                Claim Early Access Spot →
              </a>
            </div>
          </section>
        ) : (
          /* ── SHOWCASE: CAPABILITIES SPOTLIGHT (when no media attached yet) ── */
          (!service.examples?.length && !service.videoShowcase?.length && !service.webPreview?.length) && (
            <section className="mb-16">
              <div className="mb-8">
                <p className="eyebrow mb-2">Capabilities</p>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  Engineered for Direct-Response ROI
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {(service.features || [
                  {
                    title: 'Hyper-Realistic AI Avatars',
                    desc: 'Photorealistic digital creators with authentic micro-expressions, eye contact, and natural body language tailored to your target demographic.'
                  },
                  {
                    title: 'Hook-First Scripting & Voice',
                    desc: 'Direct-response scripts with 3-second pattern interrupts, natural voice cloning, and audio mastering optimized for TikTok & Meta algorithms.'
                  },
                  {
                    title: 'Rapid Creative Testing & Scale',
                    desc: 'Generate 10–20 creative variations in days to rapidly test angles, hooks, and CTAs without high studio and influencer shoot fees.'
                  }
                ]).map((item, idx) => (
                  <div key={idx} className="bento-card p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-yellow-400 uppercase mb-3 block">
                        0{idx + 1}
                      </span>
                      <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        {item.title}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        )}

        {/* ── PREVIOUS / NEXT SERVICE NAVIGATION ── */}
        {onSelectService && (prevService || nextService) && (
          <section className="mb-10 grid sm:grid-cols-2 gap-4">
            {prevService && (
              <button
                type="button"
                onClick={() => onSelectService(prevService.title, prevService.category)}
                className="bento-card p-5 text-left flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 font-bold block mb-1">
                    ← Previous Service
                  </span>
                  <h4 className="text-base font-bold truncate group-hover:text-yellow-400 transition-colors" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    {prevService.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-1 rounded-lg border shrink-0" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
                  {prevService.category === 'AI_UGC' ? 'AI UGC' : prevService.category}
                </span>
              </button>
            )}
            {nextService && (
              <button
                type="button"
                onClick={() => onSelectService(nextService.title, nextService.category)}
                className="bento-card p-5 text-right flex items-center justify-between gap-4 cursor-pointer group sm:flex-row-reverse"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 font-bold block mb-1">
                    Next Service →
                  </span>
                  <h4 className="text-base font-bold truncate group-hover:text-yellow-400 transition-colors" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    {nextService.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-1 rounded-lg border shrink-0" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
                  {nextService.category === 'AI_UGC' ? 'AI UGC' : nextService.category}
                </span>
              </button>
            )}
          </section>
        )}

        {/* ── BOTTOM CALL TO ACTION ── */}
        <section
          className="rounded-3xl border p-6 sm:p-8 md:p-12 text-center relative overflow-hidden"
          style={{
            borderColor: 'var(--border-color)',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)',
          }}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="pill-label inline-flex">Let's Collaborate</div>
            <h2
              className="text-xl sm:text-2xl md:text-4xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Ready to elevate your brand with {service.title}?
            </h2>
            <p className="text-xs sm:text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              From concept and pacing to color grading and final render — we ensure every frame works for your business.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer w-full sm:w-auto text-center justify-center inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs tracking-widest uppercase font-bold hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Start on WhatsApp →
              </a>
              <button
                onClick={() => (onSelectCategory ? onSelectCategory(category) : onBack())}
                className="w-full sm:w-auto text-center justify-center inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs tracking-widest uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 cursor-pointer"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                ← Explore Other Services
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Scroll-to-Top / Quick Jump Dock on ServicePage */}
      {scrollPct > 12 && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-1.5 p-1.5 rounded-lg border shadow-2xl backdrop-blur-xl animate-panel"
          style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--border-color)' }}
        >
          {onOpenPalette && (
            <button
              type="button"
              onClick={onOpenPalette}
              className="px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border hover:border-yellow-400 hover:text-yellow-400 transition-colors cursor-pointer"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-overlay)' }}
            >
              Jump ⌘K
            </button>
          )}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-8 h-8 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold flex items-center justify-center transition-transform hover:-translate-y-0.5 cursor-pointer"
            aria-label="Scroll back to top"
          >
            ↑
          </button>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t py-6 sm:py-8 px-4 sm:px-6" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2.5">
            <button onClick={onBack} className="focus:outline-none cursor-pointer" aria-label="Return to Syntra Home">
              <img src="/assets/syntra-logo.png" alt="Syntra" className="h-5 w-auto object-contain transition-opacity hover:opacity-85" />
            </button>
            <span className="text-stone-500 hidden md:inline">— Motion-first creative studio</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="hover:text-yellow-400 transition-colors">
              Home
            </button>
            <a href="https://instagram.com/syntra.studio" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
              Instagram
            </a>
            <a href="https://wa.me/+918448865446" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
