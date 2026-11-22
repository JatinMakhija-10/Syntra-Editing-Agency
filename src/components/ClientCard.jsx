import { useReveal } from '../hooks/useReveal';

export function ClientCard({ client, delay = 0 }) {
  const cardRef = useReveal({ threshold: 0.1 });

  if (!client) return null;

  return (
    <div
      ref={cardRef}
      className="group relative rounded-xl border reveal p-5 flex flex-col justify-between transition-colors hover:border-stone-500"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--bg-card)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div>
        {/* Top Header: Avatar + Identity + Badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={client.avatar}
              alt={client.name}
              className="rounded-lg object-cover border border-white/10 shrink-0 group-hover:border-stone-400 transition-colors bg-stone-900"
              style={{ width: '42px', height: '42px' }}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex';
                }
              }}
            />
            <div
              className="rounded-lg border border-yellow-400/30 items-center justify-center font-mono font-bold text-xs text-yellow-400 bg-yellow-400/10 shrink-0 hidden"
              style={{ width: '42px', height: '42px' }}
            >
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4
                className="text-sm font-bold leading-snug truncate"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                title={client.name}
              >
                {client.name}
              </h4>
              <p className="text-[11px] font-medium mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
                {client.category}
              </p>
            </div>
          </div>

          {client.stats && (
            <span
              className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-semibold border border-yellow-400/30 text-yellow-400 bg-yellow-400/10"
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

      {/* Deliverable Tags */}
      {client.tags && client.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
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
export default ClientCard;
