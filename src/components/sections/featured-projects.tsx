import * as React from "react";

import { WorksWheel, type WorksWheelHandle, type WorksWheelItem } from "@/components/ui/works-wheel";
import {
  ProjectActions,
  ProjectDetailLink,
  TechChips,
} from "@/components/project-actions";
import {
  GITHUB_PROFILE,
  getFeaturedProjects,
  getOtherProjects,
  type Project,
} from "@/data/projects";
import { projectPath } from "@/lib/router";
import { cn } from "@/lib/utils";

/**
 * How much page scroll (as a percentage of the viewport height) it takes to
 * turn the wheel through one stop — the ring opening into the drum, then one
 * project per stop after that. The section is `wheel.length + 1` stops tall, so
 * the total distance scales with the number of projects and nothing is
 * hardcoded to a count.
 */
const PIN_STEP_VH = 22;

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value));

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Maps the project data onto the wheel's item shape. Nothing is hardcoded. */
const toWheelItems = (list: Project[]): WorksWheelItem[] =>
  list.map((project) => ({
    id: project.slug,
    title: project.title,
    image: project.image,
    // A card opens the project's own page, which is where its build notes are.
    href: projectPath(project.slug),
  }));

/** Details for the project at the front of the wheel. */
function ProjectDetails({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
      <div className="min-w-0 max-w-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          {project.status ? (
            <span className="text-blueprint"> · {project.status}</span>
          ) : null}
        </p>
        <h3 className="mt-2 font-display text-xl text-ink sm:text-2xl">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-pretty text-sm leading-relaxed text-ink/70 sm:text-base">
          {project.description}
        </p>
        <TechChips tech={project.tech} className="mt-4" />
      </div>
      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
        {/* Into the project's own page — the same door the card above opens. */}
        <ProjectDetailLink slug={project.slug} />
        <ProjectActions project={project} />
      </div>
    </div>
  );
}

/** Conventional, fully-static list — the fallback when the wheel can't run. */
function ProjectList({
  items,
  compact = false,
}: {
  items: Project[];
  compact?: boolean;
}) {
  return (
    <ul
      className={cn(
        "grid gap-6",
        compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {items.map((project) => (
        <li
          key={project.slug}
          data-cursor="frame"
          className="flex flex-col overflow-hidden rounded-xl border border-ink/12 bg-card"
        >
          {!compact && project.image ? (
            <img
              src={project.image}
              alt=""
              loading="lazy"
              className="aspect-[1450/1000] w-full object-cover"
            />
          ) : null}
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-display text-lg text-ink">
              <a
                href={projectPath(project.slug)}
                className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {project.title}
              </a>
            </h3>
            {project.status ? (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-blueprint">
                {project.status}
              </p>
            ) : null}
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
              {project.description}
            </p>
            <TechChips tech={project.tech} className="mt-4" />
            <div className="mt-5">
              <ProjectActions project={project} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Whether the environment can run the 3D wheel. Computed once on the client
 * (this is a client-rendered SPA, so `window` is always present here).
 */
function canRunWheel(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function")
    return false;
  return (
    "ResizeObserver" in window &&
    typeof window.matchMedia === "function" &&
    CSS.supports("transform-style", "preserve-3d") &&
    CSS.supports("perspective", "10px")
  );
}

export function FeaturedProjects() {
  const featured = React.useMemo(() => getFeaturedProjects(), []);
  const other = React.useMemo(() => getOtherProjects(), []);
  const wheelItems = React.useMemo(() => toWheelItems(featured), [featured]);
  const wheelSupported = React.useMemo(() => canRunWheel(), []);

  const count = featured.length;

  const [activeIndex, setActiveIndex] = React.useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(count - 1, 0));
  const activeProject = featured[safeIndex];

  const pinRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<WorksWheelHandle>(null);

  // Stable identity for the wheel's callback so it never restarts the animation.
  const handleActiveChange = React.useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  /**
   * The wheel is part of the page scroll: the section is pinned, and its
   * position in that pinned scroll drives the wheel from the ring (0) through
   * the drum to the last project. Nothing turns until the section reaches the
   * top of the viewport, so the reader always sees the circle first and the
   * cards go one after the other from there — then the page carries on to the
   * next section.
   */
  React.useEffect(() => {
    if (!wheelSupported || count === 0) return;
    const el = pinRef.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const progress = clamp(-el.getBoundingClientRect().top / total, 0, 1);
      wheelRef.current?.setTurn(progress * count);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [wheelSupported, count]);

  /** Index click: scroll the page to the position that brings that project up. */
  const handleSelect = React.useCallback(
    (index: number) => {
      const el = pinRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      // Item `index` sits at turn `index + 1`, and turn runs 0..count.
      const progress = (index + 1) / Math.max(count, 1);
      window.scrollTo({
        top: top + progress * total,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    },
    [count],
  );

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="relative scroll-mt-24 border-t border-ink/10 bg-background pt-20 sm:pt-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blueprint">
          03 / Selected Work
        </p>
        <h2
          id="work-heading"
          className="mt-4 font-display text-4xl tracking-tight text-ink sm:text-5xl"
        >
          Things I&apos;ve Built.
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-ink/70">
          Full-stack web apps, Android apps and a handful of AI experiments.
        </p>
      </div>

      {count === 0 ? (
        <div className="mx-auto mt-12 max-w-7xl px-6">
          <p className="text-ink/60">No projects are published here yet.</p>
        </div>
      ) : wheelSupported ? (
        <div
          ref={pinRef}
          className="relative mt-12"
          style={{ height: `calc(100svh + ${count * PIN_STEP_VH}svh)` }}
        >
          <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
            <div className="flex h-full flex-col">
              <div className="relative min-h-0 flex-1">
                <WorksWheel
                  ref={wheelRef}
                  items={wheelItems}
                  label="Selected Work"
                  action="Open"
                  interactive={false}
                  onActiveChange={handleActiveChange}
                  onSelect={handleSelect}
                />
                <p
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-3 z-20 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-ink/35"
                >
                  Scroll to turn the wheel
                </p>
              </div>

              <div className="shrink-0 border-t border-ink/10 bg-background">
                <div className="mx-auto max-w-7xl px-6 py-4 sm:py-5">
                  <ProjectDetails
                    project={activeProject}
                    index={safeIndex}
                    total={count}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-12 max-w-7xl px-6">
          <ProjectList items={featured} />
        </div>
      )}

      {other.length > 0 ? (
        <div className="mx-auto mt-16 max-w-7xl px-6 pb-20 sm:pb-28">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink/45">
              Also on GitHub
            </h3>
            <a
              href={GITHUB_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-blueprint underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View all repositories →
            </a>
          </div>
          <div className="mt-6">
            <ProjectList items={other} compact />
          </div>
        </div>
      ) : (
        <div className="pb-20 sm:pb-28" />
      )}
    </section>
  );
}

export default FeaturedProjects;
