import * as React from "react";

import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";
import {
  GITHUB_PROFILE,
  getFeaturedProjects,
  getOtherProjects,
  type Project,
} from "@/data/projects";
import { cn } from "@/lib/utils";

/** A project's single best link for the wheel card: live demo, else source. */
const cardHref = (project: Project) => project.liveUrl ?? project.repoUrl;

/** Maps the project data onto the wheel's item shape. Nothing is hardcoded. */
const toWheelItems = (list: Project[]): WorksWheelItem[] =>
  list.map((project) => ({
    id: project.slug,
    title: project.title,
    image: project.image,
    href: cardHref(project),
  }));

const ACTION_CLASS =
  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const PRIMARY_CLASS = cn(ACTION_CLASS, "bg-ink text-paper hover:bg-blueprint");
const SECONDARY_CLASS = cn(
  ACTION_CLASS,
  "border border-ink/25 text-ink/80 hover:border-ink hover:text-ink",
);

/** Live / source links — only the actions a project actually has. */
function ProjectActions({ project }: { project: Project }) {
  // Nothing to offer (e.g. a project whose repository was removed): the brief
  // is to reveal only actions that exist, so render no affordance at all.
  if (!project.liveUrl && !project.repoUrl) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {project.liveUrl ? (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={PRIMARY_CLASS}
        >
          Live Demo
          <ExtIcon />
        </a>
      ) : null}
      {project.repoUrl ? (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={SECONDARY_CLASS}
        >
          Source Code
          <ExtIcon />
        </a>
      ) : null}
    </div>
  );
}

function ExtIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
      <path
        d="M3 9 9 3M4 3h5v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TechChips({ tech }: { tech: string[] }) {
  if (!tech.length) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {tech.map((item) => (
        <li
          key={item}
          className="rounded-full border border-ink/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink/60"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

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
    <div className="border-t border-ink/10 pt-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            {project.status ? (
              <span className="text-blueprint"> · {project.status}</span>
            ) : null}
          </p>
          <h3 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
            {project.title}
          </h3>
          <p className="mt-3 text-pretty leading-relaxed text-ink/70">
            {project.description}
          </p>
          <TechChips tech={project.tech} />
        </div>
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
            <h3 className="font-display text-lg text-ink">{project.title}</h3>
            {project.status ? (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-blueprint">
                {project.status}
              </p>
            ) : null}
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
              {project.description}
            </p>
            <TechChips tech={project.tech} />
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

  const [activeIndex, setActiveIndex] = React.useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(featured.length - 1, 0));
  const activeProject = featured[safeIndex];

  // Stable identity for the wheel's callback so it never restarts the animation.
  const handleActiveChange = React.useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="relative scroll-mt-24 border-t border-ink/10 bg-background py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blueprint">
          Selected Work / 2026
        </p>
        <h2
          id="work-heading"
          className="mt-4 font-display text-4xl tracking-tight text-ink sm:text-5xl"
        >
          Things I&apos;ve Built.
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-ink/70">
          A selection of projects, experiments, and tools I&apos;ve worked on.
        </p>
      </div>

      <div className="mt-12 sm:mt-16">
        {featured.length === 0 ? (
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-ink/60">Projects are on the way.</p>
          </div>
        ) : wheelSupported ? (
          <>
            <div className="relative h-[62svh] min-h-[22rem] max-h-[46rem]">
              <WorksWheel
                items={wheelItems}
                label="Selected Work"
                action="Open"
                onActiveChange={handleActiveChange}
              />
              <p
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-4 z-20 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-ink/35"
              >
                Scroll or drag · ↑ ↓ to browse
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-7xl px-6">
              <ProjectDetails
                project={activeProject}
                index={safeIndex}
                total={featured.length}
              />
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-7xl px-6">
            <ProjectList items={featured} />
          </div>
        )}
      </div>

      {other.length > 0 ? (
        <div className="mx-auto mt-16 max-w-7xl px-6">
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
      ) : null}
    </section>
  );
}

export default FeaturedProjects;
