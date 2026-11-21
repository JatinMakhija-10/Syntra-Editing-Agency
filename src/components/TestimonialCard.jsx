import { ClientCard } from './ClientCard';

export function TestimonialCard({ testimonial, client, delay = 0 }) {
  return <ClientCard client={client || testimonial} delay={delay} />;
}

export default TestimonialCard;
