"use client";
import { useEffect, useRef, useCallback, useState } from "react";

interface InkRevealProps {
  /** RGB color of the mask overlay, e.g. [252, 250, 248] */
  maskColor?: [number, number, number];
  /** Radius of each ink stamp in px */
  brushSize?: number;
  /**
   * How long a revealed area stays uncovered before it fades back to the mask
   * (ms). The number is the whole reveal's persistence window — the grow-in
   * animation of each stamp is separate (see `expandMs`).
   */
  lifetime?: number;
  /** How long a single stamp takes to grow from rStart to full radius (ms). */
  expandMs?: number;
  /** Initial radius before the stamp expands */
  rStart?: number;
  /** Random variation factor for stamp radius (0–1) */
  rVary?: number;
  /** Min pixel distance between stamps along a stroke */
  stampStep?: number;
  /** Max stamps still animating at once (older ones are baked immediately) */
  maxStamps?: number;
  /** Number of segments on the wobble circle (higher = smoother) */
  segments?: number;
  /** Wobble amplitude weights [primary, secondary, tertiary] */
  wobble?: [number, number, number];
  /** Gradient inner-radius factor (0–1, relative to stamp radius) */
  gradientInnerRadius?: number;
  /** Gradient opacity stops [center, mid, edge] */
  gradientStops?: [number, number, number];
  /** Extra CSS class for the canvas element */
  className?: string;
  /** Extra inline styles for the canvas element */
  style?: React.CSSProperties;
  /** When true the mask is removed entirely (keyboard/assistive reveal). */
  cleared?: boolean;
}

interface Stamp {
  x: number;
  y: number;
  born: number;
  seed: number;
  rmax: number;
}

export default function InkReveal({
  maskColor = [252, 250, 248],
  brushSize = 128,
  lifetime = 30000,
  expandMs = 600,
  rStart = 10,
  rVary = 0.45,
  stampStep = 10,
  maxStamps = 200,
  segments = 36,
  wobble = [0.14, 0.08, 0.05],
  gradientInnerRadius = 0.2,
  gradientStops = [0.95, 0.88, 0],
  className,
  style,
  cleared = false,
}: InkRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Offscreen layer holding already-expanded ("baked") reveal, so the live
  // animation loop never has to re-draw thousands of stamps each frame.
  const revealRef = useRef<HTMLCanvasElement | null>(null);
  const liveRef = useRef<Stamp[]>([]);
  const runningRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const dimsRef = useRef({ w: 0, h: 0 });
  const fadeStartRef = useRef(0);
  const hasRevealRef = useRef(false);

  // Accessibility: honour prefers-reduced-motion by not hiding content at all.
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const mc = maskColor;

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = parent.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    dimsRef.current = { w, h };
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgb(${mc[0]},${mc[1]},${mc[2]})`;
    ctx.fillRect(0, 0, w, h);

    // Reset the reveal layer to match the new size (a resize discards reveal).
    let reveal = revealRef.current;
    if (!reveal) {
      reveal = document.createElement("canvas");
      revealRef.current = reveal;
    }
    reveal.width = Math.round(w * dpr);
    reveal.height = Math.round(h * dpr);
    const rctx = reveal.getContext("2d");
    if (rctx) {
      rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rctx.globalAlpha = 1;
      rctx.globalCompositeOperation = "source-over";
      rctx.clearRect(0, 0, w, h);
    }
    liveRef.current = [];
    hasRevealRef.current = false;
    fadeStartRef.current = 0;
  }, [mc]);

  // Draws one wobbly ink patch into `ctx` at `alpha`. Used both to carve the
  // live mask (destination-out) and to bake the reveal layer (source-over).
  const carveInk = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      r: number,
      seed: number,
      alpha: number
    ) => {
      const g = ctx.createRadialGradient(
        x, y, r * gradientInnerRadius,
        x, y, r
      );
      g.addColorStop(0, `rgba(0,0,0,${gradientStops[0] * alpha})`);
      g.addColorStop(0.5, `rgba(0,0,0,${gradientStops[1] * alpha})`);
      g.addColorStop(1, `rgba(0,0,0,${gradientStops[2] * alpha})`);
      ctx.fillStyle = g;

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        const wob =
          0.78 +
          wobble[0] * Math.sin(a * 3 + seed) +
          wobble[1] * Math.sin(a * 5 + seed * 2.1) +
          wobble[2] * Math.sin(a * 7 + seed * 0.7);
        const px = x + Math.cos(a) * r * wob;
        const py = y + Math.sin(a) * r * wob;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    },
    [segments, wobble, gradientInnerRadius, gradientStops]
  );

  // Permanently record a stamp's hole onto the reveal layer at full size.
  const bakeStamp = useCallback(
    (s: Stamp) => {
      const reveal = revealRef.current;
      if (!reveal) return;
      const rctx = reveal.getContext("2d");
      if (!rctx) return;
      rctx.globalAlpha = 1;
      rctx.globalCompositeOperation = "source-over";
      carveInk(rctx, s.x, s.y, s.rmax, s.seed, 1);
      hasRevealRef.current = true;
    },
    [carveInk]
  );

  const addStamp = useCallback(
    (x: number, y: number) => {
      const live = liveRef.current;
      // Bake (never drop) the oldest stamps when the live buffer fills up.
      while (live.length >= maxStamps) {
        const oldest = live.shift();
        if (oldest) bakeStamp(oldest);
      }
      live.push({
        x,
        y,
        born: performance.now(),
        seed: Math.random() * Math.PI * 2,
        rmax: brushSize * (1 - rVary + Math.random() * rVary),
      });
      fadeStartRef.current = performance.now();
    },
    [bakeStamp, brushSize, rVary, maxStamps]
  );

  const stampAlong = useCallback(
    (x: number, y: number) => {
      const last = lastPosRef.current;
      if (!last) {
        addStamp(x, y);
      } else {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(dist / stampStep));
        for (let i = 1; i <= steps; i++) {
          addStamp(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
        }
      }
      lastPosRef.current = { x, y };
    },
    [addStamp, stampStep]
  );

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = dimsRef.current;
    const now = performance.now();
    const live = liveRef.current;

    // 1. Repaint the opaque mask.
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgb(${mc[0]},${mc[1]},${mc[2]})`;
    ctx.fillRect(0, 0, w, h);

    // 2. Punch the baked reveal through it (cheap: a single drawImage).
    const fadeStart = fadeStartRef.current;
    const t = (now - fadeStart) / lifetime;
    const fade = fadeStart === 0 || t <= 0 ? 1 : t >= 1 ? 0 : 1 - t * t;
    const reveal = revealRef.current;
    if (reveal && hasRevealRef.current && fade > 0) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = fade;
      ctx.drawImage(reveal, 0, 0, w, h);
    }

    // 3. Draw the handful of stamps that are still expanding.
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1;
    for (let i = live.length - 1; i >= 0; i--) {
      const s = live[i];
      const st = (now - s.born) / expandMs;
      if (st >= 1) {
        bakeStamp(s);
        live.splice(i, 1);
        continue;
      }
      const ease = 1 - Math.pow(1 - st, 3);
      const r = rStart + (s.rmax - rStart) * ease;
      carveInk(ctx, s.x, s.y, r, s.seed, 1);
    }
    ctx.globalAlpha = 1;

    // Once the fade completes, drop the baked layer.
    if (fade <= 0 && hasRevealRef.current && reveal) {
      const rctx = reveal.getContext("2d");
      if (rctx) {
        rctx.globalAlpha = 1;
        rctx.globalCompositeOperation = "source-over";
        rctx.clearRect(0, 0, w, h);
      }
      hasRevealRef.current = false;
    }

    if (live.length || hasRevealRef.current) {
      requestAnimationFrame(loop);
    } else {
      runningRef.current = false;
    }
  }, [carveInk, bakeStamp, mc, lifetime, expandMs, rStart]);

  const startLoop = useCallback(() => {
    if (!runningRef.current) {
      runningRef.current = true;
      requestAnimationFrame(loop);
    }
  }, [loop]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  // Re-paint the full mask when the reveal is cleared programmatically.
  useEffect(() => {
    if (cleared) {
      liveRef.current = [];
      lastPosRef.current = null;
    }
    resize();
  }, [cleared, resize]);

  const posFromClient = (
    el: HTMLElement,
    clientX: number,
    clientY: number
  ) => {
    const rect = el.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const getRelativePos = (e: React.MouseEvent<HTMLCanvasElement>) =>
    posFromClient(e.currentTarget, e.clientX, e.clientY);

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const pos = posFromClient(e.currentTarget, touch.clientX, touch.clientY);
    stampAlong(pos.x, pos.y);
    startLoop();
  };

  if (reduceMotion || cleared) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      role="presentation"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        cursor: "none",
        ...style,
      }}
      onMouseEnter={(e) => {
        const pos = getRelativePos(e);
        lastPosRef.current = pos;
        stampAlong(pos.x, pos.y);
        startLoop();
      }}
      onMouseMove={(e) => {
        const pos = getRelativePos(e);
        stampAlong(pos.x, pos.y);
        startLoop();
      }}
      onMouseLeave={() => {
        lastPosRef.current = null;
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        if (!touch) return;
        lastPosRef.current = posFromClient(
          e.currentTarget,
          touch.clientX,
          touch.clientY
        );
        handleTouch(e);
      }}
      onTouchMove={handleTouch}
      onTouchEnd={() => {
        lastPosRef.current = null;
      }}
    />
  );
}
