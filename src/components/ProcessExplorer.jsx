import { useState } from 'react';
import { handleSmoothScroll } from '../utils/smoothScroll';

const STAGES = [
  {
    step: '01',
    title: 'Discovery',
    desc: 'Requirements, moodboards, references, and creative constraints.',
    turnaround: 'Day 1 · 20-Min Sync',
    deliverable: 'Creative Brief, Pacing Benchmark & Asset Folder Setup',
    checkpoint: 'Lock visual direction, target audience, and hook angles.',
  },
  {
    step: '02',
    title: 'Draft',
    desc: 'Sketches, storyboards, edit directions and styleframes.',
    turnaround: '24 – 48 Hours',
    deliverable: 'A-Roll Assembly Cut, Hook Mockups & Typography Frame',
    checkpoint: 'Review pacing, narrative arc, and first visual direction.',
  },
  {
    step: '03',
    title: 'Edit',
    desc: 'Full creative execution across video, design and copy.',
    turnaround: '48 – 72 Hours',
    deliverable: 'Motion Graphics, Sound Design, LUT Grading & Copy Polish',
    checkpoint: 'Frame-accurate revision pass until every second lands.',
  },
  {
    step: '04',
    title: 'Deliver',
    desc: 'On-time delivery plus space for iteration and refinement.',
    turnaround: 'Same-Day Final Pack',
    deliverable: '4K Masters, Vertical 9:16 Cuts, Project Files & Thumbnails',
    checkpoint: 'Platform-ready export + rapid A/B hook variations.',
  },
];

export function ProcessExplorer() {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = STAGES[activeIdx];
  const progressWidth = `${((activeIdx + 1) / STAGES.length) * 100}%`;

  return (
    <section id="process" className="py-12 sm:py-16 md:py-24 border-b" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
        <div>
          <div className="pill-label mb-4 inline-flex">Interactive Workflow · Click Any Stage</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            How we create —<br className="hidden md:block" /> frame by frame.
          </h2>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveIdx((i) => (i - 1 + STAGES.length) % STAGES.length)}
            className="px-3 py-1.5 rounded-md border text-xs font-bold hover:border-yellow-400 hover:text-yellow-400 transition-colors cursor-pointer"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            aria-label="Previous process stage"
          >
            ← Prev
          </button>
          <span className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-md border border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
            {current.step} / 04
          </span>
          <button
            type="button"
            onClick={() => setActiveIdx((i) => (i + 1) % STAGES.length)}
            className="px-3 py-1.5 rounded-md border text-xs font-bold hover:border-yellow-400 hover:text-yellow-400 transition-colors cursor-pointer"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            aria-label="Next process stage"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div className="hidden md:block relative h-1 w-full rounded-sm mb-6 overflow-hidden" style={{ backgroundColor: 'var(--bg-overlay)' }}>
        <div
          className="h-full bg-yellow-400 transition-all duration-300"
          style={{ width: progressWidth }}
        />
      </div>

      {/* 4 Selectable Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 relative mb-6">
        {STAGES.map((s, idx) => {
          const isActive = idx === activeIdx;
          const isCompleted = idx < activeIdx;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`process-card text-left relative flex flex-col gap-3 sm:gap-4 p-5 sm:p-6 rounded-xl border transition-all duration-250 cursor-pointer ${
                isActive
                  ? 'border-yellow-400 shadow-[0_12px_32px_rgba(255,209,0,0.12)] -translate-y-1'
                  : 'hover:border-yellow-400/45 hover:-translate-y-0.5'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                borderColor: isActive ? undefined : isCompleted ? 'rgba(255, 209, 0, 0.25)' : 'var(--border-color)',
              }}
              aria-pressed={isActive}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`font-bold text-3xl sm:text-4xl transition-colors ${
                    isActive ? 'text-yellow-400' : isCompleted ? 'text-yellow-400/50' : ''
                  }`}
                  style={!isActive && !isCompleted ? { color: 'rgba(255, 209, 0, 0.2)', fontFamily: 'var(--font-display)' } : { fontFamily: 'var(--font-display)' }}
                >
                  {s.step}
                </span>
                <span
                  className={`text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm border ${
                    isActive
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : isCompleted
                      ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
                      : 'border-white/10 text-stone-400'
                  }`}
                >
                  {isActive ? 'Selected' : isCompleted ? 'Done ✓' : s.turnaround.split('·')[0].trim()}
                </span>
              </div>

              <div>
                <h3
                  className={`text-base font-bold mb-1.5 transition-colors ${isActive ? 'text-yellow-400' : ''}`}
                  style={!isActive ? { fontFamily: 'var(--font-display)', color: 'var(--text-primary)' } : { fontFamily: 'var(--font-display)' }}
                >
                  {s.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {s.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Selected Stage Blueprint Detail Bar */}
      <div
        key={current.step}
        className="rounded-xl border p-5 sm:p-6 grid md:grid-cols-3 gap-5 items-center animate-panel"
        style={{
          borderColor: 'rgba(255, 209, 0, 0.35)',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-gradient-end) 100%)',
        }}
      >
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 font-bold block mb-1">
            Stage {current.step} · Turnaround
          </span>
          <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {current.turnaround}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {current.checkpoint}
          </p>
        </div>

        <div className="md:border-l md:pl-5" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold block mb-1" style={{ color: 'var(--text-tertiary)' }}>
            Deliverable Output
          </span>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {current.deliverable}
          </p>
        </div>

        <div className="flex md:justify-end">
          <a
            href="#contact"
            onClick={handleSmoothScroll}
            className="btn-shimmer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-xs tracking-wider uppercase font-bold shadow hover:scale-105 transition-all"
          >
            Kick Off Stage 01 →
          </a>
        </div>
      </div>
    </section>
  );
}

export default ProcessExplorer;
