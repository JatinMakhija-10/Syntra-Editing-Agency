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
      className="group relative rounded-3xl overflow-hidden border reveal transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01]"
      style={{
        borderColor: 'var(--border-color)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.25) 100%)',
        transitionDelay: `${delay}ms`,
        willChange: 'transform',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={(e) => {
        if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div className="h-48 relative flex items-center justify-center bg-gradient-to-br from-yellow-400/10 via-black/50 to-yellow-500/5 overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--brand-yellow)_0,_transparent_60%)] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500" />
        
        {/* Themed initials avatar */}
        <div 
          className="w-20 h-20 rounded-md flex items-center justify-center border-2 transition-all duration-500 shadow-[0_0_20px_rgba(250,204,21,0.15)] group-hover:border-yellow-400 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(250,204,21,0.3)]"
          style={{
            backgroundColor: 'rgba(255, 209, 0, 0.08)',
            borderColor: 'rgba(255, 209, 0, 0.3)',
          }}
        >
          <span className="text-3xl font-semibold tracking-wider text-yellow-400 font-sans select-none">
            {initials}
          </span>
        </div>
      </div>
      <div className="p-5 flex items-center justify-between gap-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <div className="flex-1">
          <div className="inline-flex px-3 py-1 bg-yellow-400 text-black text-[10px] uppercase tracking-[0.25em] font-semibold mb-2 rounded-sm">
            {name}
          </div>
          <p className="text-xs text-white/90 font-medium">{role}</p>
        </div>
      </div>
    </div>
  );
}

