import { useEffect, useRef } from 'react';
import { DEMOS, GROUND, SKELETON as S } from '../data/demos.js';
import { CUES } from '../data/cues.js';
import { solve, lerpPose, points as pts, ease, viewBox } from '../lib/pose.js';

// Props the exercise is performed on. The floor runs well past the viewBox on
// both sides so it still spans the frame whatever crop the demo is given.
function Scene({ scene }) {
  const rail = 'var(--color-neutral-700)';
  const floor = <line x1="-60" y1={GROUND} x2="160" y2={GROUND} stroke={rail} strokeWidth="2" strokeLinecap="round" />;
  if (scene === 'bar') {
    return (
      <g>
        <line x1="18" y1="12" x2="82" y2="12" stroke={rail} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="22" y1="12" x2="22" y2="2" stroke={rail} strokeWidth="2.5" />
        <line x1="78" y1="12" x2="78" y2="2" stroke={rail} strokeWidth="2.5" />
      </g>
    );
  }
  if (scene === 'dipbars') {
    return (
      <g>
        <line x1="30" y1="48" x2="80" y2="48" stroke={rail} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="36" y1="48" x2="36" y2={GROUND} stroke={rail} strokeWidth="2.5" />
        <line x1="74" y1="48" x2="74" y2={GROUND} stroke={rail} strokeWidth="2.5" />
        {floor}
      </g>
    );
  }
  if (scene === 'mat') {
    return (
      <g>
        <rect x="2" y={GROUND} width="96" height="4" rx="2" fill="var(--color-neutral-800)" />
        {floor}
      </g>
    );
  }
  return floor;
}

/**
 * Animated stick-figure demonstration of one exercise.
 *
 * The loop runs on requestAnimationFrame and writes straight to the SVG nodes,
 * so a running demo never re-renders the React tree above it. One full loop
 * lasts as long as the voice cadence for that exercise, which keeps the figure
 * in sync with the spoken "En bas — En haut".
 */
export default function ExerciseDemo({ exId, label, paused = false, style, className }) {
  const demo = DEMOS[exId];
  const nodes = useRef({});
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    if (!demo) return undefined;
    const frames = demo.frames;
    const cycle = demo.cycle || (CUES[exId]?.beat || 1500) * frames.length;

    const draw = (pose) => {
      const n = nodes.current;
      const j = solve(pose);
      for (const k of ['armB', 'legB', 'torso', 'neck', 'arm', 'leg']) {
        n[k]?.setAttribute('points', pts(j[k]));
      }
      if (n.head) {
        n.head.setAttribute('cx', j.head[0].toFixed(2));
        n.head.setAttribute('cy', j.head[1].toFixed(2));
      }
      const [hand, handB] = [j.arm[2], j.armB[2]];
      if (n.wA) {
        n.wA.setAttribute('x', (hand[0] - 5).toFixed(2));
        n.wA.setAttribute('y', (hand[1] - 2.5).toFixed(2));
      }
      if (n.wB) {
        n.wB.setAttribute('x', (handB[0] - 5).toFixed(2));
        n.wB.setAttribute('y', (handB[1] - 2.5).toFixed(2));
      }
      if (n.band) {
        n.band.setAttribute('x1', hand[0].toFixed(2));
        n.band.setAttribute('y1', hand[1].toFixed(2));
      }
    };

    // Users who asked for less motion get the exercise's starting position —
    // still readable as a posture, but nothing moves.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      draw(frames[0]);
      return undefined;
    }

    let raf = 0;
    let clock = 0;
    let last = performance.now();
    const span = cycle / frames.length;
    const tick = (now) => {
      // The first rAF timestamp can predate the `last` we seeded from
      // performance.now(); clamping keeps the clock — and the frame index —
      // from going negative.
      if (!pausedRef.current) clock = (clock + Math.max(0, now - last)) % cycle;
      last = now;
      const i = Math.floor(clock / span) % frames.length;
      draw(lerpPose(frames[i], frames[(i + 1) % frames.length], ease((clock % span) / span)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [exId, demo]);

  if (!demo) return null;

  const skin = 'var(--color-accent-100)';
  const far = 'color-mix(in srgb, var(--color-accent-300) 45%, transparent)';
  const limb = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const hold = (k) => (el) => { nodes.current[k] = el; };

  return (
    <svg viewBox={viewBox(exId, demo)} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
      role="img" aria-label={label ? `Démonstration animée : ${label}` : 'Démonstration animée'}
      style={style} className={className}>
      <Scene scene={demo.scene} />
      {demo.band && (
        <line ref={hold('band')} x1="50" y1="35" x2={demo.band[0]} y2={demo.band[1]}
          stroke="var(--color-accent-600)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
      )}
      <polyline ref={hold('armB')} points="" stroke={far} strokeWidth="4" {...limb} />
      <polyline ref={hold('legB')} points="" stroke={far} strokeWidth="4.5" {...limb} />
      <polyline ref={hold('torso')} points="" stroke={skin} strokeWidth="6" {...limb} />
      <polyline ref={hold('neck')} points="" stroke={skin} strokeWidth="4" {...limb} />
      <circle ref={hold('head')} cx="50" cy="24" r={S.head} fill={skin} />
      <polyline ref={hold('arm')} points="" stroke={skin} strokeWidth="4.5" {...limb} />
      <polyline ref={hold('leg')} points="" stroke={skin} strokeWidth="5" {...limb} />
      {demo.weights && (
        <g fill="var(--color-accent-400)">
          <rect ref={hold('wB')} x="0" y="0" width="10" height="5" rx="2" opacity=".55" />
          <rect ref={hold('wA')} x="0" y="0" width="10" height="5" rx="2" />
        </g>
      )}
    </svg>
  );
}
