import * as React from "react";
import { ArrowUpRightIcon, XIcon } from "lucide-react";

import { revealClass, useInView } from "@/components/case-study/use-in-view";
import { PlusMark } from "@/components/ui/plus-mark";
import { ToolkitTabs, formatCount, toolkitTabId } from "@/components/ui/toolkit-tabs";
import type { Project } from "@/data/projects";
import {
  getLearningTechnologies,
  getTechnologyById,
  getTechnologyProjects,
  getToolkitGroups,
  technologies,
} from "@/data/toolkit";
import { projectPath } from "@/lib/router";
import { cn } from "@/lib/utils";

/**
 * Scene 06 — the Technical Toolkit.
 *
 * The toolkit is a ruled plate: a bordered grid of technologies, one tile per
 * technology, each tile showing the projects that used it. Everything on the
 * plate is derived from `@/data/toolkit`, which resolves its project ids against
 * `@/data/projects` — so a tile and its project page can never drift apart, and
 * adding a technology is adding one object.
 *
 * Two things are interactive, and they are deliberately separate controls:
 *
 *  - The tile. A button stretched across the cell opens the readout below the
 *    grid. It is a sibling of the project links, never their parent, which keeps
 *    the markup valid and both targets independently reachable.
 *  - The project links on the tile and in the readout. They point at the same
 *    `/work/<slug>` pages the Works Wheel opens.
 *
 * The readout keeps its footprint whether or not something is selected, so
 * choosing a technology never shifts the rest of the page.
 *
 * Grids stop at a hairline. The corner pluses and the rules that run out to the
 * edge of the sheet are the one pattern adapted from 21st.dev's "Logo Cloud 2";
 * see `@/components/ui/plus-mark`.
 */

const TABS_ID = "toolkit";
const GRID_ID = "toolkit-technologies";
const DETAIL_ID = "toolkit-detail";
const DETAIL_HEADING_ID = "toolkit-detail-heading";

const CHIP_CLASS =
  "inline-flex min-h-[28px] items-center rounded-full border border-ink/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/65 transition-colors hover:border-blueprint hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-1 focus-visible:ring-offset-card";

export function TechnicalToolkit() {
  const groups = React.useMemo(() => getToolkitGroups(), []);
  const [activeGroupId, setActiveGroupId] = React.useState(groups[0]?.id ?? "languages");
  const [openTechId, setOpenTechId] = React.useState<string | null>(null);

  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.08 });
  const heading = revealClass(inView, 0);
  const controls = revealClass(inView, 120);
  const plate = revealClass(inView, 200);

  const sectionRef = React.useRef<HTMLElement>(null);
  const tiles = React.useRef(new Map<string, HTMLButtonElement>());

  /** Each technology resolved against the real project data, once. */
  const projectsByTech = React.useMemo(() => {
    const map = new Map<string, Project[]>();
    technologies.forEach((tech) => map.set(tech.id, getTechnologyProjects(tech)));
    return map;
  }, []);

  const learning = React.useMemo(() => getLearningTechnologies(), []);

  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? groups[0];
  const openTech = openTechId ? getTechnologyById(openTechId) ?? null : null;
  const openProjects = openTech ? projectsByTech.get(openTech.id) ?? [] : [];
  const openGroup = openTech ? groups.find((group) => group.id === openTech.category) : undefined;
  const openNumber = openGroup ? openGroup.items.findIndex((item) => item.id === openTech?.id) + 1 : 0;

  const close = React.useCallback(
    (returnFocus = false) => {
      if (returnFocus && openTechId) {
        const node = tiles.current.get(openTechId);
        const active = document.activeElement;
        // Only pull focus back if it is still around this scene. Escape should
        // not drag a visitor back from somewhere else on the page.
        const stays =
          active === null ||
          active === document.body ||
          sectionRef.current?.contains(active) === true;
        if (node && stays) node.focus();
      }
      setOpenTechId(null);
    },
    [openTechId],
  );

  React.useEffect(() => {
    if (!openTechId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openTechId, close]);

  const toggle = (id: string) => {
    setOpenTechId((current) => (current === id ? null : id));
  };

  const tabs = groups.map((group) => ({
    id: group.id,
    label: group.label,
    count: group.count,
  }));

  return (
    <section
      ref={sectionRef}
      id="toolkit"
      aria-labelledby="toolkit-heading"
      className="relative scroll-mt-24 border-t border-ink/10 bg-background pt-20 sm:pt-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div ref={ref} className={heading.className} style={heading.style}>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blueprint">
            06 / The Toolkit
          </p>
          <h2
            id="toolkit-heading"
            className="mt-4 max-w-3xl font-display text-4xl tracking-tight text-ink sm:text-5xl"
          >
            The tools, and where they were used.
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-ink/70">
            Every technology here comes from the resume or the repositories behind
            it. Pick one to see the projects it shipped in — or open a project
            straight from its tile.
          </p>
        </div>

        {/* The tabs filter the plate. Their counts are read from the data. */}
        <div className={cn("mt-10 sm:mt-12", controls.className)} style={controls.style}>
          <ToolkitTabs
            tabs={tabs}
            activeId={activeGroup.id}
            onSelect={(id) => setActiveGroupId(id as typeof activeGroupId)}
            panelId={GRID_ID}
            idPrefix={TABS_ID}
            label="Filter technologies by category"
          />
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
            {technologies.length} technologies · {groups.length} groups ·{" "}
            {learning.length} being explored
          </p>
        </div>
      </div>

      {/* The plate. Full-bleed rules top and bottom, hairline cells, and a
          corner plus on every crossing. */}
      <div
        id={GRID_ID}
        role="tabpanel"
        aria-labelledby={toolkitTabId(TABS_ID, activeGroup.id)}
        className={cn("relative mx-auto mt-6 max-w-7xl px-6", plate.className)}
        style={plate.style}
      >
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px left-1/2 w-screen -translate-x-1/2 border-t border-ink/10"
          />
          <ul className="grid grid-cols-1 gap-px border-x border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeGroup.items.map((tech, index) => {
              const projects = projectsByTech.get(tech.id) ?? [];
              const isOpen = openTechId === tech.id;

              return (
                <li
                  key={tech.id}
                  className={cn(
                    "group relative flex flex-col bg-card p-5 transition duration-200 motion-reduce:transition-none sm:p-6",
                    "hover:bg-white focus-within:bg-white",
                    isOpen && "bg-white ring-1 ring-inset ring-blueprint",
                  )}
                >
                  <PlusMark className="-bottom-2.5 -right-2.5" />

                  {/* The whole cell is the control; the links sit above it. */}
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) tiles.current.set(tech.id, node);
                      else tiles.current.delete(tech.id);
                    }}
                    onClick={() => toggle(tech.id)}
                    aria-expanded={isOpen}
                    aria-controls={DETAIL_ID}
                    aria-label={`${tech.name} — ${
                      isOpen ? "hide" : "show"
                    } the projects that used it`}
                    className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blueprint"
                  />

                  <div className="pointer-events-none relative z-[1] flex items-start justify-between gap-3">
                    <span className="inline-flex flex-col gap-2">
                      <span
                        aria-hidden="true"
                        className="font-mono text-[11px] tracking-[0.2em] text-ink/45"
                      >
                        {formatCount(index + 1)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="block h-0.5 w-6 origin-left scale-x-0 bg-signal transition-transform duration-200 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
                      />
                    </span>
                    {tech.learning ? (
                      <span className="rounded-full bg-signal px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink">
                        Exploring
                      </span>
                    ) : null}
                  </div>

                  <h3 className="pointer-events-none relative z-[1] mt-3 font-display text-[17px] leading-tight tracking-tight text-ink sm:text-lg">
                    {tech.name}
                  </h3>

                  <p className="pointer-events-none relative z-[1] mt-auto pt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-ink/50">
                    {projects.length > 0 ? "Used in" : "Source"}
                  </p>

                  {projects.length > 0 ? (
                    <ul className="relative z-[2] mt-3 flex flex-wrap gap-1.5">
                      {projects.map((project) => (
                        <li key={project.slug}>
                    <a href={projectPath(project.slug)} className={CHIP_CLASS} title={project.description}>
                            {project.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="pointer-events-none relative z-[1] mt-3 text-[13px] leading-snug text-ink/65">
                      {tech.source}
                    </p>
                  )}

                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-0.5 origin-left transition-transform duration-300 ease-out motion-reduce:transition-none",
                      isOpen
                        ? "scale-x-100 bg-signal"
                        : "scale-x-0 bg-blueprint group-hover:scale-x-100",
                    )}
                  />
                </li>
              );
            })}

            {activeGroup.count === 0 ? (
              <li className="bg-card p-8 text-sm text-ink/60 sm:col-span-2 lg:col-span-3 xl:col-span-4">
                Nothing is filed under {activeGroup.label} yet.
              </li>
            ) : null}
          </ul>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px left-1/2 w-screen -translate-x-1/2 border-b border-ink/10"
          />
        </div>
      </div>

      {/* The readout. Its height is reserved so selecting never shifts the page. */}
      <div className="mx-auto max-w-7xl px-6">
        <div
          id={DETAIL_ID}
          role="region"
          aria-live="polite"
          aria-labelledby={openTech ? DETAIL_HEADING_ID : undefined}
          aria-label={openTech ? undefined : "Technology details"}
          className="mt-8 min-h-[220px] border border-ink/10 bg-card p-6 sm:min-h-[240px] sm:p-8"
        >
          {openTech ? (
            <>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blueprint">
                    Detail · {formatCount(openNumber)} · {openGroup?.label}
                  </p>
                  <h3
                    id={DETAIL_HEADING_ID}
                    className="mt-2 font-display text-2xl tracking-tight text-ink sm:text-3xl"
                  >
                    {openTech.name}
                  </h3>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/65">
                    {openProjects.length > 0
                      ? `Used in ${openProjects.length} ${
                          openProjects.length === 1 ? "project" : "projects"
                        }`
                      : openTech.learning
                        ? "Being explored"
                        : "Not in a project yet"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => close(true)}
                  aria-label="Close details"
                  className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-ink/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  <XIcon aria-hidden="true" strokeWidth={1.5} className="size-4" />
                </button>
              </div>

              <div className="mt-6 border-t border-ink/10 pt-5">
                {openProjects.length > 0 ? (
                  <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                    {openProjects.map((project) => (
                      <li key={project.slug}>
                        <a
                          href={projectPath(project.slug)}
                          className="group/link flex flex-col gap-1 border-b border-ink/10 py-3 transition-colors hover:border-blueprint/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        >
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="font-display text-[15px] tracking-tight text-ink">
                              {project.title}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
                                {project.status}
                              </span>
                              <ArrowUpRightIcon
                                aria-hidden="true"
                                strokeWidth={1.5}
                                className="size-3.5 shrink-0 text-ink/35 transition-colors group-hover/link:text-blueprint motion-reduce:transition-none"
                              />
                            </span>
                          </span>
                          <span className="line-clamp-1 text-[12px] leading-snug text-ink/60">
                            {project.description}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="max-w-2xl text-sm leading-relaxed text-ink/65">
                    No project in this portfolio uses it yet.
                    {openTech.source ? (
                      <>
                        {" "}
                        The claim comes from the resume —{" "}
                        <span className="text-ink/80">{openTech.source}</span>.
                      </>
                    ) : null}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-[168px] flex-col justify-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
                Detail
              </p>
              <p className="mt-3 max-w-md font-display text-lg leading-snug tracking-tight text-ink/70">
                Pick a technology to see the projects it shipped in.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend. Derived, so it can never list a technology that is not here. */}
      <div className="mx-auto max-w-7xl px-6">
        <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block size-2 rounded-full bg-signal"
            />
            Exploring
          </span>
          <span className="text-ink/40">—</span>
          {learning.map((tech) => (
            <span key={tech.id}>
              {tech.name}
              {tech.source ? <span className="text-ink/45"> · {tech.source}</span> : null}
            </span>
          ))}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:pb-28">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-ink/10 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/65">
            Fig. 06.1 — Technical Toolkit · Source · resume and public repositories
          </p>
          <a
            href="#work"
            className="inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink/65 transition-colors hover:text-blueprint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            ← Back to the work
          </a>
        </div>
      </div>
    </section>
  );
}

export default TechnicalToolkit;
