import * as React from "react";

import ContributionSkyline from "@/components/ui/contribution-skyline";
import { useContributionHistory } from "@/data/contributions";
import { GITHUB_PROFILE } from "@/data/projects";

/**
 * Scene 04 — GitHub Contribution Skyline.
 *
 * Sits directly after the Works Wheel and reads as its footnote: the wheel
 * shows what was built, this shows the activity behind it. The skyline is the
 * only visual, driven by real contribution data (see `@/data/contributions`),
 * and the scene degrades to a plain link instead of inventing activity.
 *
 * No pinned scrolling here — the surrounding sections already own that — just
 * one subtle reveal as the scene arrives, which reduced motion skips.
 */

/** Green → signal lime. The one accent this scene adds to the palette. */
const SKYLINE_PALETTE = ["#1E5233", "#33984F", "#66C96B", "#C4F06A"];

/**
 * The skyline card paints itself with `var(--color-background, …)` fallbacks,
 * so defining those variables here gives it the ink plate and blueprint-paper
 * type without touching the component.
 */
const PLATE_COLORS = {
  "--color-background": "#16181F",
  "--color-foreground": "#F2F0E9",
  "--color-border": "rgba(242, 240, 233, 0.14)",
  "--color-muted-foreground": "rgba(242, 240, 233, 0.55)",
} as React.CSSProperties;

const PROFILE_LABEL = GITHUB_PROFILE.replace(/^https?:\/\//, "");

/**
 * Reserved footprint of the chart. The skyline's height is a fixed multiple of
 * its width (the grid is always 53 weeks by 7 days) until it caps at 620px, so
 * the placeholder uses that ratio rather than a height per breakpoint — the
 * loading state then occupies the space the chart is about to occupy.
 */
const STAGE_FOOTPRINT = "aspect-[1000/622] max-h-[620px] w-full";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function PlateShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      style={PLATE_COLORS}
      className={`rounded-xl border border-paper/15 bg-[#16181F] p-4 sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

/** Loading state — the card's own chrome, filled with chart-shaped space. */
function SkylineSkeleton() {
  return (
    <PlateShell>
      <div aria-busy="true" className="animate-pulse motion-reduce:animate-none">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <span className="text-[13px] leading-snug text-paper/40">
            Reading contributions…
          </span>
          <span className="h-8 w-[70px] shrink-0 rounded-md border border-paper/15" />
        </div>
        <div className="rounded-lg border border-paper/10">
          <div className="px-3 pt-3 sm:px-4 sm:pt-4">
            <div className={`rounded-md bg-paper/[0.06] ${STAGE_FOOTPRINT}`} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 pt-3 pb-3">
            <span className="h-3 w-48 rounded-sm bg-paper/[0.06]" />
            <span className="h-3 w-24 rounded-sm bg-paper/[0.06]" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading contribution activity from GitHub.</span>
    </PlateShell>
  );
}

/** Error and empty states — the same card, honestly empty, with the profile. */
function SkylineFallback({
  label,
  message,
}: {
  label: string;
  message: string;
}) {
  return (
    <PlateShell>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="text-[15px] leading-snug text-paper/60">
          Contribution activity
        </span>
      </div>
      <div className="rounded-lg border border-paper/10">
        <div className="px-3 pt-3 sm:px-4 sm:pt-4">
          <div
            className={`flex flex-col items-start justify-center rounded-md border border-dashed border-paper/15 px-5 py-10 sm:px-8 ${STAGE_FOOTPRINT}`}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-signal/90">
              {label}
            </p>
            <p className="mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-paper/70">
              {message}
            </p>
            <a
              href={GITHUB_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Open my GitHub profile
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 pt-3 pb-3">
          <span className="font-mono text-[11px] tracking-[0.12em] text-paper/35">
            Public contribution history
          </span>
        </div>
      </div>
    </PlateShell>
  );
}

export function OpenSourceActivity() {
  const contributions = useContributionHistory();
  const [shown, setShown] = React.useState(false);
  const introRef = React.useRef<HTMLDivElement>(null);

  // One restrained entrance for the heading and annotations. The skyline is
  // left alone — the chart already animates itself into the isometric view.
  React.useEffect(() => {
    const intro = introRef.current;
    if (!intro) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(intro);
    return () => observer.disconnect();
  }, []);

  let plate: React.ReactNode;
  if (contributions.state === "loading") {
    plate = <SkylineSkeleton />;
  } else if (contributions.state === "ready") {
    plate = (
      <div style={PLATE_COLORS}>
        <ContributionSkyline
          data={contributions.history.days}
          palette={SKYLINE_PALETTE}
          // The header already carries the genuine year total; the big stat
          // blocks would compete with the skyline, so they stay off.
          showStats={false}
        />
      </div>
    );
  } else if (contributions.state === "empty") {
    plate = (
      <SkylineFallback
        label="No activity yet"
        message="GitHub recorded no public contributions over the last year. Current activity is always on my profile."
      />
    );
  } else {
    plate = (
      <SkylineFallback
        label="Activity unavailable"
        message="The contribution history could not be loaded just now, so the chart stays empty rather than showing something invented. The real activity is on my GitHub profile."
      />
    );
  }

  return (
    <section
      id="open-source"
      aria-labelledby="open-source-heading"
      className="relative isolate scroll-mt-24 overflow-hidden border-t border-ink/10 bg-ink pt-20 text-paper sm:pt-28"
    >
      {/* Engineering grid, inverted for ink — the same 48px module as Scene 02 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(242,240,233,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(242,240,233,0.055) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 sm:pb-28">
        <div
          ref={introRef}
          className={`transition duration-700 ease-out motion-reduce:transition-none ${
            shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blueprint">
                04 / Open Source Activity
              </p>
              <h2
                id="open-source-heading"
                className="mt-4 font-display text-4xl tracking-tight text-paper sm:text-5xl"
              >
                The year in contributions.
              </h2>
              <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-paper/70">
                The public contribution calendar from GitHub, drawn as a
                skyline.
              </p>
            </div>

            <a
              href={GITHUB_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-[44px] shrink-0 items-center gap-2 self-start font-mono text-[11px] uppercase tracking-[0.22em] text-paper/80 transition-colors hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink lg:self-end"
            >
              {PROFILE_LABEL}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
              >
                →
              </span>
            </a>
          </div>
        </div>

        <div className="mt-10 sm:mt-14">{plate}</div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-paper/35">
          Source · public GitHub contribution history
        </p>
      </div>
    </section>
  );
}

export default OpenSourceActivity;
