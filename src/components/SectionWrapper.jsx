import { useReveal } from '../hooks/useReveal';

export function SectionWrapper({ children, className = '', delay = 0 }) {
  const sectionRef = useReveal({ threshold: 0.1 });

  return (
    <div
      ref={sectionRef}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

