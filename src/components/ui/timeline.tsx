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
 * - **Two layouts, chosen by the environment.** The pinned horizontal track runs
 *   everywhere: a phone gets the same animation at a narrower geometry, not a
 *   long static list. It gives way to a compact vertical timeline — no pin, no
 *   horizontal movement, no GSAP at all — under `prefers-reduced-motion`, on a
 *   viewport too short to hold one copy block, and if the motion layer cannot be
 *   built. So the content is never trapped in an un-run animation.
 */

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/** Which of the two geometries the pinned track is drawn with. */
const WIDE_QUERY = "(min-width: 1024px)";
/**
 * Below this the pinned track is not used at all, whatever the width. A copy
 * block alternates above and below the rule, so the taller copy has to fit in
 * just under half the band; on a short viewport — a phone on its side, a squat
 * browser window — it would be cut off. Those readers get the vertical list,
 * which cannot clip, instead of a horizontal one that eats its own content.
 */
const TALL_QUERY = "(min-height: 640px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/* ------------------------------------------------------------------ */
/* Track geometry — viewport units, derived from the data               */
/* ------------------------------------------------------------------ */

/**
 * One column width cannot serve both a 1440px desktop and a 390px phone: the
 * column has to be about a third of the viewport when four or five milestones
 * are in view together, and about four fifths when only one is. So there are two
 * geometry sets, and everything downstream — track width, slide distance, reveal
 * times, pin length — is derived from whichever is in play. The animation itself
 * is the same code on both, and nothing here knows how many milestones there are.
 */
interface TrackGeometry {
  /** Width of the plate at the head of the track, in `vw`. */
  head: number;
  /** One milestone's column, in `vw`. */
  item: number;
  /** Air between two milestones on the same side of the rule, in `vw`. */
  gap: number;
  /**
   * Scroll distance per milestone, in `vh` — how fast the track slides. Both
   * sets are tuned so the track travels about 1.65px sideways per 1px of scroll.
   */
  pinPerItem: number;
  /** Distance the copy is held off the rule, in `vh`. */
  copyGapVh: number;
  /** Length of the stem pointing from the rule at the copy, in `vh`. */
  stemVh: number;
  /**
   * Longest line the copy may run. Without it a tablet gets a 630px measure of
   * 14px text: the column stays wide so the movement still reads, the text
   * does not.
   */
  copyMax?: string;
  /**
   * How far the track travels while a copy's lines pop — first line to last — in
   * `vw`. It has to stay inside `100 - item`, the stretch in which the copy is
   * wholly on screen. A phone copy is four fifths of the viewport, so its whole
   * uncut walk is only 18vw: a pop longer than that is still rising as its
   * leading edge slides out of view, which is the one thing a reveal must not do.
   * It is a distance rather than a share of the timeline so a pop always takes the
   * same amount of scrolling, whatever the milestone count.
   */
  revealTravel: number;
}

const WIDE: TrackGeometry = {
  head: 30,
  item: 34,
  gap: 6,
  pinPerItem: 14,
  copyGapVh: 8,
  stemVh: 6,
  revealTravel: 33,
};
const NARROW: TrackGeometry = {
  head: 52,
  item: 82,
  gap: 12,
  pinPerItem: 12,
  copyGapVh: 5,
  stemVh: 4,
  copyMax: "26rem",
  revealTravel: 15,
};

/**
 * Milestones alternate above and below the rule, so consecutive ones are half a
 * column apart — that is what makes them interleave rather than stack. Two
 * milestones on the same side are a whole step apart, which is the measure that
 * has to stay clear of the copy: `2 * step` is `item + gap` at every size, which
 * is why this alternation is not a style choice but the thing the geometry is
 * built on. Both sets alternate.
 */
const step = (geometry: TrackGeometry) => (geometry.item + geometry.gap) / 2;

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value));

/** Total track width for `count` milestones, in `vw`. */
const trackWidth = (count: number, geometry: TrackGeometry) =>
  geometry.head + Math.max(count - 1, 0) * step(geometry) + geometry.item;

/**
 * Latest a pop may start, as progress through the section. A copy's lines finish
 * rising shortly after they start, and at the far end of the track the copy never
 * reaches the left of the screen, so this is what keeps the last pop's tail inside
 * the section.
 */
const LAST_POP = 0.93;

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
 * Colour follows the scene's rule: technical blue is the *draft* line work (the
 * horizontal rule, the stems, the eyebrow above the section), the markers are
 * solid ink so each milestone reads as the anchor point it is, and everything the
 * reader actually has to read is ink — which keeps the copy well clear of the
 * contrast floor that 11px blue on paper sits at.
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
          // `clamp` keeps the name legible at both ends of the pinned track: a
          // pure vw size collapses to single digits on a phone, and the floor is
          // set for the phone rather than for the narrowest desktop window.
          track
            ? "text-[clamp(1.125rem,1.45vw,1.9rem)]"
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
          // The pinned column is a third of the viewport on desktop and four
          // fifths of it on a phone, so the same px would be a dense measure on
          // one and a cramped one on the other.
          track ? "text-[14px] lg:text-[13px]" : "text-sm sm:text-base",
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
 * The fallback layout: the whole journey as a plain vertical list, for
 * reduced-motion readers, a viewport too short to pin, and anyone whose motion
 * layer could not be built. No pin, no sideways movement, no grid decoration, and
 * no GSAP — the one reveal is the same IntersectionObserver + CSS transition the
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
              className="absolute -left-8 top-1.5 size-2 rounded-full bg-ink ring-4 ring-background"
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
  wide,
  onMotionFailed,
}: TimelineProps & { wide: boolean; onMotionFailed: () => void }) {
  const pinRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const lineRef = React.useRef<HTMLDivElement>(null);
  const splitsRef = React.useRef<SplitText[]>([]);

  const geometry = wide ? WIDE : NARROW;
  const {
    head,
    item: itemW,
    copyMax,
    pinPerItem,
    copyGapVh,
    stemVh,
    revealTravel,
  } = geometry;
  const stepVw = step(geometry);

  const width = trackWidth(items.length, geometry);
  const slideVw = Math.max(width - 100, 0);
  // `xPercent` is relative to the track's own width, so the distance in vw has
  // to be expressed as a share of the track.
  const slidePercent = width > 0 ? -(slideVw / width) * 100 : 0;

  /**
   * The pop, as shares of the scrubbed timeline: the scrolling in which the track
   * travels `revealTravel`. Split into the lead-in (in which the stem and the dot
   * go up), the base rise of a line, and the stagger between lines. The three
   * shares sum to about one copy's worth of travel, so `revealTravel` stays the
   * measure of how far a pop actually runs, and it is bounded so that an unusual
   * milestone count cannot make one either instant or glacial.
   */
  const pop = slideVw > 0 ? clamp(revealTravel / slideVw, 0.02, 0.25) : 0.2;
  const lead = pop * 0.2;
  const rise = pop * 0.6;
  const stagger = pop * 0.08;

  /**
   * When milestone `index` pops, as progress through the section: the point at
   * which its copy has just fully arrived, with `100 - item` of it on screen. That
   * is the moment the pop can run with the whole block in view, and on a narrow
   * screen it is also the moment the block straddles the middle of the screen —
   * the copy sits centred either side of the pop. A milestone already past that
   * point when the pin begins, and the first few behind it, get a minimum stagger
   * instead of firing together.
   *
   * One end is then pinned down: a pop must finish before its copy's leading edge
   * reaches the left of the screen, or the last of its lines rise while the block
   * is already on its way out — which is the one thing a reveal must not do. The
   * earliest milestones are the ones that need this, having been on screen since
   * before the pin began. `LAST_POP` is the older bound: it keeps a pop's tail
   * inside the section, for the milestones at the far end whose copy never reaches
   * the left edge at all.
   */
  const revealAt = React.useCallback(
    (index: number) => {
      const trackX = head + index * stepVw;
      if (slideVw <= 0) return 0;
      const arrived = clamp((trackX - (100 - itemW)) / slideVw, 0, 1);
      const leftEdge = trackX / slideVw;
      const latest = Math.min(LAST_POP, Math.max(leftEdge - pop, 0));
      return clamp(Math.max(arrived, (index + 1) * 0.05), 0, latest);
    },
    [head, itemW, pop, stepVw, slideVw],
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
              { scaleY: 1, duration: lead * 1.5 },
              at,
            );
          }
          if (dot) {
            timeline.fromTo(
              dot,
              { scale: 0 },
              { scale: 1, duration: lead * 1.5 },
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
              { yPercent: 0, duration: rise, stagger },
              at + lead,
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
  }, [items, lead, rise, revealAt, slidePercent, stagger, onMotionFailed]);

  /**
   * The corner annotations sit on one line on a desktop and stack on a phone: at
   * 390px the two halves of a row do not fit side by side without shrinking to
   * nothing, and stacking is what a technical sheet does anyway. The rows are the
   * one thing the copies share the band with, so their height is part of what
   * has to fit — see `TALL_QUERY`.
   */
  const annotationRow = wide
    ? "flex items-baseline justify-between gap-6 px-6 py-5 tracking-[0.3em]"
    : "flex flex-col items-start gap-1.5 px-5 py-4 tracking-[0.22em]";

  return (
    <div
      ref={pinRef}
      className="relative mt-12"
      // One screen plus a fixed distance per milestone, so the pin gets longer
      // as milestones are added and is never hardcoded to a count.
      style={{ height: `calc(110vh + ${items.length * pinPerItem}vh)` }}
    >
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        // The rule runs across the middle of the band at every size, and every
        // milestone hangs off it: the copy is held a little clear of it by
        // `--copy-gap`, and the stem closes most of that distance.
        style={
          {
            "--copy-gap": `${copyGapVh}vh`,
            "--stem-h": `${stemVh}vh`,
          } as React.CSSProperties
        }
      >
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
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-30 font-mono text-[10px] uppercase text-ink/65",
            annotationRow,
          )}
        >
          <span>{label}</span>
          <span>{periodLabel}</span>
        </div>

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-30 font-mono text-[10px] uppercase text-ink/65",
            annotationRow,
          )}
        >
          <span>
            {items.length} milestones
            {wide ? " · scale 1:1" : null}
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

          {/* Head of the track — the plate, at four fifths of the head slot */}
          {imageSrc ? (
            <figure
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{ width: `${head * 0.8}vw` }}
            >
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
            aria-label="Timeline of education, roles and learning milestones (present to past)"
            className="absolute inset-0 list-none p-0"
          >
            {items.map((item, index) => {
              /*
                Sides alternate at every size, and that is load-bearing rather
                than decorative: it is what keeps two milestones on the same side
                of the rule a full `item + gap` apart, which is the clearance the
                copy needs. Putting every copy on one side would stack columns
                half a `step` apart — on a phone, 320px-wide copy blocks 183px
                apart, reading straight through each other.
              */
              const above = index % 2 === 0;
              return (
                <li
                  key={item.id}
                  className="absolute inset-y-0"
                  style={{
                    left: `${head + index * stepVw}vw`,
                    width: `${itemW}vw`,
                  }}
                >
                  {/* Marker, sitting on the rule */}
                  <span
                    data-dot={item.id}
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 z-20 size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-4 ring-background"
                  />

                  {/* Stem, growing out of the rule towards the copy */}
                  <span
                    data-stem={item.id}
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 h-[var(--stem-h)] w-px bg-blueprint/40",
                      above ? "bottom-1/2" : "top-1/2",
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
                      above
                        ? "bottom-1/2 pb-[var(--copy-gap)]"
                        : "top-1/2 pt-[var(--copy-gap)]",
                    )}
                    // Only ever set for a narrow track, where the column is wide
                    // enough that the text would otherwise run too long a line.
                    style={copyMax ? { maxWidth: copyMax } : undefined}
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
  const wide = useMediaQuery(WIDE_QUERY);
  const tall = useMediaQuery(TALL_QUERY);
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

  // The pinned track runs on a phone as well as a desktop, at the narrow
  // geometry — so nobody gets a long static list. It stands down, for the
  // compact vertical list that cannot clip and hides nothing, when motion is
  // reduced, the viewport is too short to hold a copy block, or the motion layer
  // could not be built.
  if (reduced || !tall || motionFailed) {
    return (
      <div className={className}>
        <VerticalTimeline items={items} />
      </div>
    );
  }

  return (
    <div className={className}>
      <PinnedTimeline {...props} wide={wide} onMotionFailed={onMotionFailed} />
    </div>
  );
}

export default Timeline;
