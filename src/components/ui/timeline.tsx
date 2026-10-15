import * as React from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { revealClass, useInView } from "@/components/case-study/use-in-view";
import { cn } from "@/lib/utils";

/**
 * An interactive journey timeline, adapted from the 21st.dev / Hyperiux
 * "Timeline" component (@hyperiux) for this portfolio.
 *
 * What was kept from the source:
 *
 * - the architecture — a tall section with an inner `position: sticky` band, so
 *   the pin is CSS and GSAP only ever *scrubs* the animation. Nothing is
 *   inserted into the document, so the About anchor and page scroll stay honest;
 * - the drawn rule: a hairline that grows left-to-right behind the milestones;
 * - per-milestone stems that scale out of the rule, markers that pop, and copy
 *   that slides up out of per-line masks (`SplitText`);
 * - one `gsap.context`, reverted on unmount, so React 18 StrictMode's double
 *   effect pass leaves nothing behind;
 * - motion that is never a loop — every tween is scrubbed by scroll position.
 *
 * What changed, and why:
 *
 * - **It is data-driven.** The source hardcodes two arrays and a seven-entry
 *   `positions` table. Here the milestones arrive as props and every geometric
 *   value — track width, slide distance, when each milestone reveals — is
 *   derived from `items.length`. Adding a milestone does not need a code change.
 * - **Content is separate from presentation.** This file knows nothing about
 *   education or projects; it renders anything shaped like `TimelineMilestone`.
 * - **Two layouts, chosen by the environment.** The pinned horizontal track is
 *   desktop-only. On small screens, and under `prefers-reduced-motion`, the same
 *   items render as a compact vertical timeline with no pin, no horizontal
 *   movement, and no GSAP at all. That is also the fallback if the motion layer
 *   cannot be built, so the content is never trapped in an un-run animation.
 */

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/** Where the timeline is allowed to become the pinned, scroll-driven version. */
const PINNED_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/* ------------------------------------------------------------------ */
/* Track geometry — all in viewport-width units, all derived from data  */
/* ------------------------------------------------------------------ */

/** The plate at the head of the track. */
const HEAD_W = 30;
/** One milestone's column width. */
const ITEM_W = 34;
/** Space between two milestones sitting on the same side of the rule. */
const ITEM_GAP = 6;
/**
 * Milestones alternate above and below the rule, so consecutive ones are half a
 * column apart — that is what makes them interleave rather than stack.
 */
const ITEM_STEP = (ITEM_W + ITEM_GAP) / 2;
/** Fraction of the scrubbed timeline one milestone spends revealing. */
const REVEAL = 0.1;

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value));

/** Total track width for `count` milestones, in `vw`. */
const trackWidth = (count: number) =>
  HEAD_W + Math.max(count - 1, 0) * ITEM_STEP + ITEM_W;

/* ------------------------------------------------------------------ */
/* Media queries                                                       */
/* ------------------------------------------------------------------ */

function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return React.useSyncExternalStore(
    subscribe,
    () => (window.matchMedia ? window.matchMedia(query).matches : false),
    () => false,
  );
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

export interface TimelineMilestone {
  id: string;
  /** The period as the reader sees it, e.g. `2024 – 2028`. */
  period: string;
  title: string;
  organisation?: string;
  description: string;
  /** Shown as a small technical annotation, e.g. `CGPA 8.64`. */
  note?: string;
  /** Only set when the link genuinely exists. */
  href?: string;
  linkLabel?: string;
}

export interface TimelineProps {
  items: TimelineMilestone[];
  /** Technical label for the plate, e.g. `FIG. 05.1 — THE JOURNEY`. */
  label?: string;
  /** What the whole track spans, e.g. `2012 → Present`. */
  periodLabel?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* One milestone's copy — shared by both layouts                       */
/* ------------------------------------------------------------------ */

/**
 * `variant` only changes the type scale: the pinned track is measured in
 * viewport widths so its scale holds as the track slides, while the stacked list
 * is ordinary responsive type. Everything else — the order of period, title,
 * organisation, description and annotation — is identical in both.
 *
 * Colour follows the scene's rule: technical blue is the line work (the rule,
 * the dots, the stems, the eyebrow above the section), and everything the reader
 * actually has to read is ink, which keeps it well clear of the contrast floor
 * that 11px blue on paper sits at.
 */
function MilestoneText({
  item,
  variant,
}: {
  item: TimelineMilestone;
  variant: "track" | "list";
}) {
  const track = variant === "track";
  return (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/70">
        {item.period}
      </p>

      <h3
        data-title={item.id}
        className={cn(
          "mt-2 font-display leading-tight text-ink",
          // `clamp` keeps the name legible at the narrow end of the pinned
          // breakpoint, where a pure vw size would fall to single digits.
          track
            ? "text-[clamp(1rem,1.45vw,1.9rem)]"
            : "text-lg sm:text-xl",
        )}
      >
        {item.title}
      </h3>

      {item.organisation ? (
        <p
          className={cn(
            "mt-1.5 font-mono uppercase leading-relaxed tracking-[0.14em] text-ink/65",
            track ? "text-[10px]" : "text-[11px]",
          )}
        >
          {item.organisation}
        </p>
      ) : null}

      <p
        data-description={item.id}
        className={cn(
          "mt-2 leading-relaxed text-ink/70",
          track ? "text-[13px]" : "text-sm sm:text-base",
        )}
      >
        {item.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {item.note ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/65">
            {item.note}
          </span>
        ) : null}
        {item.href ? (
          <a
            href={item.href}
            className="inline-flex min-h-[32px] items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/75 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-blueprint hover:decoration-blueprint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {item.linkLabel ?? "Open"}
            <span aria-hidden="true">→</span>
          </a>
        ) : null}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Layout B — the compact vertical timeline                            */
/* ------------------------------------------------------------------ */

/**
 * What small screens and reduced-motion readers get: the whole journey as a
 * plain vertical list. No pin, no sideways movement, no grid decoration, and no
 * GSAP — the one reveal is the same IntersectionObserver + CSS transition the
 * project pages already use, and it stands down entirely under reduced motion.
 */
function VerticalTimeline({ items }: { items: TimelineMilestone[] }) {
  const { ref, inView } = useInView<HTMLOListElement>({ threshold: 0.05 });

  return (
    <ol
      ref={ref}
      className="relative mt-10 ml-1 max-w-3xl border-l border-blueprint/35 pl-7"
    >
      {items.map((item, index) => {
        const reveal = revealClass(inView, index * 45, "relative pb-9 last:pb-0");
        return (
          <li key={item.id} className={reveal.className} style={reveal.style}>
            <span
              aria-hidden="true"
              className="absolute -left-8 top-1.5 size-2 rounded-full bg-blueprint ring-4 ring-background"
            />
            <MilestoneText item={item} variant="list" />
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Layout A — the pinned horizontal track                              */
/* ------------------------------------------------------------------ */

function PinnedTimeline({
  items,
  label,
  periodLabel,
  imageSrc,
  imageAlt,
  imageCaption,
  onMotionFailed,
}: TimelineProps & { onMotionFailed: () => void }) {
  const pinRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const lineRef = React.useRef<HTMLDivElement>(null);
  const splitsRef = React.useRef<SplitText[]>([]);

  const width = trackWidth(items.length);
  const slideVw = Math.max(width - 100, 0);
  // `xPercent` is relative to the track's own width, so the distance in vw has
  // to be expressed as a share of the track.
  const slidePercent = width > 0 ? -(slideVw / width) * 100 : 0;

  /**
   * When milestone `index` reveals, as progress through the section: the point
   * at which it has just slid fully into view. The first couple are already on
   * screen when the pin begins, so they get a minimum stagger instead of firing
   * together.
   */
  const revealAt = React.useCallback(
    (index: number) => {
      const trackX = HEAD_W + index * ITEM_STEP;
      const enter =
        slideVw > 0 ? clamp((trackX - (100 - ITEM_W)) / slideVw, 0, 1) : 1;
      return clamp(
        0.05 + Math.max(enter, (index + 1) * 0.05) * 0.88,
        0,
        0.93,
      );
    },
    [slideVw],
  );

  React.useLayoutEffect(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    const line = lineRef.current;
    if (!pin || !track || !line || items.length === 0) return;

    const splits = splitsRef.current;
    let context: gsap.Context | null = null;

    try {
      context = gsap.context(() => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
          defaults: { ease: "none" },
        });

        // The track slides, and the rule draws across it, for the whole section.
        // Both are `fromTo`: a plain `to` would let a mid-scroll refresh inside
        // `invalidateOnRefresh` bake whatever the transform happened to be at
        // that moment in as the new start value, which drifts the whole track.
        timeline.fromTo(
          track,
          { xPercent: 0 },
          { xPercent: slidePercent, duration: 1 },
          0,
        );
        timeline.fromTo(
          line,
          { width: "0%" },
          { width: "100%", duration: 1 },
          0,
        );

        items.forEach((item, index) => {
          const at = revealAt(index);
          const stem = pin.querySelector(`[data-stem="${item.id}"]`);
          const dot = pin.querySelector(`[data-dot="${item.id}"]`);
          const copy = pin.querySelector(`[data-copy="${item.id}"]`);
          const title = pin.querySelector(`[data-title="${item.id}"]`);
          const description = pin.querySelector(
            `[data-description="${item.id}"]`,
          );

          // The copy block is hidden by class until the motion layer is up, so
          // a milestone is never painted in a state the animation has to fix.
          if (copy) gsap.set(copy, { opacity: 1 });

          if (stem) {
            timeline.fromTo(
              stem,
              { scaleY: 0 },
              { scaleY: 1, duration: REVEAL * 0.5 },
              at,
            );
          }
          if (dot) {
            timeline.fromTo(
              dot,
              { scale: 0 },
              { scale: 1, duration: REVEAL * 0.5 },
              at,
            );
          }

          [title, description].forEach((element) => {
            if (!element) return;
            const split = new SplitText(element, {
              type: "lines",
              mask: "lines",
            });
            splits.push(split);
            timeline.fromTo(
              split.lines,
              { yPercent: 110 },
              { yPercent: 0, duration: REVEAL, stagger: 0.02 },
              at + REVEAL * 0.35,
            );
          });
        });
      }, pin);
    } catch {
      // If the motion layer cannot be built, the content must not stay hidden.
      splits.splice(0).forEach((split) => {
        try {
          split.revert();
        } catch {
          /* already reverted */
        }
      });
      context?.revert();
      onMotionFailed();
      return;
    }

    /**
     * The section above this one grows when its contribution data lands, which
     * moves everything below it — so the trigger positions are re-measured
     * whenever the page height actually changes, not just on resize.
     */
    let frame = 0;
    const refresh = () => {
      frame = 0;
      ScrollTrigger.refresh();
    };
    const scheduleRefresh = () => {
      if (!frame) frame = requestAnimationFrame(refresh);
    };

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleRefresh);
    observer?.observe(document.body);
    window.addEventListener("load", scheduleRefresh);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("load", scheduleRefresh);
      splits.splice(0).forEach((split) => {
        try {
          split.revert();
        } catch {
          /* already reverted */
        }
      });
      context?.revert();
    };
  }, [items, revealAt, slidePercent, onMotionFailed]);

  return (
    <div
      ref={pinRef}
      className="relative mt-12"
      // One screen plus a fixed distance per milestone, so the pin gets longer
      // as milestones are added and is never hardcoded to a count.
      style={{ height: `calc(110vh + ${items.length * 14}vh)` }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Engineering grid — the same 48px module as Scenes 02 and 04 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(17,19,24,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,19,24,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Technical annotations */}
        {/*
          These are `ink` at 65%, not `blueprint`: measured on the paper plate,
          the blueprint blue is 3.52:1 and would fail AA at this size. Ink at
          65% is 5.5:1 and stays in the same quiet register.
        */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-baseline justify-between gap-6 px-6 py-5 font-mono text-[10px] uppercase tracking-[0.3em] text-ink/65">
          <span>{label}</span>
          <span>{periodLabel}</span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-baseline justify-between gap-6 px-6 py-5 font-mono text-[10px] uppercase tracking-[0.3em] text-ink/65">
          <span>
            {items.length} milestones · scale 1:1
          </span>
          <span>Scroll to follow the line</span>
        </div>

        {/*
          The track. Everything inside it slides as one, so the rule stays
          aligned with the milestones it belongs to.
        */}
        <div
          ref={trackRef}
          className="absolute inset-y-0 left-0"
          style={{ width: `${width}vw`, willChange: "transform" }}
        >
          {/* The rule, drawn left-to-right as the section is scrubbed */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 -translate-y-1/2"
          >
            <div ref={lineRef} className="h-px w-0 bg-blueprint/45" />
          </div>

          {/* Head of the track */}
          {imageSrc ? (
            <figure className="absolute left-0 top-1/2 w-[24vw] -translate-y-1/2">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-lg border border-ink/12 bg-card">
                <img
                  src={imageSrc}
                  alt={imageAlt ?? ""}
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </div>
              {imageCaption ? (
                <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-ink/65">
                  {imageCaption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          {/*
            A real list, so the order survives for anything reading the page
            rather than looking at it — the milestones are absolutely placed and
            alternate above and below the rule, but the DOM order is the
            chronological order.
          */}
          <ol
            aria-label="Timeline of education, roles and learning milestones"
            className="absolute inset-0 list-none p-0"
          >
            {items.map((item, index) => {
              const above = index % 2 === 0;
              return (
                <li
                  key={item.id}
                  className="absolute inset-y-0"
                  style={{
                    left: `${HEAD_W + index * ITEM_STEP}vw`,
                    width: `${ITEM_W}vw`,
                  }}
                >
                  {/* Marker, sitting on the rule */}
                  <span
                    data-dot={item.id}
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 z-20 size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blueprint ring-4 ring-background"
                  />

                  {/* Stem, growing out of the rule towards the copy */}
                  <span
                    data-stem={item.id}
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 w-px bg-blueprint/40",
                      above ? "bottom-1/2 h-[6vh]" : "top-1/2 h-[6vh]",
                    )}
                    style={{
                      transformOrigin: above ? "bottom bottom" : "top top",
                    }}
                  />

                  {/*
                    Copy. Held at `opacity-0` until the motion layer sets it to
                    1, which happens before the first paint — the class is a
                    guard, not something the reader ever sees.
                  */}
                  <div
                    data-copy={item.id}
                    className={cn(
                      "absolute left-0 w-full opacity-0",
                      above ? "bottom-1/2 pb-[8vh]" : "top-1/2 pt-[8vh]",
                    )}
                  >
                    <MilestoneText item={item} variant="track" />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The exportable component                                            */
/* ------------------------------------------------------------------ */

export function Timeline(props: TimelineProps) {
  const { items, className } = props;
  const wide = useMediaQuery(PINNED_QUERY);
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY);
  const [motionFailed, setMotionFailed] = React.useState(false);

  const onMotionFailed = React.useCallback(() => setMotionFailed(true), []);

  if (items.length === 0) {
    return (
      <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.28em] text-ink/65">
        No milestones yet.
      </p>
    );
  }

  // Small screens and reduced-motion readers get the compact vertical list —
  // and so does anyone whose motion layer could not be built.
  if (!wide || reduced || motionFailed) {
    return (
      <div className={className}>
        <VerticalTimeline items={items} />
      </div>
    );
  }

  return (
    <div className={className}>
      <PinnedTimeline {...props} onMotionFailed={onMotionFailed} />
    </div>
  );
}

export default Timeline;
