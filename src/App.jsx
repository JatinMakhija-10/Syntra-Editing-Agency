import { useState, useEffect, useRef } from 'react';
import { servicesData } from './servicesData';
import { clientsData } from './clientsData';
import { useTheme } from './hooks/useTheme';
import { handleSmoothScroll, smoothScrollTo, scrollToTop } from './utils/smoothScroll';
import { TeamCard } from './components/TeamCard';
import { ClientCard } from './components/ClientCard';
import { SectionWrapper } from './components/SectionWrapper';
import { ThemeSwitch } from './components/ThemeSwitch';
import { VideoEmbed } from './components/VideoEmbed';
import { MobileMenu } from './components/MobileMenu';
import Admin from './pages/Admin';
import { subscribeToAdditions, subscribeToNewServices } from './lib/contentStore';
import { ServicePage } from './components/ServicePage';
import { slugify, findServiceBySlug } from './utils/slug';
import SocialCarouselCard from './components/SocialCarouselCard';
import LightboxModal from './components/LightboxModal';
import HeroCuttingBay from './components/HeroCuttingBay';
import CommandPalette from './components/CommandPalette';
import FloatingNav from './components/FloatingNav';
import ProcessExplorer from './components/ProcessExplorer';

const categories = ['VIDEO', 'GRAPHICS', 'THUMBNAILS', 'CONTENT', 'WEB', 'AI_UGC', 'AUTOMATION'];

const categoryTabs = [
  { id: 'ALL', label: 'All Services' },
  { id: 'UPCOMING', label: '✦ Upcoming Labs', isHighlight: true },
  { id: 'AUTOMATION', label: '✦ Automation & Bots', isHighlight: true },
  { id: 'AI_UGC', label: 'AI UGC Ads', isHighlight: true },
  { id: 'VIDEO', label: 'Video Editing' },
  { id: 'GRAPHICS', label: 'Graphic Design' },
  { id: 'THUMBNAILS', label: 'Thumbnails' },
  { id: 'CONTENT', label: 'Content & Copy' },
  { id: 'WEB', label: 'Web & Growth' },
];

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

const aiUgcPosters = [
  {
    id: 'poster-arovia-dhanteras',
    client: 'arovia',
    clientName: 'Arovia.ai',
    title: 'Arovia.ai — Dhanteras: The Greatest Wealth',
    subtitle: 'Festive Health Intelligence Ad Creative',
    src: '/assets/arovia/posters/dhanteras-greatest-wealth.webp',
    badge: 'Festive Ad',
  },
  {
    id: 'poster-arovia-dussehra',
    client: 'arovia',
    clientName: 'Arovia.ai',
    title: 'Arovia.ai — Dussehra: Clarity Over Confusion',
    subtitle: 'Brand Storytelling Key Visual',
    src: '/assets/arovia/posters/dussehra-clarity-over-confusion.webp',
    badge: 'Brand Story',
  },
  {
    id: 'poster-arovia-diwali',
    client: 'arovia',
    clientName: 'Arovia.ai',
    title: 'Arovia.ai — Diwali: Let Light Find Its Way Within',
    subtitle: 'Festive Campaign Key Visual',
    src: '/assets/arovia/posters/diwali-light-within.webp',
    badge: 'Festive Ad',
  },
  {
    id: 'poster-anohga-move-better',
    client: 'anohga',
    clientName: 'Anohga Yoga Studio',
    title: 'Move Better — Flexibility & Mobility',
    subtitle: 'Session Launch Ad Creative',
    src: '/assets/anohga/anohga-move-better-flexibility.webp',
    badge: 'Session Creative',
  },
  {
    id: 'poster-anohga-pack-visual',
    client: 'anohga',
    clientName: 'Anohga Yoga Studio',
    title: 'Anohga Yoga Studio — Flexibility & Mobility Pack',
    subtitle: '6-Pillar Studio Launch Visual',
    src: '/assets/anohga/anohga-flexibility-mobility-key-visual.webp',
    badge: 'Key Visual',
  },
  {
    id: 'poster-anohga-hormonal',
    client: 'anohga',
    clientName: 'Anohga Yoga Studio',
    title: 'Hormonal Balance Yoga Workshop',
    subtitle: 'Workshop Launch Poster',
    src: '/assets/anohga/hormonal-balance-yoga-workshop.webp',
    badge: 'Workshop Poster',
  },
  {
    id: 'poster-anohga-axis',
    client: 'anohga',
    clientName: 'Anohga Yoga Studio',
    title: 'The Human Axis: Yoga Movement Study',
    subtitle: 'Movement & Alignment Key Visual',
    src: '/assets/anohga/human-axis-yoga-movement-study.webp',
    badge: 'Movement Study',
  },
  {
    id: 'poster-anohga-mobility-pack',
    client: 'anohga',
    clientName: 'Anohga Yoga Studio',
    title: 'Anohga Yoga Studio Mobility Pack Poster',
    subtitle: 'Studio Pass Promotion Poster',
    src: '/assets/anohga/anohga-yoga-studio-mobility-pack.webp',
    badge: 'Promotion Poster',
  },
  {
    id: 'poster-shilpa-abs-1',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Shilpa Pilates — ABS Workout Core Session',
    subtitle: 'High-Energy Pilates Mat Ad Creative',
    src: '/assets/shilpa-pilates/pilates-abs-workout.webp',
    badge: 'Fitness UGC',
  },
  {
    id: 'poster-shilpa-face-yoga-massage',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Shilpa Pilates — Post-Ganpati Face Yoga Massage (5 Steps)',
    subtitle: 'Festive Detox & Facial Sculpting Ad Creative',
    src: '/assets/shilpa-pilates/face-yoga-massage-5-simple.webp',
    badge: 'Face Yoga',
  },
  {
    id: 'poster-shilpa-aqua-pilates',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Shilpa Pilates — Aqua Pilates & Sound Healing',
    subtitle: 'Radisson Blu Rooftop Wellness Experience',
    src: '/assets/shilpa-pilates/aqua-pilates-sound-healing.webp',
    badge: 'Luxury Wellness',
  },
  {
    id: 'poster-shilpa-float-flow-heal',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Float, Flow & Heal — Aqua Pilates & Sound Bath',
    subtitle: 'Multi-Sensory Poolside Healing & Dining Event',
    src: '/assets/shilpa-pilates/float-flow-heal-nov1.webp',
    badge: 'Event Creative',
  },
  {
    id: 'poster-shilpa-radisson-blu',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Float Flow & Heal — Radisson Blu Mumbai',
    subtitle: 'Exclusive Poolside Wellness Masterclass Campaign',
    src: '/assets/shilpa-pilates/radisson-blu-aqua-pilates.webp',
    badge: 'Studio Event',
  },
  {
    id: 'poster-shilpa-abs-home',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Shilpa Pilates — Zero-Equipment At-Home ABS Workout',
    subtitle: 'Stronger Core, Leaner You Performance Ad',
    src: '/assets/shilpa-pilates/abs-workout-no-equipment.webp',
    badge: 'Core Conditioning',
  },
  {
    id: 'poster-shilpa-shoulder-hump-posture',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Shoulder Hump Workout — Kyphosis Correction',
    subtitle: 'Targeted Upper Back & Posture Alignment Routine',
    src: '/assets/shilpa-pilates/shoulder-hump-workout-posture.webp',
    badge: 'Posture Fix',
  },
  {
    id: 'poster-shilpa-shoulder-hump-alignment',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Shoulder Hump Workout — Anatomical Alignment Breakdown',
    subtitle: 'Neck Alignment & Upper Back Visual Study',
    src: '/assets/shilpa-pilates/shoulder-hump-workout-alignment.webp',
    badge: 'Alignment Study',
  },
  {
    id: 'poster-shilpa-radisson-sunset',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Radisson Blu Sunset Dining & Aqua Pilates',
    subtitle: 'Gourmet Wellness & Float Session Promotional Creative',
    src: '/assets/shilpa-pilates/radisson-blu-sunset-dining.webp',
    badge: 'Lifestyle UGC',
  },
  {
    id: 'poster-shilpa-barre',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Shilpa Pilates — Barre Pilates Series (Balance & Control)',
    subtitle: 'Isometric Conditioning & Tone Routine',
    src: '/assets/shilpa-pilates/barre-pilates-balance-control.webp',
    badge: 'Barre Pilates',
  },
  {
    id: 'poster-shilpa-halloween',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Shilpa Pilates — Halloween Themed Studio Session',
    subtitle: 'Thematic Community Fitness & Core Celebration',
    src: '/assets/shilpa-pilates/halloween-themed-pilates.webp',
    badge: 'Seasonal Event',
  },
  {
    id: 'poster-shilpa-face-yoga-classes',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Face Yoga Classes — Meet Shilpa Kanodia',
    subtitle: 'Studio Equipment & Anti-Aging Workshop Brochure',
    src: '/assets/shilpa-pilates/face-yoga-classes-workshop.webp',
    badge: 'Studio Workshop',
  },
  {
    id: 'poster-shilpa-dandiya-garba',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Shilpa Pilates — Studio Dandiya & Garba Workout',
    subtitle: 'Festive Cardio & Core Rhythm Fitness Session',
    src: '/assets/shilpa-pilates/studio-dandiya-garba-session.webp',
    badge: 'Festive Fitness',
  },
  {
    id: 'poster-shilpa-dandiya-dance',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Festive Dandiya Dance Fitness & Community Celebration',
    subtitle: 'High-Energy Studio Dance & Core Campaign',
    src: '/assets/shilpa-pilates/festive-dandiya-dance-fitness.webp',
    badge: 'Community Event',
  },
  {
    id: 'poster-shilpa-neck-exercises',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Botox-Free Neck Exercises — Non-Invasive Anti-Aging',
    subtitle: 'Targeted Neck Sculpting, Double Chin & Jowl Lift',
    src: '/assets/shilpa-pilates/botox-free-neck-exercises.webp',
    badge: 'Anti-Aging Fix',
  },
  {
    id: 'poster-shilpa-mens-day-reformer',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: "International Men's Day — Men Do Pilates Too!",
    subtitle: 'Reformer Core, Power & Functional Mobility Campaign',
    src: '/assets/shilpa-pilates/shilpa-mens-day-pilates-reformer.webp',
    badge: "Men's Fitness",
  },
  {
    id: 'poster-shilpa-release-open-anatomy',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Release & Open — Upper Back, Shoulders, Chest & Neck',
    subtitle: 'Foam Roller Myofascial Decompression & Posture Correction',
    src: '/assets/shilpa-pilates/shilpa-release-open-foam-roller-anatomy.webp',
    badge: 'Mobility & Posture',
  },
  {
    id: 'poster-shilpa-upper-back-release-arc',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Upper Back Release — Mobilise, Release & Open',
    subtitle: 'Step-by-Step Movement Arc & Shoulder Biomechanics Study',
    src: '/assets/shilpa-pilates/shilpa-upper-back-release-foam-roller-arc.webp',
    badge: 'Rehab & Recovery',
  },
  {
    id: 'poster-shilpa-tai-chi-anti-aging',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Tai Chi Anti-Aging Exercises — Mindful Balance & Qi Flow',
    subtitle: 'Holistic Longevity, Joint Mobility & Inner Vitality Series',
    src: '/assets/shilpa-pilates/shilpa-tai-chi-anti-aging-exercises.webp',
    badge: 'Mindful Movement',
  },
  {
    id: 'poster-shilpa-aerial-yoga-grounded',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Aerial Silk Flow — Anti-Gravity Decompression & Grounding',
    subtitle: 'Suspension Silk Therapy & Mindful Mat Integration',
    src: '/assets/shilpa-pilates/shilpa-aerial-yoga-grounded-silk-flow.webp',
    badge: 'Aerial Yoga',
  },
  {
    id: 'poster-shilpa-mens-pilates-trio',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: "Men's Reformer Masterclass — Core Conditioning Trio",
    subtitle: 'Athletic Resistance, Pull-Ups & Dynamic Reformer Rows',
    src: '/assets/shilpa-pilates/shilpa-mens-pilates-trio-reformer-session.webp',
    badge: 'Studio Masterclass',
  },
  {
    id: 'poster-shilpa-aerial-sound-bath',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Aerial Silks & Tibetan Sound Bath Healing',
    subtitle: 'Vibrational Sound Therapy & Restorative Aerial Hammock',
    src: '/assets/shilpa-pilates/shilpa-aerial-sound-bath-silk-healing.webp',
    badge: 'Sound & Silk',
  },
  {
    id: 'poster-shilpa-mens-day-mat-poster',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: "International Men's Day on the Pilates Mat (Campaign Creative)",
    subtitle: 'Breaking Stereotypes — Elite Functional Strength for Men',
    src: '/assets/shilpa-pilates/shilpa-mens-day-pilates-mat-poster.webp',
    badge: 'Campaign Creative',
  },
  {
    id: 'poster-shilpa-face-yoga-online',
    client: 'shilpa',
    clientName: 'Shilpa Pilates Studio',
    title: 'Join My Online Face Yoga Program — Live on Zoom',
    subtitle: 'Natural Face Lifting Routine & Early Bird Enrollment Ad',
    src: '/assets/shilpa-pilates/shilpa-face-yoga-online-program.webp',
    badge: 'Online Program',
  },
  {
    id: 'poster-tapas-find-your-balance',
    client: 'tapas',
    clientName: 'Tapas Yog Shala',
    title: 'Tapas Yog Shala — Find Your Balance (Rope Wall Practice)',
    subtitle: 'Yoga Classes Launch & Free First Month Offer',
    src: '/assets/tapas-yog-shala/tapas-yog-shala-find-your-balance.webp',
    badge: 'Studio Launch',
  },
  {
    id: 'poster-tapas-jaipur-arch',
    client: 'tapas',
    clientName: 'Tapas Yog Shala',
    title: 'Tapas Yog Shala — Heritage Archway Yoga Sanctuary (Jaipur)',
    subtitle: 'A Little Space for Yourself — Studio Trial Creative',
    src: '/assets/tapas-yog-shala/tapas-yog-shala-jaipur-arch-yoga.webp',
    badge: 'Brand Visual',
  },
  {
    id: 'poster-tapas-iyengar-schedule',
    client: 'tapas',
    clientName: 'Tapas Yog Shala',
    title: 'Tapas Yog Shala — Iyengar Style Yoga Classes Schedule',
    subtitle: 'Batch Timings, Registration & Onboarding Funnel Poster',
    src: '/assets/tapas-yog-shala/tapas-yog-shala-iyengar-schedule.webp',
    badge: 'Infographic Ad',
  },
  {
    id: 'poster-tapas-join-bento',
    client: 'tapas',
    clientName: 'Tapas Yog Shala',
    title: 'Tapas Yog Shala — Join Our Yoga Classes (Bento Guide)',
    subtitle: 'Multi-Card Offer & Safety Screening Layout',
    src: '/assets/tapas-yog-shala/tapas-yog-shala-join-yoga-bento.webp',
    badge: 'Conversion Grid',
  },
  {
    id: 'poster-tapas-iyengar-campaign',
    client: 'tapas',
    clientName: 'Tapas Yog Shala',
    title: 'Tapas Yog Shala — Iyengar Yoga Opening Offer Campaign',
    subtitle: 'Stronger, Calmer, More You — Full Schedule Ad',
    src: '/assets/tapas-yog-shala/tapas-yog-shala-iyengar-campaign.webp',
    badge: 'Performance Ad',
  },
  {
    id: 'poster-prana-sound-disc',
    client: 'prana',
    clientName: 'Prana Studio',
    title: 'Prana Studio — Sound Therapy (Acoustic Disc Key Visual)',
    subtitle: 'Experiential 3D Resonance & Minimalist Sanctuary Poster',
    src: '/assets/prana-studio/prana-sound-therapy-disc.webp',
    badge: '3D Key Visual',
  },
  {
    id: 'poster-prana-sound-bowl',
    client: 'prana',
    clientName: 'Prana Studio',
    title: 'Prana Studio — Let Sound Do The Healing',
    subtitle: 'Immersive Sound Bath & Sacred Architecture Campaign',
    src: '/assets/prana-studio/prana-sound-healing-bowl.webp',
    badge: 'Sound Healing',
  },
  {
    id: 'poster-prana-sound-sphere',
    client: 'prana',
    clientName: 'Prana Studio',
    title: 'Prana Studio — Sound Therapy Sphere Story Format',
    subtitle: 'Sculptural Acoustic Ripple Vertical Poster',
    src: '/assets/prana-studio/prana-sound-therapy-sphere.webp',
    badge: 'Vertical Key Visual',
  },
];

function App() {
  // If routing to admin page, bypass standard page loading immediately
  if (window.location.pathname === '/admin') {
    return <Admin />;
  }

  const [activeCategory, setActiveCategory] = useState('VIDEO');
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [aiUgcClientFilter, setAiUgcClientFilter] = useState('all');
  const [aiUgcFormatFilter, setAiUgcFormatFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrollPct, setScrollPct] = useState(0);
  const [statsTrigger, setStatsTrigger] = useState(false);
  const statsRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  // Global Cmd+K / Ctrl+K shortcut for Quick Studio Finder
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (
        e.key === '/' &&
        !paletteOpen &&
        !selectedImage &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paletteOpen, selectedImage]);

  // Active section spy & top scroll progress indicator
  useEffect(() => {
    if (selectedService) return;
    const sectionIds = ['about', 'services', 'process', 'clients', 'contact'];
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 0);

      let current = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [selectedService]);

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

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
          ...s,
          examples: [...(s.examples || [])],
          videoShowcase: [...(s.videoShowcase || [])],
          webPreview: [...(s.webPreview || [])],
          carousels: s.carousels ? [...s.carousels] : undefined,
          clientShowcases: s.clientShowcases
            ? s.clientShowcases.map(c => ({
                ...c,
                examples: [...(c.examples || [])],
                carousels: c.carousels ? [...c.carousels] : undefined,
              }))
            : undefined,
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

  const getServicesForCategory = (category) => {
    if (category === 'ALL') {
      const allServices = [];
      categories.forEach((cat) => {
        const catServices = mergedData[cat] || {};
        Object.keys(catServices).forEach((title) => {
          allServices.push({ ...catServices[title], category: cat });
        });
      });
      return allServices;
    }
    if (category === 'UPCOMING') {
      const upcomingServices = [];
      categories.forEach((cat) => {
        const catServices = mergedData[cat] || {};
        Object.keys(catServices).forEach((title) => {
          const s = catServices[title];
          if (s.isUpcoming) {
            upcomingServices.push({ ...s, category: cat });
          }
        });
      });
      return upcomingServices;
    }
    return Object.values(mergedData[category] || {}).map((s) => ({ ...s, category }));
  };

  const getCategoryCount = (catId) => {
    if (catId === 'ALL') {
      return categories.reduce((total, cat) => total + Object.keys(mergedData[cat] || {}).length, 0);
    }
    if (catId === 'UPCOMING') {
      let count = 0;
      categories.forEach((cat) => {
        Object.values(mergedData[cat] || {}).forEach((s) => {
          if (s.isUpcoming) count++;
        });
      });
      return count;
    }
    return Object.keys(mergedData[catId] || {}).length;
  };

  const totalServicesCount = categories.reduce(
    (total, cat) => total + Object.keys(mergedData[cat] || {}).length,
    0
  );

  const allFlatServices = getServicesForCategory('ALL');

  // Contact form & scope builder state
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState('This Week');
  const [formStatus, setFormStatus] = useState('idle');
  const [formErrors, setFormErrors] = useState({});

  const toggleScope = (scope) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((item) => item !== scope) : [...prev, scope]
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formStatus !== 'idle') return;
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.message.trim() && selectedScopes.length === 0) {
      errors.message = 'Select a scope tag or tell us about your project';
    }
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormStatus('submitting');
    setTimeout(() => setFormStatus('success'), 1100);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', message: '' });
    setSelectedScopes([]);
    setSelectedTimeline('This Week');
    setFormStatus('idle');
    setFormErrors({});
  };

  const getWhatsAppBriefUrl = () => {
    const scopeStr = selectedScopes.length > 0 ? selectedScopes.join(', ') : 'General Creative Project';
    const namePart = formData.name.trim() ? `My name is ${formData.name.trim()}. ` : '';
    const msgPart = formData.message.trim() ? `\nBrief: ${formData.message.trim()}` : '';
    const text = `Hi Syntra! ${namePart}I'm interested in: ${scopeStr} (Timeline: ${selectedTimeline}).${msgPart}`;
    return `https://wa.me/+918448865446?text=${encodeURIComponent(text)}`;
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
      if (['about', 'services', 'clients', 'testimonials', 'process', 'contact'].includes(cleanPath)) {
        setSelectedService(null);
        const target = document.getElementById(cleanPath === 'testimonials' ? 'clients' : cleanPath) || document.getElementById(cleanPath);
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

  const handleServiceClick = (serviceTitle, serviceCategory) => {
    let cat = serviceCategory || activeCategory;
    if (cat === 'ALL' || cat === 'UPCOMING') {
      for (const c of categories) {
        if (mergedData[c]?.[serviceTitle]) {
          cat = c;
          break;
        }
      }
    }
    const data = getServiceData(cat, serviceTitle);
    if (data) {
      const slug = slugify(serviceTitle);
      window.history.pushState({ service: serviceTitle }, '', `/services/${slug}`);
      setSelectedService({ ...data, category: cat });
    }
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    setSelectedService(null);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
  };

  const navigateToSection = (sectionId) => {
    setSelectedService(null);
    window.history.pushState({}, '', `/${sectionId}`);
    setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) smoothScrollTo(target, 450);
    }, 60);
  };

  const navigateToCategory = (catId) => {
    setSelectedService(null);
    setActiveCategory(catId);
    setServiceSearch('');
    window.history.pushState({}, '', catId === 'AI_UGC' ? '#ai-ugc' : '/services');
    setTimeout(() => {
      const target = document.getElementById('services');
      if (target) smoothScrollTo(target, 450);
    }, 60);
  };

  const commandPaletteNode = (
    <CommandPalette
      isOpen={paletteOpen}
      onClose={() => setPaletteOpen(false)}
      servicesByCategory={mergedData}
      categoryTabs={categoryTabs}
      onSelectService={handleServiceClick}
      onSelectCategory={navigateToCategory}
      onNavigateSection={navigateToSection}
      onToggleTheme={toggleTheme}
      theme={theme}
    />
  );

  // If a dedicated service page is active, render the ServicePage component!
  if (selectedService) {
    return (
      <>
        {commandPaletteNode}
        <ServicePage
          service={selectedService}
          category={selectedService.category || activeCategory}
          theme={theme}
          onToggleTheme={toggleTheme}
          onBack={handleBackToHome}
          onImageClick={(img) => setSelectedImage(img)}
          allServices={allFlatServices}
          onSelectService={handleServiceClick}
          onOpenPalette={() => setPaletteOpen(true)}
          onSelectCategory={navigateToCategory}
        />

        {/* Image Lightbox / Fullscreen Carousel Reader */}
        {selectedImage && (
          <LightboxModal item={selectedImage} onClose={() => setSelectedImage(null)} />
        )}
      </>
    );
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {commandPaletteNode}
      <FloatingNav
        activeSection={activeSection}
        onOpenPalette={() => setPaletteOpen(true)}
        onNavigateSection={navigateToSection}
      />

      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.035]"
          style={{ background: 'radial-gradient(circle, #FFD100 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.025]"
          style={{ background: 'radial-gradient(circle, #FFD100 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={handleSmoothScroll}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          setServiceSearch('');
          const target = document.getElementById('services');
          if (target) smoothScrollTo(target, 500);
        }}
      />

      {/* Image Lightbox / Fullscreen Carousel Reader */}
      {selectedImage && (
        <LightboxModal item={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {/* ── HEADER ── */}
      <header
        className="fixed top-0 left-0 right-0 z-30 border-b backdrop-blur-xl transition-colors duration-200"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--header-bg)' }}
        role="banner"
      >
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-yellow-400 focus:text-black focus:text-xs focus:font-mono focus:rounded-lg focus:outline-none">
          Skip to main content
        </a>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Logo mark */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              scrollToTop(450);
            }}
            className="flex items-center group focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded-lg p-1 shrink-0"
            aria-label="Syntra Home"
          >
            <img
              src="/assets/syntra-logo.png"
              alt="Syntra"
              className="h-7 sm:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105 group-hover:opacity-90"
            />
          </a>

          {/* Editorial Navigation with Active Section Spy */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-[13px] tracking-[0.16em] uppercase font-bold"
            aria-label="Main navigation"
          >
            {[
              { id: 'about', label: 'About' },
              { id: 'services', label: 'Services', index: '06' },
              { id: 'clients', label: 'Clients' },
              { id: 'process', label: 'Process' },
              { id: 'contact', label: 'Contact' },
            ].map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={handleSmoothScroll}
                  className={`group relative py-1.5 inline-flex items-center gap-2 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-yellow-400 ${
                    isActive ? 'text-yellow-400' : 'hover:text-yellow-400'
                  }`}
                  style={isActive ? {} : { color: 'var(--text-primary)' }}
                >
                  <span>{link.label}</span>
                  {link.index && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg border transition-colors ${
                        isActive
                          ? 'bg-yellow-400 text-black border-yellow-400'
                          : 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30 group-hover:bg-yellow-400 group-hover:text-black'
                      }`}
                    >
                      /{link.index}
                    </span>
                  )}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2px] bg-yellow-400 transition-transform duration-200 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </nav>

          {/* Right Controls: Quick Jump, Theme Toggle, Mobile Menu, Clean Studio CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-bold transition-colors hover:border-yellow-400 hover:text-yellow-400 cursor-pointer"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)', color: 'var(--text-primary)' }}
              aria-label="Open Quick Navigation Finder (Ctrl+K)"
              title="Quick Jump to any Service or Section (Ctrl+K)"
            >
              <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden lg:inline text-[11px] uppercase tracking-wider">Jump</span>
              <span className="hidden sm:inline-flex kbd-key">⌘K</span>
            </button>

            <ThemeSwitch theme={theme} onToggle={toggleTheme} />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl border flex items-center justify-center transition-colors hover:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>

            <a
              href="#contact"
              onClick={handleSmoothScroll}
              className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black transition-all duration-150 hover:scale-[1.02] shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black"
            >
              <span>Start a project</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Dynamic Scroll Progress Rail */}
        <div className="h-[2px] w-full bg-transparent overflow-hidden" aria-hidden="true">
          <div
            className="h-full bg-yellow-400 transition-[width] duration-75"
            style={{ width: `${scrollPct}%` }}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20" id="main-content" role="main">

        {/* ── HERO ── */}
        <section className="relative pt-6 sm:pt-12 md:pt-24 pb-12 sm:pb-16 md:pb-24 border-b" style={{ borderColor: 'var(--border-color)' }}>
          {/* Side labels */}
          <div className="hidden lg:flex flex-col gap-4 absolute -left-4 top-1/2 -translate-y-1/2 text-[9px] tracking-[0.4em] uppercase rotate-180 [writing-mode:vertical-rl]" style={{ color: 'var(--text-muted)' }}>
            <span>Experiential</span><span>Branding</span><span>Digital</span>
          </div>
          <div className="hidden lg:flex flex-col gap-4 absolute -right-4 top-1/2 -translate-y-1/2 text-[9px] tracking-[0.4em] uppercase [writing-mode:vertical-rl]" style={{ color: 'var(--text-muted)' }}>
            <span>India</span><span>IST</span><span><LiveClock /></span>
          </div>

          <div className="grid md:grid-cols-[1.2fr,1fr] gap-8 md:gap-12 items-center">
            <div className="min-w-0">
              <div className="pill-label mb-6 sm:mb-8 inline-flex">Editing-first creative studio</div>

              <div className="space-y-3 mb-6 sm:mb-8">
                <h1 className="font-bold leading-[1.08] tracking-tight" style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.1rem, 7vw, 5.5rem)',
                  color: 'var(--text-primary)'
                }}>
                  We craft stories
                  <br />
                  <span style={{ color: 'var(--brand-yellow)' }}>that convert.</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl font-light max-w-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Syntra is a motion-first editing agency. From raw footage to thumbnails, logos to full websites — every frame is tuned for <em>impact</em>.
                </p>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-4 sm:gap-6 md:gap-8 mb-8 py-5 border-y" style={{ borderColor: 'var(--border-color)' }}>
                {[
                  { val: '150', suffix: '+', label: 'Projects' },
                  { val: '60', suffix: '+', label: 'Happy Clients' },
                  { val: '5', suffix: '+', label: 'Countries' },
                  { val: '100', suffix: '%', label: 'Delivery Rate' },
                  { val: '2023', suffix: '', label: 'Founded' },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-yellow)' }}>
                      {s.val}{s.suffix}
                    </span>
                    <span className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a href="#services" onClick={handleSmoothScroll}
                  className="btn-shimmer w-full sm:w-auto text-center justify-center inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[11px] tracking-[0.2em] uppercase font-bold shadow-lg hover:scale-105 transition-all duration-300">
                  View Services →
                </a>
                <a href="#contact" onClick={handleSmoothScroll}
                  className="w-full sm:w-auto text-center justify-center inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[11px] tracking-[0.2em] uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                  Start a project
                </a>
              </div>

              {/* Quick Jump Category Chips */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t overflow-x-auto pb-1.5 scrollbar-none flex-nowrap" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-[10px] tracking-widest uppercase font-semibold shrink-0" style={{ color: 'var(--text-muted)' }}>
                  Jump to:
                </span>
                {[
                  { label: '✦ AI UGC Ads', cat: 'AI_UGC' },
                  { label: '✦ Automation & Bots', cat: 'AUTOMATION' },
                  { label: '✦ Upcoming Labs', cat: 'UPCOMING' },
                  { label: 'Video & Reels', cat: 'VIDEO' },
                  { label: 'Thumbnails', cat: 'THUMBNAILS' },
                  { label: 'Brand Identity', cat: 'GRAPHICS' },
                  { label: 'Websites & SEO', cat: 'WEB' },
                ].map((pill) => (
                  <button
                    key={pill.cat}
                    onClick={() => {
                      setActiveCategory(pill.cat);
                      setServiceSearch('');
                      const target = document.getElementById('services');
                      if (target) smoothScrollTo(target, 500);
                    }}
                    className="text-[10px] tracking-wider uppercase font-semibold px-3 py-1.5 rounded-xl border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400 cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-overlay)' }}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Hero Studio Cutting Bay */}
            <HeroCuttingBay />
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="py-6 border-b marquee-wrap" style={{ borderColor: 'var(--border-color)' }} aria-hidden="true">
          <div className="marquee-track">
            {[1, 2].map((rep) => (
              <div key={rep} className="flex items-center gap-10 pr-10">
                {['Video Editing', '✦ AI UGC Ads', '✦ WhatsApp Bots', '✦ Instagram DM Funnels', '✦ Technical SEO', '✦ CRO Audits', 'Static Ad Creatives', 'Motion Graphics', 'Brand Identity', 'Thumbnail Design', 'Web Design', 'AI Avatars', 'Content Strategy', 'Logo Design', 'Reels & Shorts'].map((item) => (
                  <span key={item} className="flex items-center gap-4 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-yellow-400" />
                    <span className={`text-[11px] tracking-[0.3em] uppercase font-semibold ${item.startsWith('✦') ? 'text-yellow-400' : ''}`}
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
        <section id="about" className="py-12 sm:py-16 md:py-24 border-b" style={{ borderColor: 'var(--border-color)' }}>
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
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-xl border border-yellow-400/10" aria-hidden="true" />
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
        <section id="services" className="relative py-12 sm:py-16 md:py-24 border-b" style={{ borderColor: 'var(--border-color)' }}>
          {/* Ambient spotlight glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 opacity-[0.06] rounded-full blur-3xl -z-10"
            style={{ background: 'radial-gradient(ellipse, #FFD100 0%, transparent 70%)' }}
            aria-hidden="true" />

          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 sm:mb-12">
            <div>
              <div className="pill-label mb-4 inline-flex">
                ✦ Creative Capabilities · 6 Disciplines
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                A complete editing &amp;<br className="hidden md:block" /> design ecosystem.
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base max-w-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                From gaming montages to logos, thumbnails, social posts, AI UGC ads and full websites — Syntra handles the entire funnel with zero templates.
              </p>
              {/* Editorial metric specs strip (borderless typography instead of repetitive boxes) */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-tertiary)' }}>
                <span className="inline-flex items-center gap-2 text-yellow-400 font-bold">
                  <span className="text-[9px]">◆</span> {totalServicesCount} Specialized Services
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-[9px] text-yellow-400">◆</span> 100+ Video Edits
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-[9px] text-yellow-400">◆</span> Custom Brand Retainers
                </span>
              </div>
            </div>
            <a href="#contact" onClick={handleSmoothScroll}
              className="shrink-0 btn-shimmer inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[11px] tracking-[0.2em] uppercase font-bold shadow-lg hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center">
              Start a project →
            </a>
          </div>

          {/* Controls Bar: Category Tabs + Live Search Input */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b"
            style={{ borderColor: 'var(--border-color)' }}>
            {/* Category Tabs (Smooth touch scrolling on mobile) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none flex-nowrap" role="tablist" aria-label="Service categories">
              {categoryTabs.map((tab) => {
                const count = getCategoryCount(tab.id);
                const active = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls={`${tab.id}-panel`}
                    id={`${tab.id}-tab`}
                    onClick={() => {
                      setActiveCategory(tab.id);
                      setServiceSearch('');
                      if (tab.id === 'AI_UGC') {
                        window.history.pushState({}, '', '#ai-ugc');
                      } else if (window.location.hash === '#ai-ugc') {
                        window.history.pushState({}, '', '#services');
                      }
                    }}
                    className={`relative shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-[10px] tracking-[0.2em] uppercase font-bold transition-all border flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer ${
                      active
                        ? 'border-yellow-400/80 bg-yellow-400/15 text-yellow-400 shadow-[0_0_24px_rgba(255,209,0,0.22)]'
                        : 'hover:border-yellow-300/50 hover:text-yellow-300'
                    }`}
                    style={{
                      borderColor: active ? undefined : 'var(--border-color)',
                      color: active ? undefined : 'var(--text-tertiary)',
                      backgroundColor: active ? undefined : 'var(--bg-card)'
                    }}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-lg font-bold ml-0.5 ${
                      active ? 'bg-yellow-400 text-black' : 'bg-[var(--bg-overlay)] text-[var(--text-muted)]'
                    }`}>
                      {count}
                    </span>
                    {active && <span className="absolute inset-0 -z-10 blur-xl bg-yellow-400/10 rounded-xl" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full lg:w-72 shrink-0">
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Search services (e.g. reels, ai ads)..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs border outline-none transition-all duration-300 focus:ring-2 focus:ring-yellow-400/40"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: serviceSearch ? 'var(--brand-yellow)' : 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
              <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {serviceSearch && (
                <button
                  onClick={() => setServiceSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:text-yellow-400 transition-colors cursor-pointer px-1 py-0.5"
                  style={{ color: 'var(--text-tertiary)' }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Search match notice */}
          {serviceSearch.trim() && (
            <div className="flex items-center justify-between mb-8 p-4 rounded-2xl border"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-yellow-400 font-bold">●</span>
                <span>
                  Filtering all categories for <strong>"{serviceSearch}"</strong>
                </span>
              </div>
              <button
                onClick={() => setServiceSearch('')}
                className="text-xs text-yellow-400 hover:underline uppercase tracking-wider font-semibold cursor-pointer"
              >
                Reset Search ✕
              </button>
            </div>
          )}

          {/* Category banner (only when not searching) */}
          {!serviceSearch.trim() && (
            <>
              {activeCategory === 'AI_UGC' ? (
                /* ── AI UGC Special Showcase Banner ── */
                <div className="mb-10 rounded-3xl border p-7 md:p-10 relative overflow-hidden"
                  style={{ borderColor: 'var(--border-color)', background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)` }}>
                  {/* Decorative brand yellow glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" aria-hidden="true"
                    style={{ background: 'radial-gradient(circle, rgba(255,209,0,0.12) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'translate(30%, -30%)' }} />
                  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <div className="pill-label mb-4 inline-flex">
                        ✦ AI-Powered Performance Advertising
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        AI UGC Ads — the future of performance creative.
                      </h3>
                      <p className="text-sm max-w-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        We engineer hyper-realistic AI avatar video ads, scroll-stopping static creatives, and hook-first UGC scripts — built to drive high ROAS across Meta, TikTok, YouTube &amp; Google Ads.
                      </p>
                      <div className="flex flex-wrap gap-2.5 mt-5">
                        {['AI Avatars', 'Performance Video Ads', 'Static Creatives', 'Hook-First Scripts', 'Multi-Platform Formats'].map((tag) => (
                          <span key={tag} className="text-[9px] tracking-[0.2em] uppercase font-semibold px-3 py-1 rounded-lg border"
                            style={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 shrink-0 md:text-right">
                      <p className="eyebrow">Syntra AI Stack</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                        Static · Video · Avatars · Voiceover<br />Hooks · Scripts · Multi-platform
                      </p>
                    </div>
                  </div>
                </div>
              ) : activeCategory === 'UPCOMING' ? (
                /* ── UPCOMING Labs Showcase Banner ── */
                <div className="mb-8 rounded-3xl border p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden"
                  style={{ borderColor: 'var(--border-color)', background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)` }}>
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" aria-hidden="true"
                    style={{ background: 'radial-gradient(circle, rgba(255,209,0,0.14) 0%, transparent 70%)', filter: 'blur(45px)', transform: 'translate(20%, -20%)' }} />
                  <div className="relative">
                    <div className="pill-label mb-3 inline-flex">
                      ✦ Syntra Innovation Labs · Early Access
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      Next-Gen Automation, Meta Bots &amp; Growth Disciplines.
                    </h3>
                    <p className="text-sm max-w-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Expanding the studio stack beyond content into 24/7 WhatsApp Cloud bots, Instagram DM lead funnels, technical SEO engines, and comprehensive UX conversion teardowns.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {['WhatsApp Cloud API', 'Instagram DM Automation', 'Technical SEO', 'CRO Website Audits', 'Private Beta Open'].map(tag => (
                        <span key={tag} className="text-[9px] tracking-[0.2em] uppercase font-semibold px-2.5 py-1 rounded-lg border"
                          style={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="relative flex flex-col gap-2 shrink-0 md:text-right">
                    <span className="text-[10px] tracking-widest uppercase font-bold text-yellow-400">Status: Private Beta</span>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      Launch Target: Q1 2027<br />Pre-Book via WhatsApp
                    </p>
                  </div>
                </div>
              ) : activeCategory === 'AUTOMATION' ? (
                /* ── AUTOMATION Category Banner ── */
                <div className="mb-8 rounded-3xl border p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden"
                  style={{ borderColor: 'var(--border-color)', background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)` }}>
                  <div className="relative">
                    <div className="pill-label mb-3 inline-flex">
                      ✦ Official Meta Graph &amp; Cloud API
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      Conversational Automation &amp; Direct-Response Chatbots.
                    </h3>
                    <p className="text-sm max-w-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Turn comments, story mentions, and inbound traffic into qualified appointments and sales around the clock with zero manual chat drag.
                    </p>
                  </div>
                  <div className="text-xs shrink-0 md:text-right" style={{ color: 'var(--text-tertiary)' }}>
                    <p className="tracking-widest uppercase mb-1 font-bold text-yellow-400">Meta Compliant</p>
                    <p className="leading-relaxed">WhatsApp Cloud API · Instagram DM Graph API · Webhook Sync</p>
                  </div>
                </div>
              ) : activeCategory === 'ALL' ? (
                /* ── ALL Services Banner ── */
                <div className="mb-8 rounded-3xl border p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                  style={{ borderColor: 'var(--border-color)', background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)` }}>
                  <div>
                    <p className="eyebrow mb-2">Comprehensive Production Matrix</p>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      All {totalServicesCount} Creative Offerings Across 8 Disciplines &amp; Labs.
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Click any service card to view complete video reels, portfolio galleries, code demos, and early-access roadmaps.
                    </p>
                  </div>
                  <div className="text-xs shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    <p className="tracking-widest uppercase mb-1">Syntra Multi-Format Delivery</p>
                    <p className="leading-relaxed">YouTube · Meta · TikTok · Web · Bots · Identity</p>
                  </div>
                </div>
              ) : (
                /* ── Category Specific Banner ── */
                <div className="mb-8 rounded-3xl border p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                  style={{ borderColor: 'var(--border-color)', background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)` }}>
                  <div>
                    <p className="eyebrow mb-2">
                      {activeCategory === 'VIDEO' && 'Video Production & Editing'}
                      {activeCategory === 'GRAPHICS' && 'Graphic Design & Branding'}
                      {activeCategory === 'THUMBNAILS' && 'Thumbnail Design Suite'}
                      {activeCategory === 'CONTENT' && 'Social Content & Copywriting'}
                      {activeCategory === 'WEB' && 'Web Design, Technical SEO & Audits'}
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      {activeCategory === 'VIDEO' && 'High-impact visual storytelling in every format.'}
                      {activeCategory === 'GRAPHICS' && 'Visual systems that make your brand unforgettable.'}
                      {activeCategory === 'THUMBNAILS' && 'Thumbnails engineered for clicks — not guesswork.'}
                      {activeCategory === 'CONTENT' && 'Words and visuals working together for attention.'}
                      {activeCategory === 'WEB' && 'Fast modern websites, search visibility & conversion audits.'}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Click any service card to explore galleries, videos, and client examples.
                    </p>
                  </div>
                  <div className="text-xs shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    <p className="tracking-widest uppercase mb-1">Syntra Service Stack</p>
                    <p className="leading-relaxed">
                      {activeCategory === 'VIDEO' && 'Gaming · Tech · Shorts · Motion · Variety'}
                      {activeCategory === 'GRAPHICS' && 'Logos · Banners · Merch · Menus'}
                      {activeCategory === 'THUMBNAILS' && 'Elite · Standard tiers · A/B testing'}
                      {activeCategory === 'CONTENT' && 'Instagram · Scripts · Social flows'}
                      {activeCategory === 'WEB' && 'Responsive · SEO Optimization · CRO Audits'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── AI UGC Production Showcase (when AI_UGC tab is active or searched) ── */}
          {(activeCategory === 'AI_UGC' || (serviceSearch.trim() && 'ai ugc static ads'.includes(serviceSearch.toLowerCase()))) && (
            <div className="mb-14">
              {/* Top Section Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(255,209,0,0.3), transparent)' }} />
                <span className="text-[10px] tracking-[0.35em] uppercase font-bold text-yellow-400">
                  ✦ Featured AI UGC Client Campaigns
                </span>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(255,209,0,0.3), transparent)' }} />
              </div>

              {/* Triple Client Snapshot Cards (Balanced & Symmetrical) */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {/* Anohga Highlight Card */}
                <div
                  className="rounded-3xl border p-6 md:p-7 relative overflow-hidden transition-all duration-300 hover:border-yellow-400/50 hover:shadow-[0_16px_40px_rgba(255,209,0,0.08)] flex flex-col justify-between"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] tracking-[0.2em] uppercase font-bold text-yellow-400 border border-yellow-400/30 bg-yellow-400/10">
                        <span>✦</span> Featured Production
                      </span>
                      <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-lg border"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-overlay)' }}>
                        Performance Ads
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      Anohga Yoga Studio
                    </h3>
                    <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                      Wellness Brand · Static Ads, Launch Posters &amp; Instagram Carousels
                    </p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                      Complete multi-format campaign for workshop promotions, studio passes, and alignment masterclasses. 5 studio launch posters and 6 narrative multi-slide carousels (32 total slides) engineered for Meta &amp; Instagram performance.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/5 border border-white/10" style={{ color: 'var(--text-secondary)' }}>
                      6 Decks · 5 Posters
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAiUgcClientFilter('anohga');
                        setAiUgcFormatFilter('all');
                        document.getElementById('ai-ugc-deliverables')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-[10px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-lg text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer"
                    >
                      Filter Work ↓
                    </button>
                  </div>
                </div>

                {/* Arovia.ai Highlight Card */}
                <div
                  className="rounded-3xl border p-6 md:p-7 relative overflow-hidden transition-all duration-300 hover:border-yellow-400/50 hover:shadow-[0_16px_40px_rgba(255,209,0,0.08)] flex flex-col justify-between"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] tracking-[0.2em] uppercase font-bold text-yellow-400 border border-yellow-400/30 bg-yellow-400/10">
                        <span>✦</span> AI Creative Partner
                      </span>
                      <a
                        href="https://aroviaai.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] tracking-[0.15em] uppercase font-bold border transition-all duration-200 hover:border-yellow-400 hover:text-yellow-400 hover:scale-105"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-overlay)' }}
                      >
                        <span>Visit Site</span>
                        <span>↗</span>
                      </a>
                    </div>
                    <h3 className="text-2xl font-bold mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      Arovia.ai
                    </h3>
                    <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                      AI Platform · Health Intelligence Carousels &amp; Festive Key Visuals
                    </p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                      Diagnostic storytelling and root-cause health intelligence campaign. 3 narrative multi-slide carousels (16 total slides) and 3 festive brand storytelling key visuals (Dhanteras, Dussehra &amp; Diwali) built for social conversion.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/5 border border-white/10" style={{ color: 'var(--text-secondary)' }}>
                      3 Decks · 3 Posters
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAiUgcClientFilter('arovia');
                        setAiUgcFormatFilter('all');
                        document.getElementById('ai-ugc-deliverables')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-[10px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-lg text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer"
                    >
                      Filter Work ↓
                    </button>
                  </div>
                </div>

                {/* Shilpa Pilates Studio Highlight Card */}
                <div
                  className="rounded-3xl border p-6 md:p-7 relative overflow-hidden transition-all duration-300 hover:border-yellow-400/50 hover:shadow-[0_16px_40px_rgba(255,209,0,0.08)] flex flex-col justify-between"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] tracking-[0.2em] uppercase font-bold text-yellow-400 border border-yellow-400/30 bg-yellow-400/10">
                        <span>✦</span> Fitness &amp; UGC Partner
                      </span>
                      <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-lg border"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-overlay)' }}>
                        Performance Ads
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      Shilpa Pilates Studio
                    </h3>
                    <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                      Boutique Fitness · Core Conditioning, Luxury Aqua Events &amp; Face Yoga
                    </p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                      24 high-converting ad creatives covering online Face Yoga programs, International Men's Day reformer campaigns, foam roller decompression, Tai Chi anti-aging, aerial silk sound baths, Radisson Blu luxury poolside aqua events, and studio workshops.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/5 border border-white/10" style={{ color: 'var(--text-secondary)' }}>
                      24 Ad Creatives
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAiUgcClientFilter('shilpa');
                        setAiUgcFormatFilter('all');
                        document.getElementById('ai-ugc-deliverables')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-[10px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-lg text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer"
                    >
                      Filter Work ↓
                    </button>
                  </div>
                </div>

                {/* Tapas Yog Shala Highlight Card */}
                <div
                  className="rounded-3xl border p-6 md:p-7 relative overflow-hidden transition-all duration-300 hover:border-yellow-400/50 hover:shadow-[0_16px_40px_rgba(255,209,0,0.08)] flex flex-col justify-between"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] tracking-[0.2em] uppercase font-bold text-yellow-400 border border-yellow-400/30 bg-yellow-400/10">
                        <span>✦</span> Studio Launch
                      </span>
                      <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-lg border"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-overlay)' }}>
                        Enrollment Ads
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      Tapas Yog Shala
                    </h3>
                    <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                      Iyengar Yoga Studio (Jaipur) · Heritage Visuals &amp; Class Bento Posters
                    </p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                      5 conversion-focused launch posters blending Jaipur architectural warmth with structured schedule, pricing, and trial enrollment cards for Iyengar yoga batches.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/5 border border-white/10" style={{ color: 'var(--text-secondary)' }}>
                      5 Launch Creatives
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAiUgcClientFilter('tapas');
                        setAiUgcFormatFilter('all');
                        document.getElementById('ai-ugc-deliverables')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-[10px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-lg text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer"
                    >
                      Filter Work ↓
                    </button>
                  </div>
                </div>

                {/* Prana Studio Highlight Card */}
                <div
                  className="rounded-3xl border p-6 md:p-7 relative overflow-hidden transition-all duration-300 hover:border-yellow-400/50 hover:shadow-[0_16px_40px_rgba(255,209,0,0.08)] flex flex-col justify-between"
                  style={{
                    borderColor: 'var(--border-color)',
                    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] tracking-[0.2em] uppercase font-bold text-yellow-400 border border-yellow-400/30 bg-yellow-400/10">
                        <span>✦</span> Luxury Visuals
                      </span>
                      <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-lg border"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-overlay)' }}>
                        3D Key Art
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      Prana Studio
                    </h3>
                    <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                      Sound Therapy Sanctuary (Chennai) · 3D Acoustic &amp; Healing Posters
                    </p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                      3 bespoke bronze &amp; sound-wave atmospheric campaign key visuals built for immersive sound bath and restorative frequency sessions in Chennai.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/5 border border-white/10" style={{ color: 'var(--text-secondary)' }}>
                      3 Key Visuals
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAiUgcClientFilter('prana');
                        setAiUgcFormatFilter('all');
                        document.getElementById('ai-ugc-deliverables')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-[10px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-lg text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400 hover:text-black transition-colors cursor-pointer"
                    >
                      Filter Work ↓
                    </button>
                  </div>
                </div>

                {/* 6th Balanced Summary & Action Card */}
                <div
                  className="rounded-3xl border p-6 md:p-7 relative overflow-hidden transition-all duration-300 hover:border-yellow-400/60 hover:shadow-[0_16px_40px_rgba(255,209,0,0.12)] flex flex-col justify-between"
                  style={{
                    borderColor: 'rgba(255, 209, 0, 0.35)',
                    background: 'linear-gradient(135deg, rgba(255, 209, 0, 0.08) 0%, var(--bg-card) 100%)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] tracking-[0.2em] uppercase font-bold bg-yellow-400 text-black">
                        <span>✦</span> 49 Live Assets
                      </span>
                      <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-lg border"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-overlay)' }}>
                        5 Active Brands
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      Want Results Like These?
                    </h3>
                    <p className="text-xs mb-3 font-semibold text-yellow-400">
                      40 Static Ads · 9 Carousels (48 Slides)
                    </p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                      Browse every brand below or get a custom pack of scroll-stopping AI UGC creatives, launch posters, and educational decks built for your brand.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAiUgcClientFilter('all');
                        setAiUgcFormatFilter('all');
                        document.getElementById('ai-ugc-deliverables')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="btn-shimmer flex-1 py-2 px-3 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold text-center cursor-pointer"
                    >
                      Show All 49 ↓
                    </button>
                    <a
                      href="#contact"
                      onClick={handleSmoothScroll}
                      className="py-2 px-3 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold border hover:border-yellow-400 hover:text-yellow-400 transition-colors"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-overlay)' }}
                    >
                      Book Pack →
                    </a>
                  </div>
                </div>
              </div>

              {/* Full-Width Creative Deliverables Suite */}
              <div
                id="ai-ugc-deliverables"
                className="rounded-3xl border p-6 md:p-8 relative overflow-hidden scroll-mt-20"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)',
                }}
              >
                {/* Header & Filter Controls Bar */}
                <div className="flex flex-col gap-5 mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] tracking-[0.2em] uppercase font-bold text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 mb-2">
                      <span>✦</span> Creative Deliverables Gallery
                    </span>
                    <h3 className="text-xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      Featured AI UGC &amp; Performance Creatives
                    </h3>
                    <p className="text-xs md:text-sm mt-1 max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Explore 49 studio deliverables across Arovia.ai, Anohga Yoga Studio, Shilpa Pilates Studio, Tapas Yog Shala &amp; Prana Studio. Swipe through multi-slide carousels or click any item to inspect &amp; cycle fullscreen.
                    </p>
                  </div>

                  {/* Dual Filter Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                    {/* Client Selector */}
                    <div
                      className="flex items-center gap-1 p-1 rounded-xl border overflow-x-auto max-w-full scrollbar-none"
                      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}
                    >
                      {[
                        { id: 'all', label: 'All Clients (49)' },
                        { id: 'shilpa', label: 'Shilpa Pilates (24)' },
                        { id: 'anohga', label: 'Anohga (11)' },
                        { id: 'arovia', label: 'Arovia.ai (6)' },
                        { id: 'tapas', label: 'Tapas Yog Shala (5)' },
                        { id: 'prana', label: 'Prana Studio (3)' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setAiUgcClientFilter(f.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                            aiUgcClientFilter === f.id
                              ? 'bg-yellow-400 text-black font-bold shadow-sm'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Format Selector */}
                    <div
                      className="flex items-center gap-1 p-1 rounded-xl border shrink-0"
                      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}
                    >
                      {[
                        { id: 'all', label: 'All (49)' },
                        { id: 'carousels', label: 'Carousels (9)' },
                        { id: 'posters', label: 'Posters (40)' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setAiUgcFormatFilter(f.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                            aiUgcFormatFilter === f.id
                              ? 'border border-yellow-400/50 text-yellow-400 bg-yellow-400/10 font-bold'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3-Column Studio Grid */}
                {(() => {
                  const matchedCarousels =
                    aiUgcFormatFilter === 'all' || aiUgcFormatFilter === 'carousels'
                      ? (servicesData.AI_UGC['AI UGC Static Ads'].carousels || []).filter((c) => {
                          if (aiUgcClientFilter === 'all') return true;
                          if (aiUgcClientFilter === 'arovia') return c.client === 'Arovia.ai';
                          if (aiUgcClientFilter === 'anohga') return c.client === 'Anohga Yoga Studio' || !c.client;
                          return false;
                        })
                      : [];
                  const matchedPosters =
                    aiUgcFormatFilter === 'all' || aiUgcFormatFilter === 'posters'
                      ? aiUgcPosters.filter((poster) =>
                          aiUgcClientFilter === 'all' ? true : poster.client === aiUgcClientFilter
                        )
                      : [];

                  if (matchedCarousels.length === 0 && matchedPosters.length === 0) {
                    return (
                      <div className="py-12 text-center rounded-2xl border p-6" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}>
                        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                          No carousel decks for this client — all deliverables are static campaign posters.
                        </p>
                        <button
                          type="button"
                          onClick={() => setAiUgcFormatFilter('all')}
                          className="btn-shimmer px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Show All Formats
                        </button>
                      </div>
                    );
                  }

                  const posterSlides = matchedPosters.map((p) => ({ image: p.src, title: p.title }));

                  return (
                    <div key={`${aiUgcClientFilter}-${aiUgcFormatFilter}`} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-panel">
                      {matchedCarousels.map((carousel) => (
                        <SocialCarouselCard
                          key={carousel.id}
                          carousel={carousel}
                          onImageClick={(img) => setSelectedImage(img)}
                        />
                      ))}

                      {matchedPosters.map((poster, pIdx) => (
                        <div
                          key={poster.id}
                          className="rounded-3xl border p-5 md:p-6 flex flex-col justify-between transition-all duration-300 hover:border-yellow-400/50 hover:shadow-[0_16px_40px_rgba(255,209,0,0.08)] group/poster"
                          style={{
                            borderColor: 'var(--border-color)',
                            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[9px] tracking-[0.2em] uppercase font-bold text-yellow-400 border border-yellow-400/30 bg-yellow-400/10">
                                  <span>✦</span> {poster.badge || 'Static Poster'}
                                </span>
                                <span className="text-[10px] font-semibold text-stone-400">
                                  {poster.clientName}
                                </span>
                              </div>
                              <h4
                                className="text-base md:text-lg font-bold leading-snug line-clamp-2"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                              >
                                {poster.title}
                              </h4>
                            </div>
                            <span
                              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] tracking-wider uppercase font-semibold border"
                              style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-overlay)' }}
                            >
                              Static
                            </span>
                          </div>

                          <div
                            className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border cursor-pointer select-none group/img"
                            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}
                            onClick={() =>
                              setSelectedImage({
                                src: poster.src,
                                alt: poster.title,
                                title: `${poster.clientName} Deliverables`,
                                slides: posterSlides,
                                initialIndex: pIdx,
                              })
                            }
                          >
                            <img
                              src={poster.src}
                              alt={poster.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-[1.03]"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-4">
                              <span className="text-xs font-semibold text-white leading-tight">
                                {poster.subtitle}
                              </span>
                              <span className="p-2 rounded-xl bg-yellow-400 text-black font-bold shadow-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                </svg>
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border-color)' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>{poster.clientName} Key Visual</span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedImage({
                                  src: poster.src,
                                  alt: poster.title,
                                  title: `${poster.clientName} Deliverables`,
                                  slides: posterSlides,
                                  initialIndex: pIdx,
                                })
                              }
                              className="font-bold text-yellow-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Fullscreen</span>
                              <span>↗</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Service Bento Grid */}
          {(() => {
            const rawServices = serviceSearch.trim()
              ? getServicesForCategory('ALL').filter(s =>
                  s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                  s.desc.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                  (s.tag && s.tag.toLowerCase().includes(serviceSearch.toLowerCase())) ||
                  (s.category && s.category.toLowerCase().includes(serviceSearch.toLowerCase()))
                )
              : getServicesForCategory(activeCategory);

            if (rawServices.length === 0) {
              return (
                <div className="py-16 text-center rounded-3xl border p-8"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}>
                  <div className="w-12 h-12 rounded-xl border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    No services found for "{serviceSearch}"
                  </h4>
                  <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
                    We build custom creative solutions across video, design, code, and AI. Tell us about your project!
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => setServiceSearch('')}
                      className="px-5 py-2.5 rounded-xl border text-xs font-semibold hover:border-yellow-400 transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border-color)' }}>
                      Reset Search
                    </button>
                    <a
                      href="https://wa.me/+918448865446?text=Hi%20Syntra%2C%20I%20have%20a%20custom%20service%20inquiry."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-shimmer px-6 py-2.5 rounded-xl text-xs font-bold"
                    >
                      Inquire on WhatsApp →
                    </a>
                  </div>
                </div>
              );
            }

            const gridCols = serviceSearch.trim() || activeCategory === 'ALL'
              ? 'md:grid-cols-2 lg:grid-cols-3'
              : activeCategory === 'VIDEO'
              ? 'md:grid-cols-3'
              : activeCategory === 'GRAPHICS'
              ? 'md:grid-cols-2 lg:grid-cols-4'
              : activeCategory === 'AI_UGC'
              ? 'md:grid-cols-2'
              : 'md:grid-cols-2';

            return (
              <div
                key={`${activeCategory}-${serviceSearch}`}
                className={`grid gap-5 ${gridCols} animate-panel`}
                role="tabpanel"
                id={`${activeCategory}-panel`}
                aria-labelledby={`${activeCategory}-tab`}
              >
                {rawServices.map((s) => {
                  const categoryName = s.category || activeCategory;
                  const serviceData = getServiceData(categoryName, s.title);
                  const videosCount = serviceData?.videoShowcase?.length || 0;
                  const examplesCount = serviceData?.examples?.length || 0;
                  const webCount = serviceData?.webPreview?.length || 0;
                  const clientCount = serviceData?.clientShowcases?.length || 0;
                  const sampleImages = (serviceData?.examples || []).slice(0, 3);

                  return (
                    <article
                      key={s.title}
                      onMouseMove={handleCardMouseMove}
                      className="bento-card spotlight-card group relative p-5 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-yellow-400/50 hover:shadow-[0_16px_40px_rgba(255,209,0,0.12)] hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)' }}
                      onClick={() => handleServiceClick(s.title, categoryName)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleServiceClick(s.title, categoryName); } }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details and portfolio for ${s.title}`}
                    >
                      {/* Hover ambient lighting */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-500/15 pointer-events-none rounded-[16px]" aria-hidden="true" />

                      <div className="relative">
                        {/* Card Top Pill strip: Category / Tag + Live asset counter */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="pill-label text-[9px] tracking-[0.2em]">{s.tag || categoryName}</span>

                          {/* Upcoming Badge */}
                          {s.isUpcoming ? (
                            <span className="text-[10px] tracking-wider uppercase font-bold px-2.5 py-0.5 rounded-lg border border-yellow-400/40 bg-yellow-400/15 text-yellow-400 shadow-[0_0_12px_rgba(255,209,0,0.15)] flex items-center gap-1">
                              <span>✦</span> {s.upcomingBadge || 'Upcoming'}
                            </span>
                          ) : (
                            <>
                              {/* Dynamic Proof Metric Badges */}
                              {videosCount > 0 && (
                                <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-0.5 rounded-lg border border-yellow-400/25 bg-yellow-400/10 text-yellow-400">
                                  {videosCount} {videosCount === 1 ? 'Video' : 'Videos'}
                                </span>
                              )}
                              {examplesCount > 0 && videosCount === 0 && (
                                <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-0.5 rounded-lg border border-yellow-400/25 bg-yellow-400/10 text-yellow-400">
                                  {examplesCount}+ Designs
                                </span>
                              )}
                              {clientCount > 0 && (
                                <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-0.5 rounded-lg border border-yellow-400/25 bg-yellow-400/10 text-yellow-400">
                                  {clientCount} Client Cases
                                </span>
                              )}
                              {webCount > 0 && (
                                <span className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-0.5 rounded-lg border border-yellow-400/25 bg-yellow-400/10 text-yellow-400">
                                  Live Demos
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-xl font-bold mb-2.5 leading-snug group-hover:text-yellow-400 transition-colors"
                          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                          {s.title}
                        </h4>

                        {/* Description */}
                        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                          {s.desc}
                        </p>

                        {/* Feature bullets for upcoming labs */}
                        {s.isUpcoming && s.features?.length > 0 && (
                          <div className="flex flex-col gap-1.5 mb-4 p-3 rounded-xl border"
                            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}>
                            <div className="text-[9px] uppercase tracking-widest font-bold text-yellow-400 mb-1 flex items-center justify-between">
                              <span>Capabilities Preview</span>
                              <span className="text-[8px] font-normal opacity-70">{s.targetRelease || 'Early Access'}</span>
                            </div>
                            {s.features.slice(0, 2).map((feat, fi) => (
                              <div key={fi} className="flex items-start gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                <span className="text-yellow-400 font-bold shrink-0 mt-0.5">✦</span>
                                <span className="truncate">{feat.title}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Sample preview thumbnails if available */}
                        {sampleImages.length > 0 && (
                          <div className="flex items-center gap-2 mb-4 pt-1">
                            <div className="flex -space-x-2">
                              {sampleImages.map((ex, i) => (
                                <img
                                  key={i}
                                  src={ex.image}
                                  alt=""
                                  className="w-8 h-8 rounded-xl object-cover border-2 transition-transform group-hover:scale-105"
                                  style={{ borderColor: 'var(--bg-card)' }}
                                  loading="lazy"
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                              Real client deliverables
                            </span>
                          </div>
                        )}

                        {/* Client tags for AI UGC static ads */}
                        {serviceData?.clientShowcases?.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-4 pt-1">
                            {serviceData.clientShowcases.map((c, i) => (
                              <span key={i} className="text-[9px] px-2.5 py-0.5 rounded-lg font-semibold border"
                                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-overlay)' }}>
                                ✦ {c.client}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Interactive Bottom Bar */}
                      <div className="relative pt-4 border-t flex items-center justify-between mt-4 transition-all duration-300"
                        style={{ borderColor: 'var(--border-color)' }}>
                        <span className="text-[11px] tracking-[0.2em] uppercase font-bold text-yellow-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                          <span>{s.isUpcoming ? 'Explore Roadmap & Pre-Book' : 'View Portfolio & Details'}</span>
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-110 group-hover:bg-yellow-300 transition-all">
                          →
                        </div>
                      </div>

                      {/* Decorative corner accent */}
                      <div className="absolute -right-4 -bottom-4 w-16 h-16 border border-yellow-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-400 pointer-events-none" aria-hidden="true" />
                    </article>
                  );
                })}
              </div>
            );
          })()}

          {/* ── Client Custom Retainer / Instant Action Banner ── */}
          <div className="mt-14 rounded-3xl border p-8 md:p-10 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            style={{
              borderColor: 'rgba(255, 209, 0, 0.3)',
              background: 'linear-gradient(135deg, rgba(255, 209, 0, 0.06) 0%, var(--bg-card) 60%, rgba(255, 209, 0, 0.03) 100%)'
            }}>
            <div className="max-w-xl">
              <div className="pill-label mb-3 inline-flex">Custom Retainers &amp; Fast Turnaround</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Need a tailored creative package?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                From monthly video editing pipelines to dedicated AI UGC ad campaigns and complete brand identities — we assemble flexible teams that scale with your volume.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
              <a
                href="https://wa.me/+918448865446?text=Hi%20Syntra%2C%20I%20would%20like%20to%20discuss%20a%20custom%20service%20package."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold shadow-lg hover:scale-105 transition-all duration-300"
              >
                Chat on WhatsApp →
              </a>
              <a
                href="#contact"
                onClick={handleSmoothScroll}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[11px] tracking-[0.18em] uppercase font-semibold border transition-all duration-300 hover:border-yellow-400 hover:text-yellow-400"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-card)' }}
              >
                Book Discovery Call
              </a>
            </div>
          </div>
        </section>

        {/* ── INTERACTIVE PROCESS EXPLORER ── */}
        <ProcessExplorer />

        {/* ── STATS ── */}
        <section className="py-12 sm:py-16 md:py-24 border-b" style={{ borderColor: 'var(--border-color)' }} ref={statsRef}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="pill-label mb-4 inline-flex">Inside Syntra</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                A studio built around motion. Numbers that prove it.
              </h2>
              <p className="text-sm leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
                Every project is a collaboration — fast, transparent, handcrafted. Here's where we stand.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="bento-card p-4 sm:p-6">
                <StatCard value={150} suffix="+" label="Projects" trigger={statsTrigger} />
              </div>
              <div className="bento-card p-4 sm:p-6">
                <StatCard value={60} suffix="+" label="Happy Clients" trigger={statsTrigger} />
              </div>
              <div className="bento-card p-4 sm:p-6">
                <StatCard value={5} suffix="+" label="Countries" trigger={statsTrigger} />
              </div>
              <div className="bento-card p-4 sm:p-6">
                <StatCard value={100} suffix="%" label="Delivery Rate" trigger={statsTrigger} />
              </div>
              <div className="bento-card p-4 sm:p-6 col-span-2">
                <StatCard value={2023} suffix="" label="Founded" trigger={statsTrigger} />
              </div>
            </div>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="py-12 sm:py-16 md:py-24 border-b" style={{ borderColor: 'var(--border-color)' }} id="team-section">
          <div className="mb-8 sm:mb-12 flex items-end justify-between gap-6">
            <div>
              <div className="pill-label mb-3 sm:mb-4 inline-flex">Team</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
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

        {/* ── SELECTED CLIENTS & COLLABORATIONS ── */}
        <section id="clients" className="py-12 sm:py-16 md:py-24 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <span id="testimonials" className="sr-only">Previous Clients</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8">
            <div>
              <div className="pill-label mb-3 inline-flex">
                ✦ Our Clients &amp; Collaborations
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Trusted by Leading Creators &amp; Brands.
              </h2>
              <p className="text-sm md:text-base mt-2 max-w-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                From 22M+ YouTube creators and gaming channels to wellness studios and emerging brands — explore our previous clients and creative collaborations.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <div className="px-3.5 sm:px-4 py-2 rounded-2xl border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}>
                <span className="text-base sm:text-lg font-bold text-yellow-400 font-mono">{clientsData.length}+</span>
                <span className="text-[10px] tracking-wider uppercase ml-2 text-stone-400 font-semibold">Featured Clients</span>
              </div>
            </div>
          </div>

          {/* Client Avatar Ticker Ribbon */}
          <div className="marquee-wrap mb-8 py-3.5 border-y" style={{ borderColor: 'var(--border-color)' }}>
            <div className="marquee-track gap-4">
              {[...clientsData, ...clientsData].map((c, i) => (
                <div
                  key={`${c.id}-${i}`}
                  className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border shrink-0 transition-colors hover:border-yellow-400/40"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)' }}
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-5 h-5 rounded-xl object-cover border border-yellow-400/40"
                    loading="lazy"
                  />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {c.name}
                  </span>
                  {c.stats && (
                    <span className="text-[10px] text-yellow-400 font-mono">
                      · {c.stats}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Client Filter Tabs (Smooth horizontal touch scrolling) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8 scrollbar-none flex-nowrap">
            {[
              { id: 'all', label: `All Clients (${clientsData.length})` },
              { id: 'creator', label: `Creators (${clientsData.filter((c) => c.type === 'creator').length})` },
              { id: 'gaming', label: `Gaming Channels (${clientsData.filter((c) => c.type === 'gaming').length})` },
              { id: 'brand', label: `Brands & Studios (${clientsData.filter((c) => c.type === 'brand').length})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setClientFilter(f.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  clientFilter === f.id
                    ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10 shadow-sm'
                    : 'border-white/10 text-stone-400 hover:text-white hover:border-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div key={clientFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 animate-panel">
            {clientsData
              .filter((c) => clientFilter === 'all' || c.type === clientFilter)
              .map((client, idx) => (
                <ClientCard key={client.name} client={client} delay={idx * 25} />
              ))}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="py-12 sm:py-16 md:py-24">
          <div className="grid md:grid-cols-[1fr,1.1fr] gap-8 md:gap-12 items-start">
            {/* Left */}
            <div className="md:sticky md:top-28">
              <div className="pill-label mb-4 sm:mb-6 inline-flex">Let's create</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-5 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Let's make<br />something<br /><span style={{ color: 'var(--brand-yellow)' }}>great.</span>
              </h2>
              <p className="text-sm leading-relaxed mb-8 sm:mb-10 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
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
                    className="group flex items-center gap-3.5 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border transition-all duration-300 hover:border-yellow-400/60 hover:-translate-y-0.5 hover:shadow-lg"
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

            {/* Right — Interactive Brief & Contact Form */}
            <div className="contact-card">
              {formStatus === 'success' ? (
                <div className="text-center py-8 px-4 flex flex-col items-center justify-center animate-panel">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_24px_rgba(255,209,0,0.2)]"
                    style={{ backgroundColor: 'rgba(255,209,0,0.1)', border: '2px solid rgba(255,209,0,0.5)' }}>
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-yellow-400" style={{ fontFamily: 'var(--font-display)' }}>Brief Logged!</h3>
                  <p className="text-sm max-w-md mx-auto mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Thank you, <strong className="text-yellow-400">{formData.name}</strong>. Your inquiry has been received. We'll reach out at <strong style={{ color: 'var(--text-primary)' }}>{formData.email}</strong> within 1–2 business days.
                  </p>
                  {selectedScopes.length > 0 && (
                    <div className="mb-6 px-4 py-2.5 rounded-lg border text-xs font-mono" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}>
                      Scope: <strong className="text-yellow-400">{selectedScopes.join(' · ')}</strong> · Timeline: <strong>{selectedTimeline}</strong>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={getWhatsAppBriefUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-shimmer inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs tracking-[0.15em] uppercase font-bold"
                    >
                      Fast-Track on WhatsApp →
                    </a>
                    <button onClick={resetForm}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-yellow-400 text-yellow-400 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-yellow-400 hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer">
                      New Brief
                    </button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4 sm:space-y-5" onSubmit={handleFormSubmit} noValidate>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Build your project brief</h3>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Select what you need below and send via email or instant WhatsApp.</p>
                  </div>

                  {/* Interactive Scope Selector */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-tertiary)' }}>
                      1. Select Services Needed
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Video Editing', 'AI UGC Ads', 'Thumbnails', 'Graphic Design', 'Web & SEO', 'Automation Bot'].map((scope) => {
                        const active = selectedScopes.includes(scope);
                        return (
                          <button
                            key={scope}
                            type="button"
                            onClick={() => toggleScope(scope)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              active
                                ? 'bg-yellow-400 text-black border-yellow-400 shadow-sm'
                                : 'hover:border-yellow-400/60 hover:text-yellow-400'
                            }`}
                            style={
                              active
                                ? {}
                                : { borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)', color: 'var(--text-secondary)' }
                            }
                            aria-pressed={active}
                          >
                            {active ? '✓ ' : '+ '}
                            {scope}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timeline Selector */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-tertiary)' }}>
                      2. Target Turnaround
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['48h Express', 'This Week', 'Monthly Retainer', 'Flexible'].map((t) => {
                        const active = selectedTimeline === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTimeline(t)}
                            className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                              active
                                ? 'border-yellow-400 bg-yellow-400/15 text-yellow-400'
                                : 'hover:border-white/25'
                            }`}
                            style={
                              active
                                ? {}
                                : { borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)', color: 'var(--text-secondary)' }
                            }
                            aria-pressed={active}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-1">
                    {/* Name */}
                    <div className="flex flex-col gap-1">
                      <input
                        type="text" id="contact-name" placeholder=" "
                        value={formData.name}
                        onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' })); }}
                        className="w-full rounded-xl px-4 py-3 text-base md:text-sm border outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all duration-300"
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
                        className="w-full rounded-xl px-4 py-3 text-base md:text-sm border outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all duration-300"
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
                      rows={3} id="contact-message" placeholder=" "
                      value={formData.message}
                      onChange={(e) => { setFormData(prev => ({ ...prev, message: e.target.value })); if (formErrors.message) setFormErrors(prev => ({ ...prev, message: '' })); }}
                      className="w-full rounded-xl px-4 py-3 text-base md:text-sm border outline-none focus:ring-2 focus:ring-yellow-400/40 resize-none transition-all duration-300"
                      style={{ backgroundColor: 'var(--bg-overlay)', borderColor: formErrors.message ? '#ef4444' : 'var(--border-color)', color: 'var(--text-primary)' }}
                      aria-describedby={formErrors.message ? 'message-error' : undefined}
                    />
                    <label htmlFor="contact-message" className="text-xs font-medium px-1" style={{ color: 'var(--text-tertiary)' }}>Project links, vision, or volume notes</label>
                    {formErrors.message && <p id="message-error" className="text-red-500 text-xs font-medium">{formErrors.message}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="submit" id="contact-submit"
                      disabled={formStatus === 'submitting'}
                      className="btn-shimmer w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs tracking-[0.18em] uppercase font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {formStatus === 'submitting' ? (
                        <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" aria-hidden="true" />Sending...</>
                      ) : 'Submit Brief →'}
                    </button>

                    <a
                      href={getWhatsAppBriefUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs tracking-[0.16em] uppercase font-bold border transition-all duration-200 hover:border-yellow-400 hover:text-yellow-400"
                      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-overlay)', color: 'var(--text-primary)' }}
                    >
                      Send via WhatsApp ↗
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ── FOOTER ── */}
          <footer className="mt-14 sm:mt-20 pt-8 sm:pt-10 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div>
                <button
                  type="button"
                  onClick={() => scrollToTop(450)}
                  className="flex items-center mb-3 cursor-pointer focus:outline-none"
                  aria-label="Scroll to top"
                >
                  <img src="/assets/syntra-logo.png" alt="Syntra" className="h-7 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity" />
                </button>
                <p className="text-xs leading-relaxed max-w-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  A motion-first creative studio crafting stories that convert — based in India, working worldwide.
                </p>
                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-xl border hover:border-yellow-400 hover:text-yellow-400 transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-overlay)' }}
                >
                  <span>Quick Jump</span>
                  <span className="kbd-key">⌘K</span>
                </button>
              </div>
              {/* Nav */}
              <div>
                <p className="eyebrow mb-4">Navigate</p>
                <div className="flex flex-col gap-2.5">
                  {['about', 'services', 'clients', 'process', 'contact'].map((link) => (
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
