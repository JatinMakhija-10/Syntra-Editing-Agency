import { useEffect } from 'react';

export const MobileMenu = ({ isOpen, onClose, onNavigate, onSelectCategory }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavClick = (e, href) => {
    onNavigate(e);
    onClose();
  };

  const handleCategoryClick = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 md:hidden flex flex-col justify-between"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className="relative z-10 flex flex-col h-full max-h-screen overflow-y-auto no-scrollbar p-5 pb-8 justify-between"
        style={{ color: 'var(--text-primary)' }}
      >
        {/* Top Bar with Logo & Close */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2.5">
            <img src="/assets/syntra-logo.png" alt="Syntra" className="h-7 w-auto object-contain" />
            <span className="font-extrabold tracking-[0.22em] text-base uppercase" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              SYNTRA
            </span>
            <span className="text-[9px] tracking-[0.18em] uppercase font-bold text-yellow-400 border border-yellow-400/40 px-1.5 py-0.5 rounded-full bg-yellow-400/10">
              STUDIO
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors hover:border-yellow-400"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Nav Links */}
        <nav className="my-auto py-6 flex flex-col gap-2" aria-label="Mobile primary navigation">
          {[
            { href: '#about', label: 'About' },
            { href: '#services', label: 'Services', badge: '6 Disciplines' },
            { href: '#clients', label: 'Previous Clients', badge: '16+' },
            { href: '#process', label: 'Process' },
            { href: '#contact', label: 'Contact' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="flex items-center justify-between py-3.5 px-4 rounded-xl text-lg font-bold tracking-wider uppercase transition-all hover:bg-yellow-400/10 hover:text-yellow-400 min-h-[50px]"
              style={{ color: 'var(--text-primary)' }}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-yellow-400 text-black">
                  {link.badge}
                </span>
              )}
            </a>
          ))}

          {/* Quick Category Shortcuts */}
          <div className="pt-4 mt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-[10px] tracking-[0.25em] uppercase font-bold text-yellow-400 mb-3 px-4">
              Explore Disciplines
            </p>
            <div className="grid grid-cols-2 gap-2 px-1">
              {[
                { id: 'UPCOMING', label: '✦ Upcoming Labs' },
                { id: 'AUTOMATION', label: '✦ Automation & Bots' },
                { id: 'AI_UGC', label: '✦ AI UGC Ads' },
                { id: 'VIDEO', label: 'Video & Reels' },
                { id: 'THUMBNAILS', label: 'Thumbnails' },
                { id: 'GRAPHICS', label: 'Brand Identity' },
                { id: 'CONTENT', label: 'Social & Copy' },
                { id: 'WEB', label: 'Web & Growth' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className="text-left text-xs font-semibold py-2.5 px-3 rounded-lg border transition-all hover:border-yellow-400 hover:text-yellow-400"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-overlay)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom Direct CTA & Socials */}
        <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--border-color)' }}>
          <a
            href="https://wa.me/+918448865446?text=Hi%20Syntra%2C%20I%27d%20like%20to%20discuss%20a%20project"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shimmer w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-xs tracking-widest uppercase font-bold shadow-lg"
          >
            Chat on WhatsApp →
          </a>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <a
              href="https://instagram.com/syntra.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition-colors py-1"
            >
              Instagram @syntra.studio
            </a>
            <span>·</span>
            <a
              href="mailto:jatinmakhija1005@gmail.com"
              className="hover:text-yellow-400 transition-colors py-1"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
