import { useReveal } from '../hooks/useReveal';

export function TeamCard({ name, role, delay = 0 }) {
  const cardRef = useReveal({ threshold: 0.1 });

  return (
    <div
      ref={cardRef}
      className="group relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.02] via-black to-black/90 reveal transition-all duration-500 hover:border-white/20 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.25) 100%)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="h-40 bg-gradient-to-b from-white/20 to-black/50" />
      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="inline-flex px-3 py-1 bg-yellow-400 text-black text-[10px] uppercase tracking-[0.25em] font-semibold mb-2">
            {name}
          </div>
          <p className="text-xs text-white font-medium">{role}</p>
          <p className="text-[10px] text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Hover for more in a real build.
          </p>
        </div>
      </div>
    </div>
  );
}

