/**
 * Scene 08 — the crack field, as geometry only.
 *
 * Generated once from a fixed seed and exported as plain data. The scene renders
 * it as ordinary SVG and lets GSAP draw it; nothing here touches the DOM, so
 * nothing depends on layout and React never re-computes a path on a re-render.
 *
 * ## How the field is built
 *
 * Not as a starburst. Ground that gives way breaks into blocks, so the field is
 * laid out as a fracture *network*: rings of nodes at a roughly constant
 * spacing, each ring joined around its own circumference and outward to the
 * nearest node of the ring beyond it. Broken ground tends toward one block size
 * rather than big blocks in the middle and dust at the edge, so the node spacing
 * is deliberately near-uniform — which is also what stops it reading as a
 * spiderweb.
 *
 * On top of that sit the main ruptures: a few long breaks from the impact point
 * that cut across the rings, and splays thrown off the joints. Everything is
 * irregular on purpose — radii, angles and which joins actually broke are all
 * jittered, and roughly a quarter of the circumference joins are missing
 * outright, because ground does not break everywhere at once.
 *
 * Every run is a jagged polyline whose interior points are pulled off the
 * straight line, so nothing is a chord between two points.
 *
 * Coordinates are the SVG's own units, with the impact point at `(0, 0)`.
 * `CRACK_BRANCHES` is sorted by distance from that point, so the scene can draw
 * it with a single uniform stagger and still get an outward-spreading reveal.
 */

/** The square the field is drawn in, centred on the impact point. */
export const CRACK_VIEWBOX = "-300 -300 600 600";

export interface CrackBranch {
  /** SVG path data. */
  d: string;
  /** Total length, so the scene can dash-draw it without measuring the DOM. */
  length: number;
  /** Stroke width in view units. */
  width: number;
  opacity: number;
  /** Distance of the branch's midpoint from the impact point. */
  reach: number;
}

/**
 * A small darker knot where breaks meet. Not a colour accent: on paper the
 * deepest point of a joint simply reads as the fullest ink.
 */
export interface CrackSignal {
  cx: number;
  cy: number;
  r: number;
}

interface Point {
  x: number;
  y: number;
}

/** Nothing is drawn past this, so the field stays inside the viewBox. */
const MAX_REACH = 294;

const TAU = Math.PI * 2;
const SEED = 0x0802_2026;

/**
 * Node rings, as a fraction of the field's radius. The node counts are set so
 * every ring's spacing comes out at roughly the same 35 units: broken ground
 * tends toward one block size rather than big blocks in the middle and dust at
 * the edge, and even spacing is also what stops this reading as a spiderweb.
 */
const RINGS = [
  { fraction: 0.14, nodes: 8 },
  { fraction: 0.3, nodes: 16 },
  { fraction: 0.47, nodes: 24 },
  { fraction: 0.63, nodes: 31 },
  { fraction: 0.79, nodes: 38 },
  { fraction: 0.93, nodes: 45 },
];

/** Long breaks from the impact point, cutting across the rings. */
const RUPTURES = 7;
/** Loose cracks hung off the network at random. */
const SPLAYS = 30;

/** Weight by kind: the break is heaviest where it started. */
const KIND = {
  rupture: { width: 1.8, opacity: 0.95 },
  fissure: { width: 1.15, opacity: 0.86 },
  band: { width: 0.85, opacity: 0.74 },
  splay: { width: 0.62, opacity: 0.6 },
} as const;

type Kind = keyof typeof KIND;

/**
 * A tiny linear congruential generator. Deterministic on purpose: the same
 * field on every run and every reload, so the scene is reproducible.
 */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
}

function toPath(points: Point[]) {
  let d = "";
  let length = 0;

  points.forEach((point, index) => {
    const previous = points[index - 1];
    if (index === 0) {
      d += `M${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      return;
    }
    length += Math.hypot(point.x - previous.x, point.y - previous.y);
    d += `L${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  });

  return { d, length };
}

function build() {
  const random = makeRandom(SEED);
  const branches: CrackBranch[] = [];
  const signals: CrackSignal[] = [];

  const spread = (value: number, amount: number) =>
    value * (1 + (random() - 0.5) * 2 * amount);

  const emit = (points: Point[], kind: Kind) => {
    if (points.length < 2) return;
    const { d, length } = toPath(points);
    const middle = points[Math.floor(points.length / 2)];
    const { width, opacity } = KIND[kind];
    branches.push({
      d,
      length,
      width,
      // Uneven inking: no two cracks in real ground are the same shade.
      opacity: Number((opacity * (0.82 + random() * 0.32)).toFixed(3)),
      reach: Math.hypot(middle.x, middle.y),
    });
  };

  /**
   * Between two points, with the run pulled off the straight line. A crack is
   * never a chord: it wanders, and the wander is what reads as broken ground.
   */
  const between = (a: Point, b: Point, wander: number) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const span = Math.hypot(dx, dy);
    if (span < 1) return null;
    // Perpendicular to the run, so the wander pushes the crack sideways.
    const px = -dy / span;
    const py = dx / span;
    const parts = 2 + Math.floor(random() * 3);
    const points: Point[] = [a];

    for (let i = 1; i < parts; i += 1) {
      const t = i / parts;
      const off = (random() - 0.5) * 2 * wander * span;
      points.push({ x: a.x + dx * t + px * off, y: a.y + dy * t + py * off });
    }

    points.push(b);
    return points;
  };

  /**
   * A run outward from a point. The turn per segment is small, so a fissure
   * advances in near straight steps and jogs at the joint, and it stops dead
   * rather than leaving the field.
   */
  const run = (
    x0: number,
    y0: number,
    angle: number,
    steps: number,
    stepMin: number,
    stepMax: number,
    drift: number,
  ) => {
    let x = x0;
    let y = y0;
    let a = angle;
    const points: Point[] = [{ x, y }];

    for (let step = 0; step < steps; step += 1) {
      a += (random() - 0.5) * drift;
      const travel = stepMin + random() * (stepMax - stepMin);
      const nx = x + Math.cos(a) * travel;
      const ny = y + Math.sin(a) * travel;
      if (Math.hypot(nx, ny) > MAX_REACH) break;
      x = nx;
      y = ny;
      points.push({ x, y });
    }

    return points;
  };

  /* --- The network ---------------------------------------------------- */

  const rings: Point[][] = RINGS.map((ring, ringIndex) => {
    const radius = ring.fraction * MAX_REACH;
    const points: Point[] = [];

    for (let i = 0; i < ring.nodes; i += 1) {
      const step = TAU / ring.nodes;
      const angle = i * step + (random() - 0.5) * step * 0.7;
      const r = Math.min(MAX_REACH - 4, spread(radius, ringIndex === 0 ? 0.34 : 0.16));
      points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }

    return points;
  });

  const joints: Point[] = [];

  rings.forEach((ring, ringIndex) => {
    // Around the ring. A quarter of these simply never broke.
    for (let i = 0; i < ring.length; i += 1) {
      const a = ring[i];
      const b = ring[(i + 1) % ring.length];
      if (random() < 0.28) continue;
      const points = between(a, b, 0.22);
      if (!points) continue;
      emit(points, ringIndex === 0 ? "band" : "splay");
      if (random() < 0.5) joints.push(points[Math.floor(points.length / 2)]);
    }

    // Outward, to whichever node of the next ring is nearest — which is what
    // makes the joins read as radial breaks rather than as spokes.
    const next = rings[ringIndex + 1];
    if (!next) return;

    for (const target of next) {
      if (random() < 0.4) continue;
      let nearest = ring[0];
      let distance = Infinity;
      for (const source of ring) {
        const d = Math.hypot(source.x - target.x, source.y - target.y);
        if (d < distance) {
          distance = d;
          nearest = source;
        }
      }
      const points = between(nearest, target, 0.17);
      if (!points) continue;
      emit(points, "fissure");
      joints.push(points[Math.floor(points.length / 2)]);
    }
  });

  /* --- The main breaks ------------------------------------------------ */

  for (let i = 0; i < RUPTURES; i += 1) {
    const angle = (i / RUPTURES) * TAU + (random() - 0.5) * 0.8;
    const points = run(
      0,
      0,
      angle,
      5 + Math.floor(random() * 4),
      20 + random() * 14,
      32 + random() * 20,
      0.3,
    );
    emit(points, "rupture");
  }

  /* --- Splays, and the chewed-up epicentre ---------------------------- */

  for (let i = 0; i < SPLAYS; i += 1) {
    const radius = 20 + random() * (MAX_REACH - 46);
    const angle = random() * TAU;
    const points = run(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      angle + (random() - 0.5) * 2.4,
      1 + Math.floor(random() * 2),
      13 + random() * 16,
      20 + random() * 24,
      0.5,
    );
    emit(points, "splay");
  }

  /* --- Knots at a few joints, never along a whole crack --------------- */

  for (let i = 0; i < 6 && joints.length; i += 1) {
    const joint = joints[Math.floor(random() * joints.length)];
    signals.push({
      cx: Number(joint.x.toFixed(1)),
      cy: Number(joint.y.toFixed(1)),
      r: 1.4 + random() * 1.1,
    });
  }

  // Nearest first: a uniform stagger over this order spreads outward in time.
  branches.sort((a, b) => a.reach - b.reach);

  return { branches, signals };
}

const field = build();

export const CRACK_BRANCHES = field.branches;
export const CRACK_SIGNALS = field.signals;
