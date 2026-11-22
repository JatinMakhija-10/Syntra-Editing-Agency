import { useReveal } from '../hooks/useReveal';

export function TeamCard({ name, role, delay = 0 }) {
  const cardRef = useReveal({ threshold: 0.1 });

  // Calculate initials from name
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : 'S';

  return (
    <div
      ref={cardRef}
      className="group relative rounded-xl overflow-hidden border reveal transition-colors"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--bg-card)',
        transitionDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div className="h-44 relative flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'var(--bg-overlay)' }}>
        {/* Themed initials avatar */}
        <div 
          className="w-16 h-16 rounded-lg flex items-center justify-center border transition-colors group-hover:border-yellow-400"
          style={{
            backgroundColor: 'rgba(255, 209, 0, 0.08)',
            borderColor: 'rgba(255, 209, 0, 0.3)',
          }}
        >
          <span className="text-2xl font-bold tracking-wider text-yellow-400 font-mono select-none">
            {initials}
          </span>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between gap-4 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <div className="flex-1">
          <div className="inline-flex px-2 py-0.5 bg-yellow-400 text-black text-[10px] uppercase font-mono font-bold mb-1.5 rounded">
            {name}
          </div>
          <p className="text-xs text-stone-300 font-medium">{role}</p>
        </div>
      </div>
    </div>
  );
}

