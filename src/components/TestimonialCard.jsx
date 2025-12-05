import { useReveal } from '../hooks/useReveal';

export function TestimonialCard({ testimonial, delay = 0 }) {
  const cardRef = useReveal({ threshold: 0.1 });

  return (
    <div
      ref={cardRef}
      className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.02] via-black to-black/90 reveal p-6 transition-all duration-500 hover:border-yellow-400/30 hover:-translate-y-1 hover:shadow-lg"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.25) 100%)',
        transitionDelay: `${delay}ms`,
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
          <h4 className="text-sm font-semibold text-white mb-1">{testimonial.name}</h4>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em]">{testimonial.company}</p>
        </div>
        <div className="text-yellow-400 text-lg">★</div>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">{testimonial.review}</p>
    </div>
  );
}

