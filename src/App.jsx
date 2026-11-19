import { useState, useEffect, useRef } from 'react';
import { servicesData } from './servicesData';
import { testimonialsData } from './testimonialsData';
import { useTheme } from './hooks/useTheme';
import { handleSmoothScroll, smoothScrollTo } from './utils/smoothScroll';
import { TeamCard } from './components/TeamCard';
import { TestimonialCard } from './components/TestimonialCard';
import { SectionWrapper } from './components/SectionWrapper';
import { ThemeSwitch } from './components/ThemeSwitch';
import { VideoEmbed } from './components/VideoEmbed';
import { MobileMenu } from './components/MobileMenu';
import Admin from './pages/Admin';
import { subscribeToAdditions, subscribeToNewServices } from './lib/contentStore';
import { ServicePage } from './components/ServicePage';
import { slugify, findServiceBySlug } from './utils/slug';

const categories = ['VIDEO', 'GRAPHICS', 'THUMBNAILS', 'CONTENT', 'WEB', 'AI_UGC'];

// ── Live Clock ────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

// ── Count-up hook ─────────────────────────────────────────────
function useCountUp(target, duration = 1800, trigger = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);
  return count;
}

// ── Stat counter card ─────────────────────────────────────────
function StatCard({ value, suffix = '+', label, trigger }) {
  const count = useCountUp(value, 1600, trigger);
  return (
    <div className="flex flex-col gap-1">
      <span className="stat-number">{count}{suffix}</span>
      <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
    </div>
  );
}

function App() {
  // If routing to admin page, bypass standard page loading immediately
  if (window.location.pathname === '/admin') {
    return <Admin />;
  }

  const [activeCategory, setActiveCategory] = useState('VIDEO');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsTrigger, setStatsTrigger] = useState(false);
  const statsRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  // Firestore real-time data states
  const [firestoreAdditions, setFirestoreAdditions] = useState({});
  const [firestoreNewServices, setFirestoreNewServices] = useState([]);

  // Subscribe to real-time Firestore content
  useEffect(() => {
    const unsubAdditions = subscribeToAdditions(setFirestoreAdditions);
    const unsubNewServices = subscribeToNewServices(setFirestoreNewServices);
    return () => {
      unsubAdditions();
      unsubNewServices();
    };
  }, []);

  // Merge static servicesData with real-time additions and custom categories/cards
  const getMergedServicesData = () => {
    const merged = {};

    // 1. Load static categories and cards
    categories.forEach(cat => {
      merged[cat] = {};
      const staticServices = servicesData[cat] || {};
      Object.keys(staticServices).forEach(title => {
        const s = staticServices[title];
        merged[cat][title] = {
          title: s.title,
          desc: s.desc,
          tag: s.tag,
          examples: [...(s.examples || [])],
          videoShowcase: [...(s.videoShowcase || [])],
          webPreview: [...(s.webPreview || [])],
          clientShowcases: s.clientShowcases ? [...s.clientShowcases] : undefined,
        };
      });
    });

    // 2. Load custom service cards
    firestoreNewServices.forEach(s => {
      if (!merged[s.category]) {
        merged[s.category] = {};
      }
      if (!merged[s.category][s.title]) {
        merged[s.category][s.title] = {
          title: s.title,
          desc: s.desc,
          tag: s.tag,
          examples: [],
          videoShowcase: [],
          webPreview: []
        };
      }
    });

    // 3. Merge custom added items (YouTube, Instagram, PDFs, etc.)
    Object.keys(firestoreAdditions).forEach(cat => {
      const catAdditions = firestoreAdditions[cat] || {};
      Object.keys(catAdditions).forEach(title => {
        const items = catAdditions[title] || [];
        if (!merged[cat]) merged[cat] = {};
        if (!merged[cat][title]) {
          merged[cat][title] = {
            title: title,
            desc: '',
            tag: 'Other',
            examples: [],
            videoShowcase: [],
            webPreview: []
          };
        }
        
        const service = merged[cat][title];
        items.forEach(item => {
          if (item.type === 'image') {
            service.examples.unshift({ image: item.src, title: item.title });
          } else if (item.type === 'website') {
            service.webPreview.unshift({ link: item.src, title: item.title, desc: item.description });
          } else {
            // youtube, drive, instagram, pdf
            service.videoShowcase.unshift({
              type: item.type,
              src: item.src,
              title: item.title,
              description: item.description
            });
          }
        });
      });
    });

    return merged;
  };

  const mergedData = getMergedServicesData();

  // Dynamic getters in component scope
  const getServiceData = (category, title) => mergedData[category]?.[title] || null;
  const getServicesForCategory = (category) =>
    Object.values(mergedData[category] || {}).map((s) => ({ title: s.title, desc: s.desc, tag: s.tag }));

  // Contact form state
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle');
  const [formErrors, setFormErrors] = useState({});

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formStatus !== 'idle') return;
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.message.trim()) errors.message = 'Please tell us about your project';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormStatus('submitting');
    setTimeout(() => setFormStatus('success'), 1500);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', message: '' });
    setFormStatus('idle');
    setFormErrors({});
  };

  // Handle direct URLs (deep linking) and browser Back/Forward navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;

      // 1. Direct service route: /services/:slug or /service/:slug
      if (path.startsWith('/services/') || path.startsWith('/service/')) {
        const slug = path.replace(/^\/services?\//, '').replace(/\/$/, '');
        const found = findServiceBySlug(mergedData, slug);
        if (found) {
          setSelectedService({ ...found.service, category: found.category });
          setActiveCategory(found.category);
          return;
        }
      }

      // 2. Direct section routes: /about, /services, /testimonials, /process, /contact, /ai-ugc
      const cleanPath = path.replace(/^\//, '').toLowerCase();
      if (cleanPath === 'ai-ugc' || cleanPath === 'aiugc' || cleanPath === 'ugc') {
        setSelectedService(null);
        setActiveCategory('AI_UGC');
        const target = document.getElementById('services');
        if (target) {
          setTimeout(() => smoothScrollTo(target, 500), 100);
        }
        return;
      }
      if (['about', 'services', 'testimonials', 'process', 'contact'].includes(cleanPath)) {
        setSelectedService(null);
        const target = document.getElementById(cleanPath);
        if (target) {
          setTimeout(() => smoothScrollTo(target, 500), 100);
        }
        return;
      }

      // 3. Anchor hash support
      if (window.location.hash) {
        if (window.location.hash.toLowerCase() === '#ai-ugc' || window.location.hash.toLowerCase() === '#aiugc') {
          setSelectedService(null);
          setActiveCategory('AI_UGC');
          const target = document.getElementById('services');
          if (target) setTimeout(() => smoothScrollTo(target, 500), 100);
          return;
        }
        const target = document.querySelector(window.location.hash);
        if (target) setTimeout(() => smoothScrollTo(target, 500), 100);
        return;
      }

      // 4. Default home
      if (path === '/' || path === '') {
        setSelectedService(null);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // ESC key & body scroll lock for modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (selectedImage) setSelectedImage(null);
      }
    };
    if (selectedImage) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  // Intersection observer for stats count-up
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsTrigger(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleServiceClick = (serviceTitle) => {
    const data = getServiceData(activeCategory, serviceTitle);
    if (data) {
      const slug = slugify(serviceTitle);
      window.history.pushState({ service: serviceTitle }, '', `/services/${slug}`);
      setSelectedService({ ...data, category: activeCategory });
    }
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    setSelectedService(null);
  };

  // If a dedicated service page is active, render the ServicePage component!
  if (selectedService) {
    return (
      <>
        <ServicePage
          service={selectedService}
          category={selectedService.category || activeCategory}
          theme={theme}
          onToggleTheme={toggleTheme}
          onBack={handleBackToHome}
          onImageClick={(img) => setSelectedImage(img)}
        />

        {/* Image Lightbox */}
        {selectedImage && (
          <div
            className="lightbox-overlay is-open"
            onClick={() => setSelectedImage(null)}
            role="dialog" aria-modal="true" aria-labelledby="lightbox-title" aria-describedby="lightbox-desc"
          >
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedImage(null)} className="lightbox-close" aria-label="Close image viewer (Press Escape)" autoFocus>×</button>
              <img src={selectedImage.src} alt={selectedImage.alt} className="lightbox-image" id="lightbox-title" />
              <span id="lightbox-desc" className="sr-only">Press Escape or click outside to close</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.035]"
          style={{ background: 'radial-gradient(circle, #FFD100 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.025]"
          style={{ background: 'radial-gradient(circle, #FFD100 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onNavigate={handleSmoothScroll} />

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="lightbox-overlay is-open"
          onClick={() => setSelectedImage(null)}
          role="dialog" aria-modal="true" aria-labelledby="lightbox-title" aria-describedby="lightbox-desc"
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="lightbox-close" aria-label="Close image viewer (Press Escape)" autoFocus>×</button>
            <img src={selectedImage.src} alt={selectedImage.alt} className="lightbox-image" id="lightbox-title" />
            <span id="lightbox-desc" className="sr-only">Press Escape or click outside to close</span>
          </div>
        </div>
      )}



      {/* ── HEADER ── */}
      <header
        className="fixed top-0 left-0 right-0 z-30 border-b backdrop-blur-2xl transition-colors duration-300"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--header-bg)' }}
        role="banner"
      >
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-black focus:rounded focus:outline-none">
          Skip to main content
        </a>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/syntra-logo.png" alt="Syntra — Creative Studio" className="h-8 w-auto" />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.18em] uppercase font-medium"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-tertiary)' }} aria-label="Main navigation">
            {['about', 'services', 'testimonials', 'process', 'contact'].map((link) => (
              <a key={link} href={`#${link}`} onClick={handleSmoothScroll}
                className="hover:text-yellow-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-1 py-1"
                style={{ color: 'var(--text-tertiary)' }}>
                {link.charAt(0).toUpperCase() + link.slice(1)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <ThemeSwitch theme={theme} onToggle={toggleTheme} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen} aria-controls="mobile-menu"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-primary)' }}>
                {mobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
            <a href="#contact" onClick={handleSmoothScroll}
              className="hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase font-semibold border px-5 py-2.5 rounded-full btn-shimmer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              style={{ borderColor: 'var(--brand-yellow)', color: '#080808' }}>
              Start a project →
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-20" id="main-content" role="main">

        {/* ── HERO ── */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 border-b" style={{ borderColor: 'var(--border-color)' }}>
          {/* Side labels */}
          <div className="hidden lg:flex flex-col gap-4 absolute -left-4 top-1/2 -translate-y-1/2 text-[9px] tracking-[0.4em] uppercase rotate-180 [writing-mode:vertical-rl]" style={{ color: 'var(--text-muted)' }}>
            <span>Experiential</span><span>Branding</span><span>Digital</span>
          </div>
          <div className="hidden lg:flex flex-col gap-4 absolute -right-4 top-1/2 -translate-y-1/2 text-[9px] tracking-[0.4em] uppercase [writing-mode:vertical-rl]" style={{ color: 'var(--text-muted)' }}>
            <span>India</span><span>IST</span><span><LiveClock /></span>
          </div>

          <div className="grid md:grid-cols-[1.2fr,1fr] gap-12 items-center">
            <div>
              <div className="pill-label mb-8 inline-flex">Editing-first creative studio</div>

              <div className="space-y-3 mb-8">
                <h1 className="font-bold leading-[1.05] tracking-tight" style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.8rem, 7vw, 6rem)',
                  color: 'var(--text-primary)'
                }}>
                  We craft stories
                  <br />
                  <span style={{ color: 'var(--brand-yellow)' }}>that convert.</span>
                </h1>
                <p className="text-lg md:text-xl font-light max-w-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Syntra is a motion-first editing agency. From raw footage to thumbnails, logos to full websites — every frame is tuned for <em>impact</em>.
                </p>
              </div>

              {/* Stats strip */}
              <div className="flex flex-wrap gap-8 mb-10 py-6 border-y" style={{ borderColor: 'var(--border-color)' }}>
                {[
                  { val: '150', suffix: '+', label: 'Projects' },
                  { val: '60', suffix: '+', label: 'Happy Clients' },
                  { val: '5', suffix: '+', label: 'Countries' },
                  { val: '100', suffix: '%', label: 'Delivery Rate' },
                  { val: '2023', suffix: '', label: 'Founded' },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-yellow)' }}>
                      {s.val}{s.suffix}
                    </span>
                    <span className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <a href="#services" onClick={handleSmoothScroll}
                  className="btn-shimmer inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[11px] tracking-[0.2em] uppercase font-bold shadow-lg hover:scale-105 transition-all duration-300">
                  View Services →
                </a>
                <a href="#contact" onClick={handleSmoothScroll}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[11px] tracking-[0.2em] uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                  Start a project
                </a>
              </div>
            </div>

            {/* Hero card */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-16 h-16 border border-yellow-400/40 rounded-2xl" aria-hidden="true" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border rounded-full opacity-30" style={{ borderColor: 'var(--border-color)' }} aria-hidden="true" />
              <div className="relative border rounded-3xl p-6 backdrop-blur-sm" style={{
                background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)`,
                borderColor: 'var(--border-color)'
              }}>
                <div className="aspect-[4/5] rounded-2xl border relative overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-color)' }}>
                  <div className="absolute inset-6">
                    <div className="absolute inset-y-2 left-1/2 w-px bg-gradient-to-b from-yellow-300/70 via-yellow-400/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 h-10 border border-yellow-500/50 rounded-xl flex items-center justify-between px-3 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,209,0,0.7)' }}>
                      <span>Timeline</span><span>00:43 / 02:17</span>
                    </div>
                    <div className="absolute top-6 left-6 w-20 h-20 rounded-full border border-yellow-400/50" />
                    <div className="absolute top-14 right-8 w-24 h-24 border border-yellow-200/20 rotate-6" />
                    <div className="absolute left-1/4 top-1/3 w-36 h-36 border border-yellow-300/20 rounded-[40%] rotate-[-18deg]" />
                    <p className="absolute left-6 bottom-20 text-xs max-w-[9rem] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                      Editing · motion · sound · identity — choreographed together.
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-tertiary)' }}>
                  Experiential — Branding — Digital
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="py-6 border-b marquee-wrap" style={{ borderColor: 'var(--border-color)' }} aria-hidden="true">
          <div className="marquee-track">
            {[1, 2].map((rep) => (
              <div key={rep} className="flex items-center gap-10 pr-10">
                {['Video Editing', '✦ AI UGC Ads', 'Static Ad Creatives', 'Motion Graphics', 'Brand Identity', 'Thumbnail Design', 'Web Design', 'AI Avatars', 'Content Strategy', 'Logo Design', 'Reels & Shorts', '✦ AI Video Ads'].map((item) => (
                  <span key={item} className="flex items-center gap-4 whitespace-nowrap">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.startsWith('✦') ? 'bg-purple-400' : 'bg-yellow-400'}`} />
                    <span className={`text-[11px] tracking-[0.3em] uppercase font-semibold ${item.startsWith('✦') ? 'text-purple-400/70' : ''}`}
                      style={item.startsWith('✦') ? {} : { color: 'var(--text-tertiary)' }}>
                      {item}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── ABOUT ── */}
        <section id="about" className="py-20 md:py-28 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <SectionWrapper>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Left — main card */}
              <div className="relative rounded-3xl border p-8 md:p-10 overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" aria-hidden="true" />
                <div className="pill-label mb-6 inline-flex">We are Syntra</div>
                <h2 className="text-2xl md:text-3xl font-bold mb-5 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  A creative studio shaping digital experiences — frame by frame.
                </h2>
                <p className="text-sm md:text-base mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  We combine video editing, graphic design, thumbnails, web and sound into one cohesive, motion-driven system.
                </p>
                <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Every frame, pixel and word is tuned for feeling, clarity and conversion. No templates. Only handcrafted work built around your story.
                </p>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border border-yellow-400/10" aria-hidden="true" />
              </div>

              {/* Right — focus + meta */}
              <div className="flex flex-col gap-6">
                <div className="rounded-3xl border p-6 md:p-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <p className="eyebrow mb-4">Our Focus</p>
                  <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {[
                      'Editing-first thinking across every asset.',
                      'Systems for creators, brands and studios.',
                      'Fast iteration, disciplined craft.',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border p-5 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <p className="eyebrow mb-2">Based in</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>India</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Working worldwide</p>
                  </div>
                  <div className="rounded-2xl border p-5 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <p className="eyebrow mb-2">Founded</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>2025</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Since day one</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" className="py-20 md:py-28 border-b" style={{ borderColor: 'var(--border-color)' }}>
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <div className="pill-label mb-4 inline-flex">Services</div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                A complete editing &amp;<br className="hidden md:block" /> design ecosystem.
              </h2>
              <p className="mt-4 text-base max-w-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                From gaming montages to logos, thumbnails, social posts and full websites — Syntra handles the entire funnel.
              </p>
            </div>
            <a href="#contact" onClick={handleSmoothScroll}
              className="shrink-0 btn-shimmer inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[11px] tracking-[0.2em] uppercase font-bold shadow-lg hover:scale-105 transition-all duration-300">
              Start a project →
            </a>
          </div>

          {/* Tab switcher */}
          <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Service categories">
            {categories.map((cat) => {
              const active = cat === activeCategory;
              const isAI = cat === 'AI_UGC';
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${cat}-panel`}
                  id={`${cat}-tab`}
                  onClick={() => {
                    setActiveCategory(cat);
                    if (cat === 'AI_UGC') {
                      window.history.pushState({}, '', '#ai-ugc');
                    } else if (window.location.hash === '#ai-ugc') {
                      window.history.pushState({}, '', '#services');
                    }
                  }}
                  className={`relative px-5 py-2.5 rounded-full text-[10px] tracking-[0.25em] uppercase font-semibold transition-all border focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                    active
                      ? isAI
                        ? 'border-purple-400/70 bg-purple-400/10 text-purple-400 shadow-[0_0_28px_rgba(167,139,250,0.25)]'
                        : 'border-yellow-400/70 bg-yellow-400/10 text-yellow-400 shadow-[0_0_28px_rgba(255,209,0,0.2)]'
                      : isAI
                        ? 'hover:border-purple-400/50 hover:text-purple-300'
                        : 'hover:border-yellow-300/50 hover:text-yellow-300'
                  }`}
                  style={{ borderColor: active ? undefined : 'var(--border-color)', color: active ? undefined : isAI ? 'rgba(167,139,250,0.7)' : 'var(--text-tertiary)' }}
                >
                  {isAI ? '✦ AI UGC' : cat}
                  {active && <span className={`absolute inset-0 -z-10 blur-xl ${isAI ? 'bg-purple-400/8' : 'bg-yellow-400/8'} rounded-full`} aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {/* Category banner */}
          {activeCategory === 'AI_UGC' ? (
            /* ── AI UGC Special Showcase Banner ── */
            <div className="mb-10 rounded-3xl border p-7 md:p-10 relative overflow-hidden"
              style={{ borderColor: 'rgba(167,139,250,0.3)', background: 'linear-gradient(135deg, rgba(88,28,135,0.08) 0%, rgba(167,139,250,0.06) 50%, rgba(255,209,0,0.05) 100%)' }}>
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" aria-hidden="true"
                style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'translate(30%, -30%)' }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none" aria-hidden="true"
                style={{ background: 'radial-gradient(circle, rgba(255,209,0,0.1) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'translate(-30%, 30%)' }} />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] tracking-[0.3em] uppercase font-bold mb-4"
                    style={{ background: 'rgba(167,139,250,0.15)', color: 'rgba(167,139,250,0.9)', border: '1px solid rgba(167,139,250,0.3)' }}>
                    <span>✦</span> AI-Powered Advertising
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    AI UGC Ads — the future of<br className="hidden md:block" /> performance creative.
                  </h3>
                  <p className="text-sm max-w-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    We build hyper-realistic AI avatar ads, static ad creatives, and video UGC that convert — no actors, no studios. Built for Meta, TikTok, YouTube &amp; Google.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-5">
                    {['AI Avatars', 'Video Ads', 'Static Creatives', 'Hook-First Scripts', 'Multi-Platform'].map((tag) => (
                      <span key={tag} className="text-[9px] tracking-[0.2em] uppercase font-semibold px-3 py-1 rounded-full"
                        style={{ background: 'rgba(167,139,250,0.1)', color: 'rgba(167,139,250,0.8)', border: '1px solid rgba(167,139,250,0.2)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 shrink-0 md:text-right">
                  <p className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'var(--text-muted)' }}>Syntra AI Stack</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>Static · Video · Avatars · Voiceover<br />Hooks · Scripts · Multi-platform</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 rounded-3xl border p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              style={{ borderColor: 'var(--border-color)', background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)` }}>
              <div>
                <p className="eyebrow mb-2">
                  {activeCategory === 'VIDEO' && 'Video Production & Editing'}
                  {activeCategory === 'GRAPHICS' && 'Graphic Design & Branding'}
                  {activeCategory === 'THUMBNAILS' && 'Thumbnail Design Suite'}
                  {activeCategory === 'CONTENT' && 'Social Content & Copywriting'}
                  {activeCategory === 'WEB' && 'Web Design & Digital Presence'}
                </p>
                <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  {activeCategory === 'VIDEO' && 'High-impact visual storytelling in every format.'}
                  {activeCategory === 'GRAPHICS' && 'Visual systems that make your brand unforgettable.'}
                  {activeCategory === 'THUMBNAILS' && 'Thumbnails engineered for clicks — not guesswork.'}
                  {activeCategory === 'CONTENT' && 'Words and visuals working together for attention.'}
                  {activeCategory === 'WEB' && 'Web experiences tuned for speed, clarity and conversion.'}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Click any service card to explore galleries, videos, and examples.</p>
              </div>
              <div className="text-xs shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                <p className="tracking-widest uppercase mb-1">Syntra Service Stack</p>
                <p className="leading-relaxed">
                  {activeCategory === 'VIDEO' && 'Gaming · Tech · Shorts · AI UGC · Motion · Variety'}
                  {activeCategory === 'GRAPHICS' && 'Logos · Banners · Merch · Menus'}
                  {activeCategory === 'THUMBNAILS' && 'Elite · Premium · Standard tiers'}
                  {activeCategory === 'CONTENT' && 'Instagram · Scripts · Social flows'}
                  {activeCategory === 'WEB' && 'Responsive · Conversion-focused · SEO-ready'}
                </p>
              </div>
            </div>
          )}

          {/* ── AI UGC Client Showcases (only for AI_UGC category, Static Ads service) ── */}
          {activeCategory === 'AI_UGC' && (
            <div className="mb-10">
              {/* Sub-header for client showcases */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(167,139,250,0.4), transparent)' }} />
                <span className="text-[9px] tracking-[0.35em] uppercase font-semibold" style={{ color: 'rgba(167,139,250,0.7)' }}>UI UGC Static Ad Showcases</span>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(167,139,250,0.4), transparent)' }} />
              </div>
              <div className="grid md:grid-cols-2 gap-5 mb-10">
                {/* Arovia.ai Client Card */}
                <div className="rounded-3xl border p-6 md:p-8 relative overflow-hidden group"
                  style={{ borderColor: 'rgba(167,139,250,0.25)', background: 'linear-gradient(135deg, rgba(88,28,135,0.07) 0%, rgba(14,14,14,0.6) 100%)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" aria-hidden="true"
                    style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] tracking-[0.25em] uppercase font-bold mb-3"
                          style={{ background: 'rgba(167,139,250,0.15)', color: 'rgba(167,139,250,0.9)', border: '1px solid rgba(167,139,250,0.25)' }}>
                          AI Static Ads
                        </div>
                        <h4 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Arovia.ai</h4>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>AI Platform · Static Ad Creatives</p>
                      </div>
                      <a href="https://aroviaai.com/" target="_blank" rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] tracking-[0.2em] uppercase font-semibold transition-all duration-300 hover:scale-105"
                        style={{ background: 'rgba(167,139,250,0.15)', color: 'rgba(167,139,250,0.9)', border: '1px solid rgba(167,139,250,0.3)' }}>
                        Visit site ↗
                      </a>
                    </div>
                    <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Hyper-realistic AI avatar visuals and product ad creatives for performance campaigns — engineered for Meta &amp; Google.
                    </p>
                    <div className="rounded-2xl flex items-center justify-center min-h-[120px]"
                      style={{ background: 'rgba(167,139,250,0.06)', border: '1px dashed rgba(167,139,250,0.2)' }}>
                      <div className="text-center py-8 px-4">
                        <p className="text-[9px] tracking-[0.3em] uppercase font-semibold mb-1" style={{ color: 'rgba(167,139,250,0.5)' }}>Ad creatives coming soon</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Static ad gallery will appear here</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Anohga Yoga Studio Client Card */}
                <div className="rounded-3xl border p-6 md:p-8 relative overflow-hidden group"
                  style={{ borderColor: 'rgba(167,139,250,0.25)', background: 'linear-gradient(135deg, rgba(20,83,45,0.07) 0%, rgba(14,14,14,0.6) 100%)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" aria-hidden="true"
                    style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] tracking-[0.25em] uppercase font-bold mb-3"
                          style={{ background: 'rgba(74,222,128,0.12)', color: 'rgba(74,222,128,0.9)', border: '1px solid rgba(74,222,128,0.2)' }}>
                          AI Static Ads
                        </div>
                        <h4 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Anohga Yoga Studio</h4>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>Wellness Brand · Static Ad Creatives</p>
                      </div>
                    </div>
                    <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Calm, atmospheric AI-generated static ads for yoga studio marketing — crafted for serenity, brand resonance and conversion.
                    </p>
                    <div className="rounded-2xl flex items-center justify-center min-h-[120px]"
                      style={{ background: 'rgba(74,222,128,0.04)', border: '1px dashed rgba(74,222,128,0.18)' }}>
                      <div className="text-center py-8 px-4">
                        <p className="text-[9px] tracking-[0.3em] uppercase font-semibold mb-1" style={{ color: 'rgba(74,222,128,0.5)' }}>Ad creatives coming soon</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Static ad gallery will appear here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Bento Grid */}
          <div
            className={`grid gap-5 ${
              activeCategory === 'VIDEO' ? 'md:grid-cols-3'
              : activeCategory === 'GRAPHICS' ? 'md:grid-cols-2 lg:grid-cols-4'
              : activeCategory === 'THUMBNAILS' ? 'md:grid-cols-3'
              : activeCategory === 'AI_UGC' ? 'md:grid-cols-2'
              : 'md:grid-cols-2'
            }`}
            role="tabpanel"
            id={`${activeCategory}-panel`}
            aria-labelledby={`${activeCategory}-tab`}
          >
            {getServicesForCategory(activeCategory).map((s, idx) => {
              const serviceData = getServiceData(activeCategory, s.title);
              const hasContent = serviceData && (serviceData.examples?.length > 0 || serviceData.videoShowcase?.length > 0 || serviceData.webPreview?.length > 0);
              const isAICategory = activeCategory === 'AI_UGC';

              return (
                <article
                  key={s.title}
                  className={`bento-card group relative p-7 flex flex-col justify-between cursor-pointer ${isAICategory ? 'min-h-[200px]' : ''}`}
                  style={isAICategory ? { borderColor: 'rgba(167,139,250,0.2)', background: 'linear-gradient(135deg, rgba(88,28,135,0.05) 0%, var(--bg-card) 100%)' } : {}}
                  onClick={() => handleServiceClick(s.title)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleServiceClick(s.title); } }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${s.title}`}
                >
                  {/* Hover gradient fill */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ${isAICategory ? 'bg-gradient-to-br from-purple-400/8 via-transparent to-purple-500/12' : 'bg-gradient-to-br from-yellow-400/8 via-transparent to-yellow-500/12'} pointer-events-none rounded-[20px]`} aria-hidden="true" />

                  <div className="relative">
                    <p className={`eyebrow mb-3 ${isAICategory ? 'text-purple-400/80' : ''}`}>{s.tag}</p>
                    <h4 className="text-lg md:text-xl font-bold mb-3 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{s.title}</h4>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                  </div>

                  <div className={`relative mt-7 text-[10px] tracking-[0.25em] uppercase flex items-center gap-2 font-semibold transition-all duration-300 group-hover:gap-3 ${isAICategory ? 'text-purple-400/60' : ''}`}
                    style={isAICategory ? {} : { color: 'var(--text-tertiary)' }}
                    aria-hidden="true">
                    <span>Explore</span><span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>

                  {/* Decorative corner */}
                  <div className={`absolute -right-4 -bottom-4 w-16 h-16 border ${isAICategory ? 'border-purple-400/20' : 'border-yellow-400/20'} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-400`} aria-hidden="true" />
                </article>
              );
            })}
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section id="process" className="py-20 md:py-28 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="mb-14">
            <div className="pill-label mb-4 inline-flex">Process</div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              How we create —<br className="hidden md:block" /> frame by frame.
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-0 right-0 top-14 h-px bg-gradient-to-r from-transparent via-yellow-400/25 to-transparent" aria-hidden="true" />
            {[
              { step: '01', title: 'Discovery', desc: 'Requirements, moodboards, references, and creative constraints.' },
              { step: '02', title: 'Draft', desc: 'Sketches, storyboards, edit directions and styleframes.' },
              { step: '03', title: 'Edit', desc: 'Full creative execution across video, design and copy.' },
              { step: '04', title: 'Deliver', desc: 'On-time delivery plus space for iteration and refinement.' },
            ].map((s) => (
              <div
                key={s.step}
                className="process-card bento-card relative flex flex-col gap-4 p-6"
              >
                <div className="step-num">{s.step}</div>
                <div>
                  <h3 className="text-base font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="py-20 md:py-28 border-b" style={{ borderColor: 'var(--border-color)' }} ref={statsRef}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="pill-label mb-4 inline-flex">Inside Syntra</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                A studio built around motion. Numbers that prove it.
              </h2>
              <p className="text-sm leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
                Every project is a collaboration — fast, transparent, handcrafted. Here's where we stand.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="bento-card p-6">
                <StatCard value={150} suffix="+" label="Projects" trigger={statsTrigger} />
              </div>
              <div className="bento-card p-6">
                <StatCard value={60} suffix="+" label="Happy Clients" trigger={statsTrigger} />
              </div>
              <div className="bento-card p-6">
                <StatCard value={5} suffix="+" label="Countries" trigger={statsTrigger} />
              </div>
              <div className="bento-card p-6">
                <StatCard value={100} suffix="%" label="Delivery Rate" trigger={statsTrigger} />
              </div>
              <div className="bento-card p-6 col-span-2">
                <StatCard value={2023} suffix="" label="Founded" trigger={statsTrigger} />
              </div>
            </div>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="py-20 md:py-28 border-b" style={{ borderColor: 'var(--border-color)' }} id="team-section">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <div className="pill-label mb-4 inline-flex">Team</div>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                The people behind Syntra.
              </h2>
            </div>
          </div>
          <div className="flex justify-center max-w-4xl mx-auto">
            {[{ name: 'JATIN', role: 'Owner / Founder' }].map((m, idx) => (
              <div key={`${m.name}-${m.role}`} className="w-full max-w-md">
                <TeamCard name={m.name} role={m.role} delay={idx * 100} />
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" className="py-20 md:py-28 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="mb-12">
            <div className="pill-label mb-4 inline-flex">Testimonials</div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              What our clients say.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonialsData.map((testimonial, idx) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} delay={idx * 70} />
            ))}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="py-20 md:py-28">
          <div className="grid md:grid-cols-[1fr,1.1fr] gap-12 items-start">
            {/* Left */}
            <div className="md:sticky md:top-28">
              <div className="pill-label mb-6 inline-flex">Let's create</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Let's make<br />something<br /><span style={{ color: 'var(--brand-yellow)' }}>great.</span>
              </h2>
              <p className="text-sm leading-relaxed mb-10 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                Reach out via Instagram, WhatsApp or email — we'll respond in 1–2 business days.
              </p>

              {/* Social pill chips */}
              <div className="flex flex-col gap-3">
                {[
                  {
                    id: 'social-instagram', href: 'https://instagram.com/syntra.studio',
                    label: 'Instagram', sublabel: '@syntra.studio',
                    icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />,
                    viewBox: '0 0 24 24', fill: true
                  },
                  {
                    id: 'social-whatsapp', href: 'https://wa.me/+918448865446?text=Hi%20Syntra,%20I%27d%20like%20to%20discuss%20a%20project',
                    label: 'WhatsApp', sublabel: '+91 8448 865 446',
                    icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />,
                    viewBox: '0 0 24 24', fill: true
                  },
                  {
                    id: 'social-email', href: 'mailto:jatinmakhija1005@gmail.com',
                    label: 'Email', sublabel: 'jatinmakhija1005@gmail.com',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                    viewBox: '0 0 24 24', fill: false
                  },
                ].map((social) => (
                  <a
                    key={social.id}
                    id={social.id}
                    href={social.href}
                    target={social.href.startsWith('mailto') ? undefined : '_blank'}
                    rel={social.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    aria-label={`${social.label} — Syntra`}
                    className="group flex items-center gap-4 px-5 py-3.5 rounded-2xl border transition-all duration-300 hover:border-yellow-400/60 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-yellow-400/10"
                      style={{ backgroundColor: 'var(--bg-overlay)' }}>
                      <svg className="w-4 h-4" viewBox={social.viewBox}
                        fill={social.fill ? 'currentColor' : 'none'}
                        stroke={social.fill ? undefined : 'currentColor'}
                        style={{ color: 'var(--text-tertiary)' }} aria-hidden="true">
                        {social.icon}
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold transition-colors group-hover:text-yellow-400" style={{ color: 'var(--text-primary)' }}>{social.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{social.sublabel}</p>
                    </div>
                    <span className="ml-auto text-xs transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} aria-hidden="true">→</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="contact-card">
              {formStatus === 'success' ? (
                <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-[0_0_24px_rgba(255,209,0,0.2)]"
                    style={{ backgroundColor: 'rgba(255,209,0,0.1)', border: '2px solid rgba(255,209,0,0.5)' }}>
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-yellow-400" style={{ fontFamily: 'var(--font-display)' }}>Message Sent!</h3>
                  <p className="text-sm max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Thank you, <strong className="text-yellow-400">{formData.name}</strong>. Your inquiry has been received. We'll get back to you at <strong style={{ color: 'var(--text-primary)' }}>{formData.email}</strong> in 1–2 business days.
                  </p>
                  <button onClick={resetForm}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-yellow-400 text-yellow-400 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-yellow-400 hover:text-black hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleFormSubmit} noValidate>
                  <div>
                    <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Send us a message</h3>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>We respond within 1–2 business days.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1">
                      <input
                        type="text" id="contact-name" placeholder=" "
                        value={formData.name}
                        onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' })); }}
                        className="w-full rounded-xl px-4 py-3 text-sm border outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all duration-300"
                        style={{ backgroundColor: 'var(--bg-overlay)', borderColor: formErrors.name ? '#ef4444' : 'var(--border-color)', color: 'var(--text-primary)' }}
                        aria-describedby={formErrors.name ? 'name-error' : undefined}
                      />
                      <label htmlFor="contact-name" className="text-xs font-medium px-1" style={{ color: 'var(--text-tertiary)' }}>Your name</label>
                      {formErrors.name && <p id="name-error" className="text-red-500 text-xs font-medium">{formErrors.name}</p>}
                    </div>
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <input
                        type="email" id="contact-email" placeholder=" "
                        value={formData.email}
                        onChange={(e) => { setFormData(prev => ({ ...prev, email: e.target.value })); if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' })); }}
                        className="w-full rounded-xl px-4 py-3 text-sm border outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all duration-300"
                        style={{ backgroundColor: 'var(--bg-overlay)', borderColor: formErrors.email ? '#ef4444' : 'var(--border-color)', color: 'var(--text-primary)' }}
                        aria-describedby={formErrors.email ? 'email-error' : undefined}
                      />
                      <label htmlFor="contact-email" className="text-xs font-medium px-1" style={{ color: 'var(--text-tertiary)' }}>Email address</label>
                      {formErrors.email && <p id="email-error" className="text-red-500 text-xs font-medium">{formErrors.email}</p>}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1">
                    <textarea
                      rows={5} id="contact-message" placeholder=" "
                      value={formData.message}
                      onChange={(e) => { setFormData(prev => ({ ...prev, message: e.target.value })); if (formErrors.message) setFormErrors(prev => ({ ...prev, message: '' })); }}
                      className="w-full rounded-xl px-4 py-3 text-sm border outline-none focus:ring-2 focus:ring-yellow-400/40 resize-none transition-all duration-300"
                      style={{ backgroundColor: 'var(--bg-overlay)', borderColor: formErrors.message ? '#ef4444' : 'var(--border-color)', color: 'var(--text-primary)' }}
                      aria-describedby={formErrors.message ? 'message-error' : undefined}
                    />
                    <label htmlFor="contact-message" className="text-xs font-medium px-1" style={{ color: 'var(--text-tertiary)' }}>Tell us about your project</label>
                    {formErrors.message && <p id="message-error" className="text-red-500 text-xs font-medium">{formErrors.message}</p>}
                  </div>

                  <button
                    type="submit" id="contact-submit"
                    disabled={formStatus === 'submitting'}
                    className="btn-shimmer w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[11px] tracking-[0.25em] uppercase font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {formStatus === 'submitting' ? (
                      <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" aria-hidden="true" />Sending...</>
                    ) : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ── FOOTER ── */}
          <footer className="mt-20 pt-10 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div>
                <img src="/assets/syntra-logo.png" alt="Syntra" className="h-7 w-auto mb-3 opacity-80" />
                <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--text-tertiary)' }}>
                  A motion-first creative studio crafting stories that convert — based in India, working worldwide.
                </p>
              </div>
              {/* Nav */}
              <div>
                <p className="eyebrow mb-4">Navigate</p>
                <div className="flex flex-col gap-2.5">
                  {['about', 'services', 'testimonials', 'process', 'contact'].map((link) => (
                    <a key={link} href={`#${link}`} onClick={handleSmoothScroll}
                      className="text-sm hover:text-yellow-400 transition-colors duration-300 w-fit"
                      style={{ color: 'var(--text-tertiary)' }}>
                      {link.charAt(0).toUpperCase() + link.slice(1)}
                    </a>
                  ))}
                </div>
              </div>
              {/* Social */}
              <div>
                <p className="eyebrow mb-4">Connect</p>
                <div className="flex flex-col gap-2.5">
                  <a href="https://instagram.com/syntra.studio" target="_blank" rel="noopener noreferrer"
                    className="text-sm hover:text-yellow-400 transition-colors duration-300 w-fit" style={{ color: 'var(--text-tertiary)' }}>
                    Instagram
                  </a>
                  <a href="https://wa.me/+918448865446" target="_blank" rel="noopener noreferrer"
                    className="text-sm hover:text-yellow-400 transition-colors duration-300 w-fit" style={{ color: 'var(--text-tertiary)' }}>
                    WhatsApp
                  </a>
                  <a href="mailto:jatinmakhija1005@gmail.com"
                    className="text-sm hover:text-yellow-400 transition-colors duration-300 w-fit" style={{ color: 'var(--text-tertiary)' }}>
                    Email
                  </a>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2025 Syntra. All rights reserved.</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Crafted with ♥ in India</span>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
