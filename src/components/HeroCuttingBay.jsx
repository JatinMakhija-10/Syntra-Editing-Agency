import { useState, useEffect, useRef, useCallback } from 'react';

const LUT_PRESETS = [
  {
    id: 'teal-gold',
    label: 'Teal & Gold LUT',
    short: 'LUT 03',
    filter: 'contrast(1.06) saturate(1.12)',
  },
  {
    id: 'amber-warm',
    label: 'Warm 2383 Print',
    short: '2383',
    filter: 'contrast(1.14) saturate(1.22) sepia(0.18)',
  },
  {
    id: 'noir',
    label: 'Monochrome Noir',
    short: 'NOIR',
    filter: 'grayscale(1) contrast(1.28) brightness(0.95)',
  },
  {
    id: 'raw-log',
    label: 'Raw Log-C (Flat)',
    short: 'LOG-C',
    filter: 'contrast(0.76) saturate(0.55) brightness(1.08)',
  },
];

// Formats percentage (0-100) into SMPTE timecode 00:MM:SS:FF within an 80-second timeline
function formatTimecode(percent) {
  const totalFrames = Math.round((Math.max(0, Math.min(100, percent)) / 100) * 80 * 60);
  const frames = totalFrames % 60;
  const totalSeconds = Math.floor(totalFrames / 60);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  const pad = (n) => String(n).padStart(2, '0');
  return `00:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

// Synthesize subtle studio UI sound using Web Audio API (only on explicit user toggle)
function playStudioClick(type = 'tick') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hit') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    }
    setTimeout(() => ctx.close().catch(() => {}), 250);
  } catch {
    // AudioContext blocked or unavailable
  }
}

export function HeroCuttingBay() {
  const [playhead, setPlayhead] = useState(24); // Starts in Scene_01_A-Roll so signature frame is shown first
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [lutIndex, setLutIndex] = useState(0);
  const [showTitleOverlay, setShowTitleOverlay] = useState(false);
  const [showSplitCompare, setShowSplitCompare] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const [sfxEnabled, setSfxEnabled] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);

  const timelineRef = useRef(null);
  const monitorRef = useRef(null);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    let last = performance.now();
    let raf;

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setPlayhead((prev) => {
        const next = prev + dt * 5.5;
        return next >= 100 ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  const scrubFromClientX = useCallback((clientX) => {
    const el = timelineRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPlayhead(Math.max(0, Math.min(100, pct)));
  }, []);

  useEffect(() => {
    if (!isScrubbing) return;
    const onMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      scrubFromClientX(x);
    };
    const onUp = () => setIsScrubbing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isScrubbing, scrubFromClientX]);

  const activeLut = LUT_PRESETS[lutIndex] || LUT_PRESETS[0];

  // Determine active camera angle from playhead position
  const activeClip =
    playhead < 36
      ? 'Scene_01_A-Roll'
      : playhead < 68
      ? 'Multicam_CamB'
      : 'B-Roll_Movement';

  const activeFrameSrc =
    activeClip === 'Multicam_CamB'
      ? '/assets/hero-cinematic-cut-alt.webp'
      : '/assets/hero-cinematic-cut.webp';

  const jumpToClip = (targetPct, clipType) => {
    setPlayhead(targetPct);
    if (sfxEnabled) playStudioClick(clipType === 'hit' ? 'hit' : 'tick');
    if (clipType === 'hit') {
      setHitFlash(true);
      setTimeout(() => setHitFlash(false), 260);
    }
  };

  const togglePlay = () => {
    setIsPlaying((p) => !p);
    if (sfxEnabled) playStudioClick('tick');
  };

  const cycleLut = () => {
    setLutIndex((prev) => (prev + 1) % LUT_PRESETS.length);
    if (sfxEnabled) playStudioClick('tick');
  };

  const handleSplitMove = (e) => {
    if (!showSplitCompare || !monitorRef.current) return;
    const rect = monitorRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = ((x - rect.left) / rect.width) * 100;
    setSplitPosition(Math.max(10, Math.min(90, pct)));
  };

  return (
    <div className="relative min-w-0">
      <div
        className="rounded-xl sm:rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300 hover:border-yellow-400/50"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {/* NLE Window Header */}
        <div
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 border-b flex items-center justify-between gap-2 text-xs"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex gap-1.5 shrink-0" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/75" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/75" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/75" />
            </div>
            <span className="font-mono text-[10px] sm:text-[11px] text-stone-400 ml-1 truncate">
              Syntra_Master_Cut_v3.prproj
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                const next = !sfxEnabled;
                setSfxEnabled(next);
                if (next) playStudioClick('tick');
              }}
              className={`font-mono text-[9px] sm:text-[10px] px-2 py-0.5 rounded border font-semibold transition-colors cursor-pointer ${
                sfxEnabled
                  ? 'border-yellow-400/50 bg-yellow-400/15 text-yellow-400'
                  : 'border-white/10 text-stone-400 hover:text-white'
              }`}
              title="Toggle tactile studio audio clicks"
            >
              SFX {sfxEnabled ? 'ON' : 'OFF'}
            </button>
            <span className="font-mono text-[9px] sm:text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20 font-semibold">
              4K DCI · 60fps
            </span>
          </div>
        </div>

        {/* Program Monitor */}
        <div
          ref={monitorRef}
          onMouseMove={showSplitCompare ? handleSplitMove : undefined}
          onTouchMove={showSplitCompare ? handleSplitMove : undefined}
          className={`relative aspect-[16/10] bg-black overflow-hidden group select-none ${
            showSplitCompare ? 'cursor-ew-resize' : 'cursor-pointer'
          }`}
          onClick={!showSplitCompare ? togglePlay : undefined}
          title={showSplitCompare ? 'Move horizontally to compare Raw Log vs Graded' : 'Click to Play / Pause timeline'}
        >
          {/* Graded Layer */}
          <img
            src={activeFrameSrc}
            alt="Syntra Studio Master Cut Preview"
            className="w-full h-full object-cover opacity-95 transition-all duration-500"
            style={{
              filter: activeLut.filter,
              transform:
                activeClip === 'B-Roll_Movement'
                  ? `scale(1.12) translateX(${((playhead - 68) / 32) * -3}%)`
                  : isPlaying
                  ? 'scale(1.03)'
                  : 'scale(1)',
            }}
            loading="eager"
            fetchPriority="high"
          />

          {/* Before / After Raw Log Layer (when Split Compare is active) */}
          {showSplitCompare && (
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - splitPosition}% 0 0)` }}
            >
              <img
                src={activeFrameSrc}
                alt="Ungraded Raw Log-C"
                className="w-full h-full object-cover"
                style={{ filter: 'contrast(0.74) saturate(0.45) brightness(1.08)' }}
              />
              <span className="absolute bottom-12 left-3 bg-black/75 border border-white/15 px-2 py-0.5 rounded text-[9px] font-mono text-stone-300 uppercase">
                Raw Log-C
              </span>
            </div>
          )}

          {showSplitCompare && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 shadow-[0_0_12px_rgba(255,209,0,0.8)] pointer-events-none z-20"
              style={{ left: `${splitPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-1.5 py-1 rounded bg-yellow-400 text-black font-mono text-[9px] font-bold shadow">
                A|B
              </div>
            </div>
          )}

          {/* Impact Hit Flash when Sound_Design_Hit clicked */}
          {hitFlash && (
            <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none transition-opacity duration-200 z-10" />
          )}

          {/* Optional Animated Motion Title Overlay */}
          {showTitleOverlay && (
            <div className="absolute inset-x-4 bottom-12 sm:bottom-14 pointer-events-none z-10 animate-panel">
              <div className="inline-block bg-black/75 backdrop-blur-md border-l-2 border-yellow-400 px-3 py-2 rounded-r-md shadow-xl">
                <p className="text-[9px] font-mono tracking-[0.25em] text-yellow-400 uppercase font-bold">
                  Motion Title · Keyframed
                </p>
                <p className="text-xs sm:text-sm font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                  SYNTRA — FRAME BY FRAME
                </p>
              </div>
            </div>
          )}

          {/* Monitor Top HUD */}
          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 flex items-center gap-2 bg-black/75 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-md border border-white/10 font-mono text-[9px] sm:text-[10px] text-white z-10">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
            <span className="font-semibold tracking-wider">{isPlaying ? 'PLAY' : 'REC'}</span>
            <span className="text-yellow-400 font-bold ml-0.5 tabular-nums">{formatTimecode(playhead)}</span>
          </div>

          <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex items-center gap-1.5 z-10">
            <span className="hidden sm:inline bg-black/75 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 font-mono text-[9px] sm:text-[10px] text-stone-300">
              {activeClip === 'Multicam_CamB' ? 'Cam B · 50mm' : activeClip === 'B-Roll_Movement' ? 'Kinetic Zoom' : 'Cam A · 35mm'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="px-2.5 py-1 rounded-md bg-yellow-400 hover:bg-yellow-300 text-black font-mono text-[9px] sm:text-[10px] font-bold shadow transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
              aria-label={isPlaying ? 'Pause preview timeline' : 'Play preview timeline'}
            >
              {isPlaying ? '❚❚ PAUSE' : '▶ PLAY'}
            </button>
          </div>

          {/* Bottom Monitor Interactive Controls */}
          <div
            className="absolute bottom-2.5 inset-x-2.5 sm:inset-x-3 flex items-center justify-between gap-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={cycleLut}
              className="bg-black/75 hover:bg-black/95 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/15 hover:border-yellow-400/60 font-mono text-[9px] sm:text-[10px] text-stone-200 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Click to cycle color grade LUTs"
            >
              <span className="w-1.5 h-1.5 rounded-sm bg-yellow-400" />
              <span>Color: {activeLut.label}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setShowTitleOverlay((s) => !s);
                  if (sfxEnabled) playStudioClick('tick');
                }}
                className={`px-2 py-1 rounded-md border font-mono text-[9px] font-bold transition-colors cursor-pointer ${
                  showTitleOverlay
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-black/75 text-stone-300 border-white/15 hover:border-yellow-400/50'
                }`}
                title="Toggle Title Motion Overlay"
              >
                GFX
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSplitCompare((s) => !s);
                  if (sfxEnabled) playStudioClick('tick');
                }}
                className={`px-2 py-1 rounded-md border font-mono text-[9px] font-bold transition-colors cursor-pointer ${
                  showSplitCompare
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-black/75 text-stone-300 border-white/15 hover:border-yellow-400/50'
                }`}
                title="Toggle Raw vs Graded Split Compare"
              >
                A/B
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Multi-Track Editor Timeline */}
        <div
          className="p-3 sm:p-4 border-t space-y-1.5 sm:space-y-2 font-mono text-[9px] sm:text-[10px]"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        >
          {/* Clickable / Scrubbable Time Ruler */}
          <div
            ref={timelineRef}
            onMouseDown={(e) => {
              setIsPlaying(false);
              setIsScrubbing(true);
              scrubFromClientX(e.clientX);
              if (sfxEnabled) playStudioClick('tick');
            }}
            onTouchStart={(e) => {
              setIsPlaying(false);
              setIsScrubbing(true);
              scrubFromClientX(e.touches[0].clientX);
            }}
            className="flex justify-between items-center text-[8px] sm:text-[9px] text-stone-500 px-1 py-1 select-none font-mono cursor-ew-resize hover:text-stone-300 transition-colors rounded bg-black/20 border border-white/5"
            title="Drag or click to scrub playhead"
          >
            <span>00:00:00</span>
            <span>00:20:00</span>
            <span className="text-yellow-400 font-bold tabular-nums">{formatTimecode(playhead).slice(0, 8)}</span>
            <span>01:00:00</span>
            <span className="hidden sm:inline">01:20:00</span>
          </div>

          {/* Track V2 - Titles & Overlays */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-5 sm:w-6 text-stone-400 text-right select-none font-semibold">V2</span>
            <div className="flex-1 h-5 sm:h-6 bg-black/40 rounded border border-white/5 flex gap-1 p-0.5 relative overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setShowTitleOverlay((s) => !s);
                  jumpToClip(14, 'tick');
                }}
                className={`w-1/4 h-full rounded flex items-center px-1.5 sm:px-2 text-[8px] sm:text-[9px] truncate transition-all cursor-pointer border ${
                  showTitleOverlay
                    ? 'bg-amber-400/45 border-amber-300 text-white font-bold'
                    : 'bg-amber-500/30 border-amber-500/50 text-amber-200 hover:bg-amber-500/45'
                }`}
                title="Click to toggle motion title GFX"
              >
                Title_Motion_In
              </button>
              <button
                type="button"
                onClick={() => {
                  cycleLut();
                  jumpToClip(45, 'tick');
                }}
                className="w-1/3 h-full bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 rounded flex items-center px-1.5 sm:px-2 text-[8px] sm:text-[9px] text-amber-200 truncate transition-all cursor-pointer"
                title="Click to cycle LUT grade"
              >
                LUT_{activeLut.short}
              </button>
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10 pointer-events-none transition-[left] duration-75"
                style={{ left: `${playhead}%` }}
              />
            </div>
          </div>

          {/* Track V1 - Main Video Cuts */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-5 sm:w-6 text-stone-400 text-right select-none font-semibold">V1</span>
            <div className="flex-1 h-5 sm:h-6 bg-black/40 rounded border border-white/5 flex gap-1 p-0.5 relative overflow-hidden">
              <button
                type="button"
                onClick={() => jumpToClip(18, 'tick')}
                className={`w-[34%] h-full rounded flex items-center px-1.5 sm:px-2 text-[8px] sm:text-[9px] truncate transition-all cursor-pointer border ${
                  activeClip === 'Scene_01_A-Roll'
                    ? 'bg-blue-500/50 border-blue-300 text-white font-bold'
                    : 'bg-blue-500/25 border-blue-500/45 text-blue-200 hover:bg-blue-500/40'
                }`}
              >
                Scene_01_A-Roll
              </button>
              <button
                type="button"
                onClick={() => jumpToClip(50, 'tick')}
                className={`w-[31%] h-full rounded flex items-center px-1.5 sm:px-2 text-[8px] sm:text-[9px] truncate transition-all cursor-pointer border ${
                  activeClip === 'Multicam_CamB'
                    ? 'bg-blue-500/50 border-blue-300 text-white font-bold'
                    : 'bg-blue-500/25 border-blue-500/45 text-blue-200 hover:bg-blue-500/40'
                }`}
              >
                Multicam_CamB
              </button>
              <button
                type="button"
                onClick={() => jumpToClip(80, 'tick')}
                className={`w-[35%] h-full rounded flex items-center px-1.5 sm:px-2 text-[8px] sm:text-[9px] truncate transition-all cursor-pointer border ${
                  activeClip === 'B-Roll_Movement'
                    ? 'bg-blue-500/50 border-blue-300 text-white font-bold'
                    : 'bg-blue-500/25 border-blue-500/45 text-blue-200 hover:bg-blue-500/40'
                }`}
              >
                B-Roll_Movement
              </button>
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10 pointer-events-none transition-[left] duration-75"
                style={{ left: `${playhead}%` }}
              />
            </div>
          </div>

          {/* Track A1 - Dialog & Master Audio */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-5 sm:w-6 text-stone-400 text-right select-none font-semibold">A1</span>
            <div className="flex-1 h-5 sm:h-6 bg-black/40 rounded border border-white/5 flex gap-1 p-0.5 relative overflow-hidden">
              <button
                type="button"
                onClick={() => jumpToClip(30, 'tick')}
                className="w-3/5 h-full bg-emerald-500/30 hover:bg-emerald-500/45 border border-emerald-500/50 rounded flex items-center justify-between px-1.5 sm:px-2 text-[8px] sm:text-[9px] text-emerald-200 truncate cursor-pointer transition-colors"
              >
                <span className="truncate">Dialog_VO_48kHz_Clean</span>
                {isPlaying && (
                  <span className="flex items-end gap-0.5 h-2.5 ml-1 shrink-0" aria-hidden="true">
                    <span className="w-0.5 h-full bg-emerald-300 eq-bar" style={{ animationDelay: '0ms' }} />
                    <span className="w-0.5 h-full bg-emerald-300 eq-bar" style={{ animationDelay: '150ms' }} />
                    <span className="w-0.5 h-full bg-emerald-300 eq-bar" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => jumpToClip(72, 'hit')}
                className="w-1/4 h-full bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/40 rounded flex items-center px-1.5 sm:px-2 text-[8px] sm:text-[9px] text-emerald-200 truncate cursor-pointer transition-colors"
                title="Trigger impact cut & sound hit"
              >
                Sound_Design_Hit
              </button>
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10 pointer-events-none transition-[left] duration-75"
                style={{ left: `${playhead}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer Telemetry */}
        <div
          className="px-3.5 sm:px-4 py-2 border-t flex items-center justify-between text-[9px] sm:text-[10px] text-stone-400 font-mono"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
        >
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-yellow-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            {isPlaying ? 'Playing Master Sequence' : 'Interactive Timeline · Click clips or scrub'}
          </span>
          <span className="text-stone-500 truncate ml-2">
            {isPlaying ? '60.00 fps locked' : 'RAM preview 100% · 0 dropped frames'}
          </span>
        </div>
      </div>
    </div>
  );
}
export default HeroCuttingBay;
