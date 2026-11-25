import { useState, useEffect } from 'react';
import { VideoEmbed } from './VideoEmbed';
import { ThemeSwitch } from './ThemeSwitch';
import { slugify } from '../utils/slug';
import SocialCarouselCard from './SocialCarouselCard';

function GalleryCard({ item, idx, serviceTitle, onImageClick, isThumbnails }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border cursor-pointer select-none transition-all duration-300 hover:border-yellow-400/60 hover:shadow-[0_12px_28px_rgba(255,209,0,0.08)] ${
        isThumbnails ? 'aspect-video' : 'aspect-[4/3]'
      } bg-stone-900/50`}
      style={{ borderColor: 'var(--border-color)' }}
      onClick={() => onImageClick({ src: item.image, alt: item.title || serviceTitle, title: item.title || serviceTitle })}
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
        <span className="shrink-0 p-1.5 rounded-md bg-yellow-400 text-black font-bold shadow-md ml-2">
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
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `${service.title} | Syntra Studio`;
    return () => {
      document.title = 'Syntra - Editing Agency | Video, Design & Web Services';
    };
  }, [service.title]);

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
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 sm:gap-2 text-xs tracking-wider uppercase font-semibold hover:text-yellow-400 transition-colors py-1.5 px-3 rounded-md border shrink-0 cursor-pointer"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <span>←</span>
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Syntra Logo */}
            <button
              onClick={onBack}
              className="flex items-center focus:outline-none group cursor-pointer"
              title="Return to Syntra Home"
            >
              <img src="/assets/syntra-logo.png" alt="Syntra" className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105" />
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span>/</span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-yellow-400">
                {category === 'AI_UGC' ? '✦ AI UGC' : category === 'AUTOMATION' ? '✦ AUTOMATION' : category}
              </span>
              <span>/</span>
              <span className="truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>{service.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Share button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs font-semibold border transition-all duration-300 hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
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
              className="btn-shimmer hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-md text-[11px] tracking-[0.18em] uppercase font-bold shadow-md hover:scale-105 transition-all duration-300"
            >
              Inquire Now →
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16 w-full flex-1">
        <div className="mb-10 md:mb-14 border-b pb-8 md:pb-12" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="pill-label">{service.tag || category}</div>
            {service.isUpcoming && (
              <span className="text-[10px] tracking-wider uppercase font-bold px-3 py-1 rounded-md border border-yellow-400/40 bg-yellow-400/15 text-yellow-400 shadow-[0_0_16px_rgba(255,209,0,0.18)] flex items-center gap-1.5">
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
              className="btn-shimmer w-full sm:w-auto text-center justify-center inline-flex items-center gap-2 px-8 py-3.5 rounded-md text-[11px] tracking-[0.2em] uppercase font-bold shadow-lg hover:scale-105 transition-all duration-300"
            >
              {service.isUpcoming ? 'Reserve Early Access on WhatsApp →' : 'Book on WhatsApp →'}
            </a>
            <div className="grid grid-cols-2 sm:flex items-center gap-2.5">
              <a
                href="mailto:jatinmakhija1005@gmail.com?subject=Inquiry%20regarding%20Syntra%20Services"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-[11px] tracking-[0.15em] uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                Email Us
              </a>
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md text-[11px] tracking-[0.15em] uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                {copied ? '✓ Copied' : 'Share Link'}
              </button>
            </div>
          </div>
        </div>

        {/* ── AI UGC CLIENT SHOWCASES ── */}
        {service.clientShowcases?.length > 0 && (
          <section className="mb-16">
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
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] tracking-[0.2em] uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400 hover:scale-105"
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
                          onClick={() => onImageClick && onImageClick({ src: ex.image, alt: ex.title || showcase.client })}
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
          <section className="mb-16">
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
          <section className="mb-16">
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
                        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-400 text-black text-[10px] tracking-[0.15em] uppercase font-semibold hover:bg-yellow-300 transition-all hover:scale-105"
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
        {service.examples?.length > 0 && (
          <section className="mb-16">
            <div className="mb-8">
              <p className="eyebrow mb-2">Portfolio</p>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Visual Gallery
              </h2>
              <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Explore {service.examples.length} studio deliverables. Click any item to inspect in high resolution.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {service.examples.map((item, idx) => (
                <GalleryCard
                  key={idx}
                  item={item}
                  idx={idx}
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
        )}

        {/* ── SHOWCASE: INSTAGRAM REELS ── */}
        {instagramVideos.length > 0 && (
          <section className="mb-16">
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
          <section className="mb-16">
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
                        <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-md border"
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
                              className={`text-[9px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-md border ${
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
                className="btn-shimmer px-7 py-3 rounded-md text-xs font-bold shrink-0 text-center uppercase tracking-wider"
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
                className="btn-shimmer w-full sm:w-auto text-center justify-center inline-flex items-center gap-2 px-8 py-3.5 rounded-md text-xs tracking-widest uppercase font-bold hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Start on WhatsApp →
              </a>
              <button
                onClick={onBack}
                className="w-full sm:w-auto text-center justify-center inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-xs tracking-widest uppercase font-semibold border transition-all duration-300 hover:border-yellow-400"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                ← Explore Other Services
              </button>
            </div>
          </div>
        </section>
      </main>

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
