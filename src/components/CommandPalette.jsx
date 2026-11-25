import { useState, useEffect, useRef, useMemo } from 'react';

export function CommandPalette({
  isOpen,
  onClose,
  servicesByCategory,
  categoryTabs,
  onSelectService,
  onSelectCategory,
  onNavigateSection,
  onToggleTheme,
  theme,
}) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 20);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const allItems = useMemo(() => {
    const items = [];

    // 1. Disciplines / Categories
    (categoryTabs || []).forEach((tab) => {
      items.push({
        id: `cat-${tab.id}`,
        group: 'Discipline',
        title: tab.label.replace(/^✦\s*/, ''),
        subtitle: `Filter Services -> ${tab.label}`,
        badge: 'Category',
        action: () => onSelectCategory(tab.id),
      });
    });

    // 2. All Services
    if (servicesByCategory) {
      Object.keys(servicesByCategory).forEach((cat) => {
        const catObj = servicesByCategory[cat] || {};
        Object.keys(catObj).forEach((title) => {
          const s = catObj[title];
          items.push({
            id: `srv-${cat}-${title}`,
            group: 'Service',
            title: s.title,
            subtitle: s.desc,
            badge: s.tag || cat,
            isUpcoming: Boolean(s.isUpcoming),
            action: () => onSelectService(s.title, cat),
          });
        });
      });
    }

    // 3. Page Sections
    [
      { id: 'about', title: 'About Syntra', subtitle: 'Motion-first editing philosophy & focus' },
      { id: 'services', title: 'Services Ecosystem', subtitle: 'Browse all disciplines & deliverables' },
      { id: 'clients', title: 'Previous Clients & Collaborations', subtitle: '22M+ creators, gaming & wellness brands' },
      { id: 'process', title: 'Production Process', subtitle: '01 Discovery -> 04 Deliver workflow' },
      { id: 'contact', title: 'Start a Project / Contact', subtitle: 'Interactive project brief & inquiry form' },
    ].forEach((sec) => {
      items.push({
        id: `sec-${sec.id}`,
        group: 'Section',
        title: sec.title,
        subtitle: sec.subtitle,
        badge: `#${sec.id}`,
        action: () => onNavigateSection(sec.id),
      });
    });

    // 4. Quick Actions
    items.push(
      {
        id: 'act-theme',
        group: 'Action',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Toggle studio color appearance',
        badge: 'Theme',
        action: () => onToggleTheme(),
      },
      {
        id: 'act-wa',
        group: 'Action',
        title: 'Chat Directly on WhatsApp',
        subtitle: 'Instant direct line (+91 8448 865 446)',
        badge: 'External ↗',
        action: () =>
          window.open(
            'https://wa.me/+918448865446?text=Hi%20Syntra%2C%20I%27d%20like%20to%20discuss%20a%20project.',
            '_blank',
            'noopener,noreferrer'
          ),
      }
    );

    return items;
  }, [categoryTabs, servicesByCategory, onSelectCategory, onSelectService, onNavigateSection, onToggleTheme, theme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Curated defaults when empty
      return [
        ...allItems.filter((i) => i.group === 'Section'),
        ...allItems.filter((i) => i.group === 'Discipline').slice(0, 5),
        ...allItems.filter((i) => i.group === 'Service').slice(0, 6),
        ...allItems.filter((i) => i.group === 'Action'),
      ];
    }
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.badge && item.badge.toLowerCase().includes(q)) ||
        item.group.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Keep active item scrolled into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-idx="${selectedIdx}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIdx]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filtered.length > 0) setSelectedIdx((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filtered.length > 0) setSelectedIdx((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filtered[selectedIdx];
      if (target) {
        target.action();
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick navigation search"
    >
      <div
        className="w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden animate-modal"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'rgba(255, 209, 0, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Header */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 border-b"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
        >
          <svg
            className="w-4 h-4 text-yellow-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to any service, category, or section..."
            className="flex-1 bg-transparent text-sm outline-none font-medium"
            style={{ color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            onClick={onClose}
            className="kbd-key hover:border-yellow-400 hover:text-yellow-400 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[55vh] overflow-y-auto p-2 space-y-1 no-scrollbar"
        >
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
              No matches for "<span className="text-yellow-400 font-semibold">{query}</span>"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-idx={idx}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-400/15 border-yellow-400/50'
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-yellow-400' : ''
                        }`}
                        style={isSelected ? {} : { color: 'var(--text-primary)' }}
                      >
                        {item.title}
                      </span>
                      {item.isUpcoming && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-yellow-400/20 text-yellow-400">
                          BETA
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p
                        className="text-[11px] truncate mt-0.5"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm border ${
                      isSelected
                        ? 'border-yellow-400/50 bg-yellow-400 text-black'
                        : 'border-white/10 text-stone-400 bg-black/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div
          className="px-4 py-2.5 border-t flex items-center justify-between text-[10px] font-mono"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="kbd-key">↑</span>
              <span className="kbd-key">↓</span>
              Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="kbd-key">↵</span>
              Open
            </span>
          </div>
          <span>{allItems.length} quick destinations</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
