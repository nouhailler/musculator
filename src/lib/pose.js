// Stick-figure kinematics for the animated exercise demos (src/data/demos.js).
// Kept free of React so poses can be solved and inspected outside the app.
import { SKELETON as S, GROUND } from '../data/demos.js';

const RAD = Math.PI / 180;
const at = (x, y, deg, len) => [x + len * Math.cos(deg * RAD), y + len * Math.sin(deg * RAD)];

// Walks the skeleton from the pelvis outwards and returns every joint chain the
// renderer draws, in the 100×100 viewBox coordinate space.
export function solve(p) {
  const [hx, hy] = p.hip;
  const hip = [hx, hy];
  const shoulder = at(hx, hy, p.torso, S.torso);
  const head = at(shoulder[0], shoulder[1], p.torso, S.neck);

  const arm = (a) => {
    const elbow = at(shoulder[0], shoulder[1], a[0], S.upperArm);
    return [shoulder, elbow, at(elbow[0], elbow[1], a[1], S.foreArm)];
  };
  const leg = (l, footDeg) => {
    const knee = at(hx, hy, l[0], S.thigh);
    const ankle = at(knee[0], knee[1], l[1], S.shin);
    return [hip, knee, ankle, at(ankle[0], ankle[1], footDeg, S.foot)];
  };

  return {
    head,
    neck: [shoulder, head],
    torso: [hip, shoulder],
    arm: arm(p.arm),
    armB: arm(p.armB || p.arm),
    leg: leg(p.leg, p.foot ?? 0),
    legB: leg(p.legB || p.leg, p.footB ?? p.foot ?? 0),
  };
}

const lerp = (a, b, t) => a + (b - a) * t;
const pair = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// Blends two keyframe poses; every joint interpolates independently.
export function lerpPose(a, b, t) {
  return {
    hip: pair(a.hip, b.hip, t),
    torso: lerp(a.torso, b.torso, t),
    arm: pair(a.arm, b.arm, t),
    armB: pair(a.armB || a.arm, b.armB || b.arm, t),
    leg: pair(a.leg, b.leg, t),
    legB: pair(a.legB || a.leg, b.legB || b.leg, t),
    foot: lerp(a.foot ?? 0, b.foot ?? 0, t),
    footB: lerp(a.footB ?? a.foot ?? 0, b.footB ?? b.foot ?? 0, t),
  };
}

export const points = (list) => list.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');

// Ease in/out: the figure decelerates at the top and bottom of each rep, the
// way a controlled repetition actually looks.
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

const boxes = new Map();

/**
 * Square viewBox that frames a whole demo: every joint of every keyframe, plus
 * the props it is performed on. A plank and a standing press occupy very
 * different corners of the pose space, so each one gets its own crop and both
 * end up filling — and centred in — whatever box the caller renders them in.
 */
export function viewBox(id, demo, pad = 7) {
  const cached = boxes.get(id);
  if (cached) return cached;

  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  const add = (x, y, r = 0) => {
    minX = Math.min(minX, x - r); maxX = Math.max(maxX, x + r);
    minY = Math.min(minY, y - r); maxY = Math.max(maxY, y + r);
  };
  for (const frame of demo.frames) {
    const j = solve(frame);
    for (const chain of [j.neck, j.torso, j.arm, j.armB, j.leg, j.legB]) {
      for (const [x, y] of chain) add(x, y);
    }
    add(j.head[0], j.head[1], S.head);
  }
  if (demo.scene === 'bar') add(50, 12);
  if (demo.scene === 'dipbars') add(50, 48, 0);
  if (demo.scene !== 'bar' && demo.scene !== 'none') add(50, GROUND);
  if (demo.band) add(demo.band[0], demo.band[1]);
  if (demo.ankleBand) add(demo.ankleBand[0], demo.ankleBand[1]);
  for (const p of demo.props || []) {
    if (p.kind === 'block') { add(p.x - p.w / 2, p.y); add(p.x + p.w / 2, GROUND); }
    if (p.kind === 'wall') { add(p.x, p.top ?? 20); add(p.x, GROUND); }
  }

  const side = Math.max(maxX - minX, maxY - minY) + pad * 2;
  const box = [
    (minX + maxX) / 2 - side / 2, (minY + maxY) / 2 - side / 2, side, side,
  ].map((n) => n.toFixed(2)).join(' ');
  boxes.set(id, box);
  return box;
}
