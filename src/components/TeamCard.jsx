import { useReveal } from '../hooks/useReveal';

export function TeamCard({ name, role, delay = 0 }) {
  const cardRef = useReveal({ threshold: 0.1 });

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
      <div className="h-40 bg-gradient-to-b from-white/20 to-black/50" />
      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="inline-flex px-3 py-1 bg-yellow-400 text-black text-[10px] uppercase tracking-[0.25em] font-semibold mb-2">
            {name}
          </div>
          <p className="text-xs text-white font-medium">{role}</p>
        </div>
      </div>
    </div>
  );
}

