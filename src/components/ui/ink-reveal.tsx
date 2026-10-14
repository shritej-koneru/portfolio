"use client";
import { useEffect, useRef, useCallback } from "react";

interface InkRevealProps {
  /** RGB color of the mask overlay, e.g. [252, 250, 248] */
  maskColor?: [number, number, number];
  /** Radius of each ink stamp in px */
  brushSize?: number;
  /**
   * How long a revealed area stays uncovered before it starts fading back to
   * the mask (ms). The hold is refreshed by every new stamp, so it runs from
   * the moment the pointer stops wiping.
   */
  lifetime?: number;
  /** How long one stamp takes to grow from `rStart` to its full radius (ms). */
  expandMs?: number;
  /** How long the fade back to the mask takes once `lifetime` has elapsed (ms). */
  fadeMs?: number;
  /** Initial radius before the stamp expands */
  rStart?: number;
  /** Random variation factor for stamp radius (0–1) */
  rVary?: number;
  /** Min pixel distance between stamps along a stroke */
  stampStep?: number;
  /**
   * Max stamps still growing at once. When the buffer fills, the oldest stamp
   * is baked into the reveal layer immediately rather than dropped.
   */
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
  fadeMs = 1200,
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
  // Offscreen layer holding the holes that have finished growing. Baking them
  // means the reveal can be held for `lifetime` without redrawing thousands of
  // stamps every frame.
  const revealRef = useRef<HTMLCanvasElement | null>(null);
  const liveRef = useRef<Stamp[]>([]);
  const runningRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const dimsRef = useRef({ w: 0, h: 0 });
  /** When the most recent stamp was added — starts the `lifetime` hold. */
  const lastStampAtRef = useRef(0);
  const hasRevealRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const loopRef = useRef<() => void>(() => {});

  const mc = maskColor;

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    clearHoldTimer();
    if (!runningRef.current) {
      runningRef.current = true;
      requestAnimationFrame(loopRef.current);
    }
  }, [clearHoldTimer]);

  /** Re-enter the loop when the hold expires so the fade-back can run. */
  const armHoldWake = useCallback(
    (ms: number) => {
      clearHoldTimer();
      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = null;
        startLoop();
      }, Math.max(16, ms));
    },
    [clearHoldTimer, startLoop]
  );

  useEffect(() => clearHoldTimer, [clearHoldTimer]);

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

    // A resize discards the reveal and restarts the hold.
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
    lastStampAtRef.current = 0;
    clearHoldTimer();
  }, [mc, clearHoldTimer]);

  // Draws one wobbly ink patch into `ctx`. Used both to carve the live mask
  // (destination-out) and to bake the reveal layer (source-over).
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

  // Record a finished stamp as a permanent hole on the reveal layer.
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
      // Bake (never drop) the oldest stamps if the growing buffer fills up.
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
      lastStampAtRef.current = performance.now();
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

    // 2. Advance the growing stamps: finished ones bake into the reveal layer,
    //    the rest are carved through the mask at their current radius.
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-out";
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

    // 3. Punch the baked reveal through the mask. It holds at full strength for
    //    `lifetime` after the last stamp, then fades back out over `fadeMs`.
    const sinceStamp = now - lastStampAtRef.current;
    const u = (sinceStamp - lifetime) / fadeMs;
    const fade = u <= 0 ? 1 : u >= 1 ? 0 : 1 - u * u;
    const reveal = revealRef.current;
    if (reveal && hasRevealRef.current && fade > 0) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = fade;
      ctx.drawImage(reveal, 0, 0, w, h);
    }
    ctx.globalAlpha = 1;

    // Drop the baked layer once it has fully faded back.
    if (fade <= 0 && hasRevealRef.current && reveal) {
      const rctx = reveal.getContext("2d");
      if (rctx) {
        rctx.globalAlpha = 1;
        rctx.globalCompositeOperation = "source-over";
        rctx.clearRect(0, 0, w, h);
      }
      hasRevealRef.current = false;
    }

    // 4. Decide whether another frame is needed. While the reveal is holding,
    //    nothing on screen changes, so idle until the fade is due instead of
    //    repainting a full-screen canvas for the whole `lifetime`.
    if (live.length) {
      requestAnimationFrame(loop);
    } else if (!hasRevealRef.current) {
      runningRef.current = false;
    } else if (u <= 0) {
      runningRef.current = false;
      armHoldWake(lifetime - sinceStamp);
    } else if (fade > 0) {
      requestAnimationFrame(loop);
    } else {
      runningRef.current = false;
    }
  }, [
    carveInk,
    bakeStamp,
    armHoldWake,
    mc,
    rStart,
    expandMs,
    lifetime,
    fadeMs,
  ]);

  loopRef.current = loop;

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  // Drop any in-flight brush trail when the mask is cleared programmatically.
  useEffect(() => {
    if (cleared) {
      liveRef.current = [];
      lastPosRef.current = null;
      runningRef.current = false;
      lastStampAtRef.current = 0;
      clearHoldTimer();
    }
  }, [cleared, clearHoldTimer]);

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

  // `cleared` is the deliberate "move to uncover" skip; the brush motion itself
  // is the source component's own and is not gated on reduced-motion.
  if (cleared) return null;

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
