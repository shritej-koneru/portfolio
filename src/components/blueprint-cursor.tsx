import * as React from "react";
import gsap from "gsap";

import {
  cursorPaths,
  HOVER_SHAPES,
  LOCK,
  nearestQuarter,
  type HoverState,
  type Shape,
} from "@/lib/cursor-geometry";

/**
 * The orbital cursor.
 *
 * One small instrument that stands in for the mouse pointer across the whole
 * site: a lime dot exactly under the pointer, a thin blueprint ring that trails
 * it on a short leash, and — when the button goes down — four brackets that the
 * ring turns into by degrees rather than being replaced by them (the shape is
 * one path per quarter, see `@/lib/cursor-geometry`).
 *
 * ## What it is not
 *
 * It is drawn on top of the page and it is `pointer-events: none`, so every
 * link, button, canvas, drag and fragment jump underneath it behaves exactly as
 * it did before. The native cursor is hidden, and it is hidden *late*: the
 * attribute that hides it is only set once the ring is on screen following a
 * real pointer position, so a device without a mouse never loses it and there is
 * no frame where the page has no cursor at all.
 *
 * ## Frames
 *
 * React renders this component once and then never again. Pointer tracking is a
 * `pointermove` listener that writes one transform, the ring's leash is a single
 * `requestAnimationFrame` that runs until the ring has caught up and then stops,
 * and everything else — the ring's slow turn, the way a state change is drawn,
 * the press — is a GSAP tween on a plain object whose every frame is written
 * straight to the DOM by `render`. No pointer movement reaches React.
 *
 * ## Reduced motion
 *
 * The ring does not turn, the dot does not pulse, and states are changed in a
 * frame rather than over a quarter of a second. The ring also stops trailing the
 * pointer and rides on it exactly, because the leash is motion too.
 */

/** A mouse, and only a mouse. A finger or a stylus keeps the native cursor. */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Set on `<html>` while the custom cursor is up; the stylesheet it pairs with is
 * in `src/index.css`.
 */
const NATIVE_CURSOR = "data-orbital-cursor";

/** The dot's diameter, in px. */
const DOT = 5;

/** Half the SVG's viewBox. The shape is drawn well inside it. */
const BOX = 40;

/** A full turn of the ring, in seconds. Four quarter turns of sixteen. */
const SPIN_SECONDS = 16;

/** How much of the gap to the pointer the ring closes per 60fps frame. */
const FOLLOW = 0.28;

/** The fade on the way in, in seconds. On the way out it is instant. */
const FADE = 0.18;

/** A project card, or anything that says it wants brackets. */
const FRAME_SELECTOR = '[data-cursor="frame"]';

/** A surface that can be dragged. */
const GRAB_SELECTOR = '[data-cursor="grab"]';

/** The cursor values that mean "drag me", whichever of the two places says so. */
const DRAG_CURSORS = new Set(["grab", "grabbing"]);

/** Anything that responds to being pointed at. */
const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "[role='button']",
  "[role='menuitem']",
  "[role='option']",
  "[role='tab']",
  "[tabindex]:not([tabindex='-1'])",
  "input",
  "textarea",
  "select",
  "summary",
  "label[for]",
].join(",");

/** The geometry GSAP moves through. `angle` is the ring's own turn. */
interface Motion extends Shape {
  angle: number;
}

/** A cursor an element asks for itself, from its inline style or its classes. */
function declaredAt(element: Element): string {
  const inline = (element as HTMLElement | SVGElement).style?.cursor;
  if (inline && inline !== "none") return inline;

  // `cursor-grab`, and the written-out variants of it: `active:cursor-grabbing`.
  for (const name of element.classList) {
    const value = name.slice(name.lastIndexOf("cursor-") + "cursor-".length);
    if (name.includes("cursor-") && DRAG_CURSORS.has(value)) return value;
  }

  return "";
}

/**
 * What the pointer is over, from the nearest thing that claims it.
 *
 * The walk runs outward from whatever is under the pointer and stops at the
 * first element with an opinion, which is what keeps the claims in proportion: a
 * link inside a project card is a link, a card inside a wheel is a card, and a
 * draggable canvas that happens to be focusable is something to drag rather than
 * something merely to click. The order of the claims at each level is the order
 * of their confidence — what the element says outright, then what it has already
 * declared in its own stylesheet, then what its markup implies.
 */
function classify(target: EventTarget | null): HoverState {
  if (!(target instanceof Element)) return "idle";

  let element: Element | null = target;
  for (let depth = 0; element && depth < 8; depth += 1) {
    if (element.matches(`${FRAME_SELECTOR}, ${GRAB_SELECTOR}`)) {
      return element.matches(FRAME_SELECTOR) ? "frame" : "grab";
    }

    const declared = declaredAt(element);
    if (DRAG_CURSORS.has(declared)) return "grab";
    if (element.matches(INTERACTIVE_SELECTOR)) return "hover";
    if (declared === "pointer") return "hover";

    element = element.parentElement;
  }

  return "idle";
}

export function BlueprintCursor() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const dotRef = React.useRef<HTMLDivElement>(null);
  const markRef = React.useRef<HTMLSpanElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);
  const groupRef = React.useRef<SVGGElement>(null);
  const pathsRef = React.useRef<Array<SVGPathElement | null>>([]);

  const shapeRef = React.useRef<Motion>({ ...HOVER_SHAPES.idle, angle: 0 });
  const spinRef = React.useRef<gsap.core.Tween | null>(null);
  const reducedRef = React.useRef(false);

  /** Whether this machine has a mouse at all. A tablet can gain or lose one. */
  const [fine, setFine] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia(FINE_POINTER);
    const sync = () => setFine(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Held in a ref rather than state so the animations below can read it without
  // being rebuilt whenever the setting changes under them.
  React.useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION);
    const sync = () => {
      reducedRef.current = query.matches;
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /**
   * Draws the geometry: the four paths, the ring's turn, the stroke. Called once
   * per animation frame by whichever tween is running, and never by React.
   */
  const render = React.useCallback(() => {
    const shape = shapeRef.current;
    const paths = cursorPaths(shape.size, shape.lock);
    for (let i = 0; i < paths.length; i += 1) {
      pathsRef.current[i]?.setAttribute("d", paths[i]);
    }
    groupRef.current?.setAttribute(
      "transform",
      `rotate(${shape.angle.toFixed(2)})`,
    );
    groupRef.current?.setAttribute("stroke-width", shape.weight.toFixed(2));
  }, []);

  /**
   * The ring turns on its own, one full turn every sixteen seconds.
   *
   * The tween runs 0 → 360 and repeats, so each repeat jumps a whole turn — and
   * four-fold, a whole turn is no jump at all. That is also what lets the ring be
   * restarted from zero at any time, which is what happens whenever a state
   * change takes the ring over: every quarter turn looks exactly like the last.
   */
  const spin = React.useCallback(() => {
    const shape = shapeRef.current;
    spinRef.current?.kill();
    spinRef.current = null;

    if (reducedRef.current) {
      shape.angle = 0;
      render();
      return;
    }

    spinRef.current = gsap.fromTo(
      shape,
      { angle: 0 },
      {
        angle: 360,
        duration: SPIN_SECONDS,
        ease: "none",
        repeat: -1,
        onUpdate: render,
      },
    );
  }, [render]);

  /**
   * Moves to one of the resting shapes.
   *
   * Both the spin and any press still in flight are killed first: there is only
   * ever one tween writing geometry, so nothing can fight over it.
   */
  const paint = React.useCallback(
    (next: HoverState) => {
      const shape = shapeRef.current;
      const target = HOVER_SHAPES[next];
      const duration = reducedRef.current ? 0.01 : 0.24;

      spinRef.current?.kill();
      spinRef.current = null;
      gsap.killTweensOf(shape);
      if (markRef.current) gsap.killTweensOf(markRef.current);

      gsap.to(shape, {
        size: target.size,
        lock: target.lock,
        weight: target.weight,
        duration,
        ease: "power2.out",
        onUpdate: render,
      });

      if (markRef.current) {
        gsap.to(markRef.current, {
          scale: target.dot,
          duration,
          ease: "power2.out",
        });
      }

      if (next === "frame") {
        // Brackets have to sit square to the page, so the ring stops turning and
        // takes the shortest way to the nearest quarter turn on its way in.
        gsap.to(shape, {
          angle: nearestQuarter(shape.angle),
          duration: duration * 1.4,
          ease: "power2.out",
          onUpdate: render,
        });
      } else {
        spin();
      }

      rootRef.current?.setAttribute("data-cursor-state", next);
    },
    [render, spin],
  );

  /**
   * The press, in three moves over about four tenths of a second: the ring
   * contracts as it becomes brackets and squares up, the brackets push back out
   * as if locked onto the target, and settle. The dot pulses on the first move
   * and is down to its bracket size by the third, so the pulse is spent before
   * the hold. Nothing here overshoots.
   */
  const lock = React.useCallback(() => {
    const shape = shapeRef.current;
    const step = (seconds: number) => (reducedRef.current ? 0.01 : seconds);

    spinRef.current?.kill();
    spinRef.current = null;
    gsap.killTweensOf(shape);
    if (markRef.current) gsap.killTweensOf(markRef.current);

    gsap
      .timeline()
      .to(shape, {
        size: LOCK.size * LOCK.contract,
        lock: 1,
        weight: LOCK.weight,
        angle: nearestQuarter(shape.angle),
        duration: step(0.13),
        ease: "power3.out",
        onUpdate: render,
      })
      .to(shape, {
        size: LOCK.size * LOCK.expand,
        duration: step(0.17),
        ease: "power2.out",
        onUpdate: render,
      })
      .to(shape, {
        size: LOCK.size,
        duration: step(0.14),
        ease: "power1.inOut",
        onUpdate: render,
      });

    if (markRef.current) {
      gsap
        .timeline()
        .to(markRef.current, {
          scale: LOCK.dot,
          duration: step(0.12),
          ease: "power3.out",
        })
        .to(markRef.current, {
          scale: HOVER_SHAPES.frame.dot,
          duration: step(0.32),
          ease: "power2.out",
        });
    }

    rootRef.current?.setAttribute("data-cursor-state", "lock");
  }, [render]);

  // Everything the cursor does to the page. Nothing below touches React state:
  // the listeners write transforms, the tweens write paths.
  React.useEffect(() => {
    if (!fine) return;

    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!root || !dot || !ring) return;

    /** Where the pointer is, and where the ring has caught up to. */
    const pointer = { x: 0, y: 0 };
    const follow = { x: 0, y: 0 };
    let frame = 0;
    let last = 0;
    let visible = false;
    let pressed = false;
    /** What the pointer is over — what the shape goes back to on release. */
    let over: HoverState = "idle";

    const draw = (node: HTMLElement, x: number, y: number) => {
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    /** Puts the ring straight on the pointer, for the cases with no leash. */
    const catchUp = () => {
      follow.x = pointer.x;
      follow.y = pointer.y;
      draw(ring, follow.x, follow.y);
    };

    /**
     * The leash. One frame at a time, until the ring has arrived — then the loop
     * stops and the page has no animation frame of its own left running.
     */
    const chase = (now: number) => {
      frame = 0;
      const elapsed = last ? Math.min(64, now - last) : 16.7;
      last = now;

      const closing = 1 - Math.pow(1 - FOLLOW, elapsed / 16.667);
      follow.x += (pointer.x - follow.x) * closing;
      follow.y += (pointer.y - follow.y) * closing;

      if (
        Math.abs(pointer.x - follow.x) < 0.05 &&
        Math.abs(pointer.y - follow.y) < 0.05
      ) {
        catchUp();
        return;
      }

      draw(ring, follow.x, follow.y);
      frame = requestAnimationFrame(chase);
    };

    // The native cursor is hidden here and not a moment sooner: this is the
    // first time there is a position to draw the replacement at, so the page
    // never spends a frame with no cursor in it at all.
    const appear = () => {
      if (visible) return;
      visible = true;
      catchUp();
      document.documentElement.setAttribute(NATIVE_CURSOR, "");
      gsap.to(root, {
        autoAlpha: 1,
        duration: reducedRef.current ? 0 : FADE,
        overwrite: true,
      });
    };

    /** Out of the window, or the window out of focus — the native one comes back. */
    const vanish = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      if (!visible) return;
      visible = false;
      document.documentElement.removeAttribute(NATIVE_CURSOR);
      gsap.to(root, { autoAlpha: 0, duration: 0, overwrite: true });
    };

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      // The dot is written here and not on the animation frame: it has to be
      // exactly under the cursor, with no leash of its own.
      draw(dot, pointer.x, pointer.y);
      appear();

      if (reducedRef.current) {
        catchUp();
        return;
      }
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(chase);
      }
    };

    const onOver = (event: PointerEvent) => {
      const next = classify(event.target);
      if (next === over) return;
      over = next;
      if (!pressed) paint(next);
    };

    const onDown = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      draw(dot, pointer.x, pointer.y);
      appear();

      if (pressed) return;
      pressed = true;
      lock();
    };

    const onUp = () => {
      if (!pressed) return;
      pressed = false;
      // Back to whatever the pointer is over now, not what it was over when the
      // button went down.
      paint(over);
    };

    // `relatedTarget` is only ever null on the way out of the window.
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      pressed = false;
      vanish();
    };

    const onBlur = () => {
      pressed = false;
      vanish();
    };

    const onVisibility = () => {
      if (document.visibilityState !== "hidden") return;
      pressed = false;
      vanish();
    };

    render();
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);

      if (frame) cancelAnimationFrame(frame);
      spinRef.current?.kill();
      spinRef.current = null;
      gsap.killTweensOf(shapeRef.current);
      if (markRef.current) gsap.killTweensOf(markRef.current);
      gsap.killTweensOf(root);

      // Whatever happens, the native cursor comes back with the component.
      document.documentElement.removeAttribute(NATIVE_CURSOR);
      gsap.to(root, { autoAlpha: 0, duration: 0, overwrite: true });
    };
  }, [fine, lock, paint, render]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-cursor-state="idle"
      className="pointer-events-none invisible fixed top-0 left-0 z-[60] opacity-0"
    >
      {/* The pointer itself. */}
      <div
        ref={dotRef}
        className="absolute top-0 left-0 h-0 w-0 will-change-transform"
      >
        <span
          ref={markRef}
          style={{
            left: -DOT / 2,
            top: -DOT / 2,
            width: DOT,
            height: DOT,
          }}
          className="absolute rounded-full bg-signal shadow-[0_0_0_1px_rgba(17,19,24,0.35)]"
        />
      </div>

      {/* The ring, and the four strokes it turns into. */}
      <div
        ref={ringRef}
        className="absolute top-0 left-0 h-0 w-0 will-change-transform"
      >
        <svg
          aria-hidden="true"
          viewBox={`${-BOX} ${-BOX} ${BOX * 2} ${BOX * 2}`}
          style={{ left: -BOX, top: -BOX, width: BOX * 2, height: BOX * 2 }}
          className="absolute overflow-visible text-blueprint"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g ref={groupRef}>
            {[0, 1, 2, 3].map((quarter) => (
              <path
                key={quarter}
                ref={(node) => {
                  pathsRef.current[quarter] = node;
                }}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
