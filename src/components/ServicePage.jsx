import { useState, useEffect } from 'react';
import { VideoEmbed } from './VideoEmbed';
import { ThemeSwitch } from './ThemeSwitch';
import { slugify } from '../utils/slug';

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
    `Hi Syntra, I'm interested in your ${service.title} service. Can we discuss a project?`
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-xs tracking-wider uppercase font-semibold hover:text-yellow-400 transition-colors py-1.5 px-3 rounded-full border"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <span>←</span>
              <span>All Services</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span>/</span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-yellow-400">{category}</span>
              <span>/</span>
              <span className="truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{service.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Share button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-300 hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                  <span>Share Page</span>
                </>
              )}
            </button>

            <ThemeSwitch theme={theme} onToggle={onToggleTheme} />

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shimmer hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full text-[11px] tracking-[0.18em] uppercase font-bold shadow-md hover:scale-105 transition-all duration-300"
            >
              Inquire Now →
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16 w-full flex-1">
        <div className="mb-14 border-b pb-12" style={{ borderColor: 'var(--border-color)' }}>
          <div className="pill-label mb-4">{service.tag || category}</div>
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5 tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {service.title}
          </h1>
          <p
            className="text-base md:text-xl font-light max-w-3xl leading-relaxed mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            {service.desc}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shimmer inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[11px] tracking-[0.2em] uppercase font-bold shadow-lg hover:scale-105 transition-all duration-300"
            >
              Book on WhatsApp →
            </a>
            <a
              href="mailto:jatinmakhija1005@gmail.com?subject=Inquiry%20regarding%20Syntra%20Services"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[11px] tracking-[0.2em] uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              Email Us
            </a>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-[11px] tracking-[0.2em] uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              {copied ? '✓ Link Copied' : 'Copy Direct Link'}
            </button>
          </div>
        </div>

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
                        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 text-black text-[10px] tracking-[0.15em] uppercase font-semibold hover:bg-yellow-300 transition-all hover:scale-105"
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
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {service.examples.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-300 focus-within:ring-2 focus-within:ring-yellow-400"
                  style={{ borderColor: 'var(--border-color)' }}
                  onClick={() => onImageClick({ src: item.image, alt: item.title || service.title })}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,209,0,0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${item.title || service.title} - Image ${idx + 1}`}
                >
                  <img
                    src={item.image}
                    alt={item.title || `${service.title} example ${idx + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-400 group-hover:scale-105"
                    loading="lazy"
                  />
                  {item.title && (
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-end p-3"
                      style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }}
                    >
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </p>
                    </div>
                  )}
                </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

        {/* ── BOTTOM CALL TO ACTION ── */}
        <section
          className="rounded-3xl border p-8 md:p-12 text-center relative overflow-hidden"
          style={{
            borderColor: 'var(--border-color)',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)',
          }}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="pill-label inline-flex">Let's Collaborate</div>
            <h2
              className="text-2xl md:text-4xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Ready to elevate your brand with {service.title}?
            </h2>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              From concept and pacing to color grading and final render — we ensure every frame works for your business.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs tracking-widest uppercase font-bold hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Start on WhatsApp →
              </a>
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs tracking-widest uppercase font-semibold border transition-all duration-300 hover:border-yellow-400"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                ← Explore Other Services
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t py-8 px-6" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2">
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Syntra</span>
            <span>— Motion-first creative studio</span>
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
