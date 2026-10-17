/**
 * The orbital cursor's shape, as pure geometry.
 *
 * The cursor is drawn as four quarter-strokes — one per corner of the pointer.
 * At rest each quarter is an arc of the same circle, with a small gap either
 * side of the diagonals, so the four of them read as one delicate ring with four
 * notches in it. Locked, the same four quarters are the corner brackets of a
 * square: an arm along the top edge, a right angle, an arm down the side, open
 * toward the middle.
 *
 * Every state between the two is a point on the way from one to the other, and
 * because both are the same number of points in the same order, the circle
 * really does become the brackets — it is not swapped for them. That is the
 * whole reason the shape is built here rather than drawn as two SVG icons.
 *
 * Nothing in this file touches the DOM or React: given a size and how far along
 * the way to locked the cursor is, it returns four `d` strings.
 */

/** What the pointer is over. Four shapes, no animation between them but the transition. */
export type HoverState = "idle" | "hover" | "grab" | "frame";

/** Everything the cursor can be, the press included. */
export type CursorState = HoverState | "lock";

export interface Shape {
  /** Radius of the ring, and half the side of the square the brackets sit on. */
  size: number;
  /** How far from the ring (0) toward the brackets (1). */
  lock: number;
  /** Stroke width in viewBox units. */
  weight: number;
  /** How large the centre dot is drawn. */
  dot: number;
}

/**
 * The resting shapes.
 *
 * `hover` is a link or a control: the ring opens up and the dot grows a little,
 * which is the whole vocabulary the site needs for "this responds". `grab` is a
 * surface that can be dragged, and is only a slightly wider ring, because the
 * drag is announced by the ring rather than the dot. `frame` is a project card,
 * where the ring becomes its brackets and stays that way: the brackets are the
 * point, so the shape does not move again until the pointer leaves.
 */
export const HOVER_SHAPES: Record<HoverState, Shape> = {
  idle: { size: 13, lock: 0, weight: 1.15, dot: 1 },
  hover: { size: 19, lock: 0, weight: 1.3, dot: 1.3 },
  grab: { size: 21, lock: 0, weight: 1.3, dot: 1.1 },
  frame: { size: 16, lock: 1, weight: 1.3, dot: 1.15 },
};

/**
 * The press, in three moves: the ring contracts as it turns into brackets, the
 * brackets then push back out a little as if they had been locked onto the
 * target, and finally settle. The dot pulses on the first move and comes down to
 * the bracket's size on the second, so the pulse is over before the hold.
 */
export const LOCK = {
  size: 16,
  contract: 0.86,
  expand: 1.06,
  weight: 1.35,
  dot: 1.55,
} as const;

/** The gap at each end of every quarter, in degrees. Four quarters, four notches. */
const ARC_GAP = 9;

/** How much of the square's half-side each bracket arm covers. */
const ARM = 0.62;

/**
 * Points per quarter. Odd, so that the point in the middle is exactly the path's
 * midpoint — that is what makes the bracket's right angle land on a real point
 * instead of being rounded off by the interpolation.
 */
const POINTS = 17;

/** The direction each quarter faces, in SVG degrees (y grows downward). */
const QUARTERS = [225, 315, 45, 135] as const;

/** The quarter every other one is measured from: the top-left, at 225°. */
const BASE = 225;

const RADIANS = Math.PI / 180;

interface Point {
  x: number;
  y: number;
}

/** One quarter of the ring: an arc, with the notch at either end. */
function ringQuarter(size: number): Point[] {
  const from = 180 + ARC_GAP;
  const sweep = 90 - 2 * ARC_GAP;
  const points: Point[] = [];
  for (let i = 0; i < POINTS; i += 1) {
    const angle = (from + (sweep * i) / (POINTS - 1)) * RADIANS;
    points.push({ x: size * Math.cos(angle), y: size * Math.sin(angle) });
  }
  return points;
}

/**
 * The same quarter, locked: in from the middle, right at the corner, and back
 * out. The two arms are the same length, so walking it at even steps walks it at
 * even speed, which is what keeps the crossover from the arc looking like a
 * stretch rather than a slide.
 */
function bracketQuarter(size: number): Point[] {
  const arm = size * ARM;
  const corner = { x: -size, y: -size };
  const from = { x: -size, y: -size + arm };
  const to = { x: -size + arm, y: -size };

  const points: Point[] = [];
  for (let i = 0; i < POINTS; i += 1) {
    const t = i / (POINTS - 1);
    const [a, b, k] =
      t <= 0.5 ? [from, corner, t * 2] : [corner, to, (t - 0.5) * 2];
    points.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
  }
  return points;
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * One quarter's path, `lock` of the way from the ring to the brackets, facing
 * that many degrees round the pointer.
 *
 * Between the two shapes every point is a straight line between where that point
 * is on the arc and where it is on the bracket, so the stroke's middle is pushed
 * out to the corner while its ends slide up onto the square's edges. The whole
 * shape is then rotated into its quarter: the four facings are 90° apart, so the
 * turn is exact and no rounding error creeps into the drawing.
 */
function quarter(size: number, lock: number, facing: number): string {
  const rest = ringQuarter(size);
  const held = bracketQuarter(size);
  const turn = (facing - BASE) * RADIANS;
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);

  let path = "";
  for (let i = 0; i < POINTS; i += 1) {
    const x = rest[i].x + (held[i].x - rest[i].x) * lock;
    const y = rest[i].y + (held[i].y - rest[i].y) * lock;
    path += `${i === 0 ? "M" : "L"}${round(x * cos - y * sin)} ${round(x * sin + y * cos)}`;
  }
  return path;
}

/** The four paths, in the order they are drawn. */
export function cursorPaths(size: number, lock: number): string[] {
  return QUARTERS.map((facing) => quarter(size, lock, facing));
}

/**
 * The nearest quarter turn.
 *
 * The ring drifts round on its own, and four-fold, so a 90° turn of it is the
 * same drawing. That makes this both the shortest way to square the brackets up
 * with the page and, at worst, 45° of travel.
 */
export function nearestQuarter(angle: number): number {
  return Math.round(angle / 90) * 90;
}
