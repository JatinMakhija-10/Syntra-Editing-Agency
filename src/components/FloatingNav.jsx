import { useState, useEffect } from 'react';
import { scrollToTop } from '../utils/smoothScroll';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'process', label: 'Process' },
  { id: 'clients', label: 'Clients' },
  { id: 'contact', label: 'Contact' },
];

export function FloatingNav({ activeSection, onOpenPalette, onNavigateSection }) {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 650);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col items-end gap-2 animate-panel">
      {/* Popover section switcher */}
      {menuOpen && (
        <div
          className="w-44 rounded-lg border p-1.5 shadow-2xl backdrop-blur-xl flex flex-col gap-1 animate-modal"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          <p className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 text-stone-400">
            Jump to Section
          </p>
          {SECTIONS.map((s) => {
            const isCurrent = activeSection === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onNavigateSection(s.id);
                  setMenuOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-yellow-400 text-black'
                    : 'hover:bg-white/10'
                }`}
                style={isCurrent ? {} : { color: 'var(--text-primary)' }}
              >
                <span>{s.label}</span>
                {isCurrent && <span className="text-[9px] font-mono">●</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Dock Controls Bar */}
      <div
        className="flex items-center gap-1.5 p-1.5 rounded-lg border shadow-2xl backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--header-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <button
          type="button"
          onClick={onOpenPalette}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors hover:border-yellow-400 hover:text-yellow-400 cursor-pointer"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-overlay)' }}
          title="Open Quick Studio Search (Ctrl+K)"
        >
          <svg className="w-3 h-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className={`px-2.5 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
            menuOpen
              ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
              : 'hover:border-yellow-400'
          }`}
          style={
            menuOpen
              ? {}
              : { borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-overlay)' }
          }
          aria-expanded={menuOpen}
          title="Toggle quick section menu"
        >
          {activeSection ? `#${activeSection}` : 'Sections'} ▾
        </button>

        <button
          type="button"
          onClick={() => scrollToTop(450)}
          className="w-8 h-8 rounded-md bg-yellow-400 hover:bg-yellow-300 text-black font-bold flex items-center justify-center transition-transform hover:-translate-y-0.5 cursor-pointer shadow-sm"
          aria-label="Scroll back to top"
          title="Back to top"
        >
          ↑
        </button>
      </div>
    </div>
  );
}

export default FloatingNav;
