// Two-link inverse kinematics for authoring demo poses.
//
// A pose in data/demos.js is stored as angles, but is only reasonable to think
// about as positions: "the hand is on the bench, the foot is on the floor".
// Guessing the angles does not converge — this solves them.
//
// Use it from a scratch script:
//
//   import { ik, place } from './scripts/solve-pose.mjs';
//   const shoulder = place([46, 80], -17, 26);        // hip, torso angle
//   const arm = ik(shoulder, [74, 72], 13, 13, +1);   // shoulder → hand
//
// `bend` picks which side the joint bulges to: for a leg, -1 puts the knee
// forward; flip it if the elbow or knee folds the wrong way.
const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

/** The point `len` away from `from` at `deg`. */
export const place = ([x, y], deg, len) => [x + len * Math.cos(deg * RAD), y + len * Math.sin(deg * RAD)];

export const angleOf = ([ax, ay], [bx, by]) => Math.atan2(by - ay, bx - ax) * DEG;
export const dist = ([ax, ay], [bx, by]) => Math.hypot(bx - ax, by - ay);

/**
 * The two angles that take a chain from `root` to `target`.
 *
 * An unreachable target is clamped to the chain's reach rather than refused:
 * the pose stays drawable and the caller sees the joint straighten, which is
 * the visible symptom of asking for too much.
 *
 * @returns {[number, number]} the pair a demo frame stores.
 */
export function ik(root, target, l1, l2, bend = 1) {
  const reach = l1 + l2;
  const inner = Math.abs(l1 - l2);
  let d = dist(root, target);
  d = Math.min(reach - 0.01, Math.max(inner + 0.01, d));
  const base = angleOf(root, target);
  const cos = (d * d + l1 * l1 - l2 * l2) / (2 * d * l1);
  const alpha = Math.acos(Math.min(1, Math.max(-1, cos))) * DEG;
  const a1 = base + bend * alpha;
  const joint = place(root, a1, l1);
  return [round(a1), round(angleOf(joint, target))];
}

const round = (n) => Math.round(n * 10) / 10;

/** Where a pose's ends actually land — for checking before committing it. */
export function ends(frame, S = { torso: 26, upperArm: 13, foreArm: 13, thigh: 16, shin: 16 }) {
  const shoulder = place(frame.hip, frame.torso, S.torso);
  const elbow = place(shoulder, frame.arm[0], S.upperArm);
  const knee = place(frame.hip, frame.leg[0], S.thigh);
  return {
    shoulder: shoulder.map(round),
    hand: place(elbow, frame.arm[1], S.foreArm).map(round),
    ankle: place(knee, frame.leg[1], S.shin).map(round),
  };
}
