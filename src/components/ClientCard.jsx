import { useReveal } from '../hooks/useReveal';

export function ClientCard({ client, delay = 0, onClick, actionLabel }) {
  const cardRef = useReveal({ threshold: 0.1 });

  if (!client) return null;

  const isClickable = typeof onClick === 'function';

  return (
    <div
      ref={cardRef}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `${client.name} — ${actionLabel || 'View work'}` : undefined}
      className={`group relative rounded-2xl border reveal p-5 md:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/50 hover:shadow-[0_16px_36px_rgba(255,209,0,0.08)] ${
        isClickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400' : ''
      }`}
      style={{
        borderColor: 'var(--border-color)',
        background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)`,
        backgroundColor: 'var(--bg-card)',
        transitionDelay: `${delay}ms`,
        willChange: 'transform',
      }}
    >
      <div>
        {/* Top Header: Avatar + Identity + Badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={client.avatar}
              alt={client.name}
              className="rounded-xl object-cover border border-white/10 shrink-0 group-hover:border-yellow-400/60 transition-all duration-300 shadow-sm bg-stone-900"
              style={{ width: '46px', height: '46px' }}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex';
                }
              }}
            />
            <div
              className="rounded-xl border border-yellow-400/30 items-center justify-center font-bold text-xs text-yellow-400 bg-yellow-400/10 shrink-0 hidden"
              style={{ width: '46px', height: '46px' }}
            >
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4
                className="text-sm md:text-base font-bold leading-snug truncate"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                title={client.name}
              >
                {client.name}
              </h4>
              <p className="text-[11px] font-semibold mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
                {client.category}
              </p>
            </div>
          </div>

          {client.stats && (
            <span
              className="shrink-0 px-2 py-0.5 rounded-xl text-[9px] tracking-wider uppercase font-bold border border-yellow-400/20 text-yellow-400 bg-yellow-400/5"
            >
              {client.stats}
            </span>
          )}
        </div>

        {/* Deliverables Scope Description */}
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
          {client.scope || client.review}
        </p>
      </div>

      {/* Deliverable Tags & Action Cue */}
      <div className="pt-3 border-t flex flex-col gap-2.5" style={{ borderColor: 'var(--border-color)' }}>
        {client.tags && client.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {client.tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-lg border"
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
        {isClickable && actionLabel && (
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider font-bold">
            <span className="inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--text-primary)' }}>
              <span className="inline-block w-1.5 h-1.5 rotate-45 bg-yellow-400 shrink-0" />
              <span>{actionLabel}</span>
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
              Open ↗
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export const TestimonialCard = ClientCard;
export default ClientCard;
