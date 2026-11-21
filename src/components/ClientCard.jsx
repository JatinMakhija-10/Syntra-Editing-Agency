import { useReveal } from '../hooks/useReveal';

export function ClientCard({ client, delay = 0 }) {
  const cardRef = useReveal({ threshold: 0.1 });

  if (!client) return null;

  return (
    <div
      ref={cardRef}
      className="group relative rounded-3xl border reveal p-6 md:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/50 hover:shadow-[0_16px_36px_rgba(255,209,0,0.08)]"
      style={{
        borderColor: 'var(--border-color)',
        background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)`,
        backgroundColor: 'var(--bg-card)',
        transitionDelay: `${delay}ms`,
        willChange: 'transform',
      }}
    >
      <div>
        {/* Top Header: Avatar + Identity + Category */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <img
              src={client.avatar}
              alt={client.name}
              className="w-13 h-13 rounded-2xl object-cover border border-white/10 shrink-0 group-hover:border-yellow-400/50 transition-colors shadow-sm"
              style={{ width: '48px', height: '48px' }}
              loading="lazy"
            />
            <div>
              <h4
                className="text-base font-bold leading-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                {client.name}
              </h4>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {client.category} {client.stats ? `· ${client.stats}` : ''}
              </p>
            </div>
          </div>

          <span
            className="shrink-0 px-2.5 py-1 rounded-full text-[9px] tracking-wider uppercase font-bold border transition-colors group-hover:border-yellow-400/30 group-hover:text-yellow-400"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-overlay)',
            }}
          >
            {client.type === 'creator' ? 'Creator' : client.type === 'gaming' ? 'Gaming' : 'Brand'}
          </span>
        </div>

        {/* Deliverables Scope Description */}
        <p className="text-xs md:text-[13px] leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
          {client.scope || client.review}
        </p>
      </div>

      {/* Deliverable Tags */}
      {client.tags && client.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-3.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
          {client.tags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-overlay)',
                color: 'var(--text-tertiary)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export const TestimonialCard = ClientCard;
