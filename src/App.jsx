import { useState, useEffect } from 'react';
import { servicesData } from './servicesData';
import { testimonialsData } from './testimonialsData';
import { useReveal } from './hooks/useReveal';
import { handleSmoothScroll, smoothScrollTo } from './utils/smoothScroll';
import { TeamCard } from './components/TeamCard';
import { TestimonialCard } from './components/TestimonialCard';
import { SectionWrapper } from './components/SectionWrapper';

const categories = ['VIDEO', 'GRAPHICS', 'THUMBNAILS', 'CONTENT', 'WEB'];

// Map service titles to their data
const getServiceData = (category, title) => {
  return servicesData[category]?.[title] || null;
};

// Get service list for each category
const getServicesForCategory = (category) => {
  return Object.values(servicesData[category] || {}).map((s) => ({
    title: s.title,
    desc: s.desc,
    tag: s.tag,
  }));
};

function App() {
  const [activeCategory, setActiveCategory] = useState('VIDEO');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle smooth scroll on mount if hash exists
  useEffect(() => {
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => {
          smoothScrollTo(target, 500);
        }, 100);
      }
    }
  }, []);

  const handleServiceClick = (serviceTitle) => {
    const data = getServiceData(activeCategory, serviceTitle);
    if (data && (data.examples?.length > 0 || data.videoShowcase?.length > 0)) {
      setSelectedService(data);
    }
  };

  const closeModal = () => {
    setSelectedService(null);
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-10 left-32 w-72 h-72 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-yellow-300/5 blur-3xl" />
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-yellow-400 text-2xl"
            >
              ✕
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md"
          onClick={closeModal}
        >
          <div className="min-h-screen px-4 py-8">
            <div className="max-w-7xl mx-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl md:text-4xl font-semibold">{selectedService.title}</h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-yellow-400 text-2xl transition"
                >
                  ✕
                </button>
              </div>

              {/* Images Gallery */}
              {selectedService.examples && selectedService.examples.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-xl md:text-2xl font-semibold mb-6 text-yellow-400">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedService.examples.map((item, idx) => (
                      <div
                        key={idx}
                        className="group relative overflow-hidden rounded-lg border border-white/10 cursor-pointer hover:border-yellow-400/50 transition"
                        onClick={() => setSelectedImage({ src: item.image, alt: item.title || selectedService.title })}
                      >
                        <img
                          src={item.image}
                          alt={item.title || selectedService.title}
                          className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                        {item.title && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                            <p className="text-xs text-white">{item.title}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Showcase */}
              {selectedService.videoShowcase && selectedService.videoShowcase.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-xl md:text-2xl font-semibold mb-6 text-yellow-400">Video Showcase</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedService.videoShowcase.map((video, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg overflow-hidden border border-white/10 hover:border-yellow-400/50 transition"
                      >
                        <div className="aspect-video w-full">
                          {video.type === 'youtube' ? (
                            <iframe
                              className="w-full h-full"
                              src={`${video.src}${video.src.includes('?') ? '&' : '?'}autoplay=0&rel=0&modestbranding=1`}
                              title={video.title || selectedService.title}
                              frameBorder="0"
                              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                            />
                          ) : video.type === 'drive' ? (
                            <iframe
                              className="w-full h-full"
                              src={video.src}
                              title={video.title || selectedService.title}
                              frameBorder="0"
                              allowFullScreen
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        {(video.title || video.description) && (
                          <div className="p-4 bg-black/40">
                            {video.title && <h4 className="text-yellow-400 mb-1">{video.title}</h4>}
                            {video.description && <p className="text-sm text-gray-300">{video.description}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="text-center pt-8 border-t border-white/10">
                <p className="text-gray-300 mb-4">Ready to get started with {selectedService.title}?</p>
                <a
                  href="#contact"
                  onClick={closeModal}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-yellow-400 text-black font-medium hover:bg-yellow-300 transition"
                >
                  Contact Us Today
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 backdrop-blur-xl bg-black/70">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-yellow-400 flex items-center justify-center">
              <span className="text-black font-black text-xs tracking-[0.18em]">SY</span>
            </div>
            <span className="font-medium tracking-[0.2em] text-xs">SYNTRA</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-xs tracking-[0.18em] uppercase text-gray-300">
            <a href="#about" onClick={handleSmoothScroll} className="hover:text-white transition-colors duration-300">
              About
            </a>
            <a href="#services" onClick={handleSmoothScroll} className="hover:text-white transition-colors duration-300">
              Services
            </a>
            <a href="#testimonials" onClick={handleSmoothScroll} className="hover:text-white transition-colors duration-300">
              Testimonials
            </a>
            <a href="#process" onClick={handleSmoothScroll} className="hover:text-white transition-colors duration-300">
              Process
            </a>
            <a href="#contact" onClick={handleSmoothScroll} className="hover:text-white transition-colors duration-300">
              Contact
            </a>
          </nav>
          <a
            href="#contact"
            onClick={handleSmoothScroll}
            className="hidden md:inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase border border-yellow-400/70 px-4 py-2 rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300"
          >
            Start a project →
        </a>
      </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 border-b border-white/5">
          <div className="hidden lg:flex flex-col gap-3 absolute left-0 top-1/2 -translate-y-1/2 -translate-x-24 text-[10px] tracking-[0.35em] text-gray-400 uppercase rotate-180 [writing-mode:vertical-rl]">
            <span>Experiential</span>
            <span>Branding</span>
            <span>Digital</span>
          </div>

          <div className="hidden lg:flex flex-col gap-3 absolute right-0 top-1/2 -translate-y-1/2 translate-x-24 text-[10px] tracking-[0.35em] text-gray-500 uppercase [writing-mode:vertical-rl]">
            <span>India</span>
            <span>IST</span>
            <span>12:34</span>
          </div>

          <div className="grid md:grid-cols-[1.3fr,1fr] gap-10 items-center">
            <div>
              <p className="text-[10px] tracking-[0.35em] uppercase text-gray-400 mb-4">
                Editing-first creative studio
              </p>
              <div className="space-y-2 mb-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">we shape stories.</h1>
                <p className="text-2xl md:text-3xl text-gray-300">
                  we <span className="text-yellow-400 font-medium">refine vision.</span>
                </p>
                <p className="text-2xl md:text-3xl text-gray-500">
                  we create <span className="text-white">impact.</span>
                </p>
              </div>
              <p className="text-gray-300 max-w-xl text-sm md:text-base mb-8">
                Syntra is a motion-first editing agency. From raw footage to thumbnails, from logos to full websites — we
                design the entire journey around how your story feels in motion.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#services"
                  onClick={handleSmoothScroll}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-yellow-400 text-black text-xs tracking-[0.18em] uppercase shadow-sm hover:scale-105 hover:shadow-lg transition-all duration-300 font-medium"
                >
                  View services →
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -right-4 w-12 h-12 border border-yellow-400/60 rounded-lg" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 border border-white/10 rounded-full" />
              <div className="relative bg-gradient-to-br from-white/5 via-white/0 to-yellow-400/10 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur">
                <div className="aspect-[4/5] rounded-2xl bg-black/60 border border-white/10 relative overflow-hidden">
                  <div className="absolute inset-6">
                    <div className="absolute inset-y-2 left-1/2 w-px bg-gradient-to-b from-yellow-300/80 via-yellow-400/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 h-10 border border-yellow-500/60 rounded-xl flex items-center justify-between px-3 text-[10px] uppercase tracking-[0.25em] text-yellow-200/80">
                      <span>Timeline</span>
                      <span>00:43 / 02:17</span>
                    </div>
                    <div className="absolute top-6 left-6 w-20 h-20 rounded-full border border-yellow-400/60" />
                    <div className="absolute top-14 right-10 w-24 h-24 border border-yellow-200/30 rotate-6" />
                    <div className="absolute inset-0 opacity-50">
                      <div className="absolute left-1/3 top-1/4 w-24 h-24 rounded-full border border-white/10" />
                      <div className="absolute left-1/4 top-1/3 w-40 h-40 border border-yellow-300/30 rounded-[40%] rotate-[-18deg]" />
                    </div>
                    <p className="absolute left-6 bottom-20 text-xs text-gray-200 max-w-[9rem] leading-snug">
                      Editing, motion, sound, identity — choreographed together.
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                  Experiential — Branding — Digital
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="py-16 md:py-20 border-b border-white/5"
        >
          <SectionWrapper>
            <div className="grid md:grid-cols-[1.1fr,1fr] gap-10">
          <div className="bg-white text-black rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#000_0,_transparent_55%)]" />
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-4">We are Syntra</p>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">A creative editing agency shaping experiences.</h2>
            <p className="text-sm md:text-base text-gray-800 mb-3">
              We combine video editing, graphic design, thumbnails, web and sound into one cohesive, motion-driven system.
            </p>
            <p className="text-sm md:text-base text-gray-700">
              Every frame, pixel and word is tuned for feeling, clarity and conversion. No templates. Only handcrafted work
              built around your story.
            </p>
          </div>
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-black via-black to-yellow-500/10 p-8 flex flex-col justify-between">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-3">Focus</p>
              <ul className="space-y-2 text-sm text-gray-200">
                <li>• Editing-first thinking across every asset.</li>
                <li>• Systems for creators, brands and studios.</li>
                <li>• Fast iteration, disciplined craft.</li>
              </ul>
            </div>
            <div className="flex justify-between items-end mt-8">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-1">Based in</p>
                <p className="text-sm">India • Working worldwide</p>
              </div>
              <span className="text-xs tracking-[0.25em] uppercase text-gray-400">Since 2025</span>
            </div>
          </div>
            </div>
          </SectionWrapper>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 md:py-20 border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-2">Services</p>
              <h2 className="text-2xl md:text-3xl font-semibold">A complete editing & design ecosystem.</h2>
              <p className="mt-3 text-sm text-gray-300 max-w-xl">
                From gaming montages to logos, thumbnails, social posts and full websites — Syntra is built to handle the
                entire funnel.
              </p>
            </div>
          </div>

          {/* Mega Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-4 py-2 rounded-full text-[10px] tracking-[0.25em] uppercase transition-all border ${
                    active
                      ? 'border-yellow-400/80 bg-yellow-400/10 text-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.25)]'
                      : 'border-white/10 text-gray-400 hover:border-yellow-300/60 hover:text-yellow-200'
                  }`}
                >
                  {cat}
                  {active && <span className="absolute inset-0 -z-10 blur-xl bg-yellow-400/10 rounded-full" />}
        </button>
              );
            })}
          </div>

          {/* Category Hero Banner */}
          <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 via-black to-yellow-500/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-2">
                {activeCategory === 'VIDEO' && 'Video Production & Editing'}
                {activeCategory === 'GRAPHICS' && 'Graphic Design & Branding'}
                {activeCategory === 'THUMBNAILS' && 'Thumbnail Design Suite'}
                {activeCategory === 'CONTENT' && 'Social Content & Copywriting'}
                {activeCategory === 'WEB' && 'Web Design & Digital Presence'}
              </p>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">
                {activeCategory === 'VIDEO' && 'High-impact visual storytelling in every format.'}
                {activeCategory === 'GRAPHICS' && 'Visual systems that make your brand unforgettable.'}
                {activeCategory === 'THUMBNAILS' && 'Thumbnails engineered for clicks — not guesswork.'}
                {activeCategory === 'CONTENT' && 'Words and visuals working together for attention.'}
                {activeCategory === 'WEB' && 'Web experiences tuned for speed, clarity and conversion.'}
              </h3>
              <p className="text-sm text-gray-200 max-w-xl">
                Click any service card below to explore galleries, videos, and examples.
              </p>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p className="tracking-[0.2em] uppercase">Syntra Service Stack</p>
              <p>
                {activeCategory === 'VIDEO' && 'Gaming • Tech • Shorts • Motion • Variety'}
                {activeCategory === 'GRAPHICS' && 'Logos • Banners • Merch • Menus'}
                {activeCategory === 'THUMBNAILS' && 'Elite • Premium • Standard tiers'}
                {activeCategory === 'CONTENT' && 'Instagram • Scripts • Social flows'}
                {activeCategory === 'WEB' && 'Responsive • Conversion-focused • SEO-ready'}
              </p>
            </div>
          </div>

          {/* Service Cards */}
          <div
            className={`grid gap-6 ${
              activeCategory === 'VIDEO'
                ? 'md:grid-cols-3'
                : activeCategory === 'GRAPHICS'
                ? 'md:grid-cols-2 lg:grid-cols-4'
                : activeCategory === 'THUMBNAILS'
                ? 'md:grid-cols-3'
                : activeCategory === 'CONTENT'
                ? 'md:grid-cols-2'
                : 'md:grid-cols-2'
            }`}
          >
            {getServicesForCategory(activeCategory).map((s, idx) => {
              const serviceData = getServiceData(activeCategory, s.title);
              const hasContent = serviceData && (serviceData.examples?.length > 0 || serviceData.videoShowcase?.length > 0);
              
              return (
                <div
                  key={s.title}
                  className={`group relative rounded-2xl border border-white/10 bg-black/60 p-5 flex flex-col justify-between overflow-hidden cursor-pointer transition-all hover:border-yellow-400/50 ${
                    activeCategory === 'VIDEO' && idx === 0 ? 'md:row-span-2' : ''
                  }`}
                  onClick={() => hasContent && handleServiceClick(s.title)}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-500/20 pointer-events-none" />
                  <div className="relative">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-gray-500 mb-3">{s.tag}</p>
                    <h4 className="text-sm md:text-base font-semibold mb-2">{s.title}</h4>
                    <p className="text-xs text-gray-300">{s.desc}</p>
                  </div>
                  <button
                    type="button"
                    className={`relative mt-5 text-[10px] tracking-[0.25em] uppercase flex items-center gap-2 transition ${
                      hasContent
                        ? 'text-gray-400 group-hover:text-yellow-300'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    disabled={!hasContent}
                  >
                    {hasContent ? (
                      <>
                        Learn more
                        <span className="translate-y-px group-hover:translate-x-0.5 transition">→</span>
                      </>
                    ) : (
                      'Coming soon'
                    )}
                  </button>
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 border border-yellow-400/40 rounded-2xl opacity-0 group-hover:opacity-100 transition" />
                </div>
              );
            })}
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="py-16 md:py-20 border-b border-white/5">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-2">Process</p>
              <h2 className="text-2xl md:text-3xl font-semibold">How we create — frame by frame.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute left-0 right-0 top-10 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
            {[
              {
                step: '01',
                title: 'Discovery',
                desc: 'Requirements, moodboards, references, constraints.',
              },
              {
                step: '02',
                title: 'Draft',
                desc: 'Sketches, storyboards, edit directions and styleframes.',
              },
              {
                step: '03',
                title: 'Edit',
                desc: 'Full creative execution across video, design and copy.',
              },
              {
                step: '04',
                title: 'Deliver',
                desc: 'On-time delivery plus space for iteration and refinement.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/60 p-5"
              >
                <div className="w-8 h-8 rounded-full border border-yellow-400/60 flex items-center justify-center text-[10px] tracking-[0.2em]">
                  {s.step}
                </div>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="text-xs text-gray-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Studio Section */}
        <section className="py-16 md:py-20 border-b border-white/5">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-2">Inside Syntra</p>
              <h2 className="text-2xl md:text-3xl font-semibold">A studio built around motion.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-3xl bg-gradient-to-tr from-white/10 via-white/0 to-yellow-400/15 border border-white/10 h-64 flex items-end p-6">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-200">Cameras · Timelines · Color · Sound</p>
            </div>
            <div className="rounded-3xl border border-white/10 h-64 flex items-end p-6">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400">
                Precision · Creativity · Speed · Depth · Discipline · Authenticity
        </p>
      </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-20 border-b border-white/5">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-2">Team</p>
              <h2 className="text-2xl md:text-3xl font-semibold">The people behind Syntra.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'JATIN', role: 'Creative Director / Lead Editor' },
              { name: '—', role: 'Design & Motion' },
              { name: '—', role: 'Sound & Web' },
            ].map((m, idx) => (
              <TeamCard key={`${m.name}-${m.role}`} name={m.name} role={m.role} delay={idx * 100} />
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-20 border-b border-white/5">
          <div className="mb-10 flex items-end justify-between gap-6">
                  <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-2">Testimonials</p>
              <h2 className="text-2xl md:text-3xl font-semibold">What our clients say.</h2>
                </div>
              </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonialsData.map((testimonial, idx) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} delay={idx * 70} />
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="contact-card">
              <div className="mb-8">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-2">Let's create</p>
                <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-white">Let's make something great.</h2>
                <p className="text-sm text-gray-300 max-w-lg">
                  Reach out via Instagram, WhatsApp or email — we'll respond in 1–2 business days.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <a
                  href="https://instagram.com/syntra"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram — Syntra"
                  className="group flex items-center gap-3 text-white hover:text-yellow-400 transition-all duration-300 hover:-translate-y-1"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="text-sm font-medium">Instagram</span>
                </a>
                <a
                  href="https://wa.me/1234567890?text=Hi%20Syntra,%20I%27d%20like%20to%20discuss%20a%20project"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp — Syntra"
                  className="group flex items-center gap-3 text-white hover:text-yellow-400 transition-all duration-300 hover:-translate-y-1"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-sm font-medium">WhatsApp</span>
                </a>
                <a
                  href="mailto:hello@syntra.com"
                  aria-label="Email — Syntra"
                  className="group flex items-center gap-3 text-white hover:text-yellow-400 transition-all duration-300 hover:-translate-y-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Email</span>
                </a>
              </div>

              {/* Contact Form */}
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
                <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                    className="w-full rounded-lg px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                />
                <input
                  type="email"
                  placeholder="Email"
                    className="w-full rounded-lg px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="Tell us about your project"
                  className="w-full rounded-lg px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 resize-none transition-all duration-300"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-yellow-400 text-black text-xs tracking-[0.25em] uppercase font-semibold hover:bg-yellow-300 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-yellow-400/20"
                >
                  Send Message →
                </button>
              </form>
            </div>
          </div>

          <footer className="mt-10 pt-6 border-t border-white/10 text-xs text-gray-400 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <span>© 2025 Syntra. Crafted with Creativity.</span>
            <div className="flex gap-6">
              <a href="#about" onClick={handleSmoothScroll} className="hover:text-yellow-400 transition-colors duration-300">
                About
              </a>
              <a href="#services" onClick={handleSmoothScroll} className="hover:text-yellow-400 transition-colors duration-300">
                Services
              </a>
              <a href="#testimonials" onClick={handleSmoothScroll} className="hover:text-yellow-400 transition-colors duration-300">
                Testimonials
              </a>
              <a href="#contact" onClick={handleSmoothScroll} className="hover:text-yellow-400 transition-colors duration-300">
                Contact
              </a>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
