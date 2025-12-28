import { useReveal } from '../hooks/useReveal';

export function TestimonialCard({ testimonial, delay = 0 }) {
  const cardRef = useReveal({ threshold: 0.1 });

  return (
    <div
      ref={cardRef}
      className="group relative rounded-2xl border reveal p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
      style={{
        borderColor: 'var(--border-color)',
        background: `linear-gradient(180deg, var(--bg-gradient-start), var(--bg-card))`,
        backgroundColor: 'var(--bg-card)',
        transitionDelay: `${delay}ms`,
        willChange: 'transform',
        boxShadow: '0 1px 3px 0 var(--card-shadow)',
      }}
      onMouseEnter={(e) => {
        if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
          e.currentTarget.style.borderColor = 'rgba(255, 209, 0, 0.3)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px var(--card-shadow)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 var(--card-shadow)';
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400/30"
          loading="lazy"
        />
        <div className="flex-1">
          <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{testimonial.name}</h4>
          <p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-tertiary)' }}>{testimonial.company}</p>
        </div>
        <div className="text-yellow-400 text-lg">★</div>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{testimonial.review}</p>
    </div>
  );
}

