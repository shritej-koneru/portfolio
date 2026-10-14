import * as React from "react";

import { CaseStudyEditorial } from "@/components/case-study/case-study-editorial";
import { CaseStudyEngineering } from "@/components/case-study/case-study-engineering";
import { CaseStudyFeatured } from "@/components/case-study/case-study-featured";
import {
  BlueprintBackdrop,
  DrawnRule,
} from "@/components/case-study/blueprint-backdrop";
import { Eyebrow, Reveal } from "@/components/case-study/common";
import { FlowDiagram } from "@/components/case-study/flow-diagram";
import { ScreenshotFigure } from "@/components/case-study/screenshot-figure";
import { useInView } from "@/components/case-study/use-in-view";
import { ProjectActions, TechChips } from "@/components/project-actions";
import { getCaseStudyBySlug } from "@/data/case-studies";
import { projects, type Project } from "@/data/projects";
import { projectPath, usePageTitle } from "@/lib/router";

import { NotFoundPage } from "./not-found";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * A project's own page, at `/work/<slug>`.
 *
 * This is where a project opens to: the same build notes the case studies were
 * written as, but addressed to one project instead of stacked into a single
 * scroll at the bottom of the site. Every project in `projects.ts` has a page,
 * because every project is real — what differs is how much is written down:
 *
 *  - A project with a case study in `src/data/case-studies.ts` renders it, in
 *    full: problem, approach, technology, the system map, the engineering notes
 *    and whatever the repository actually documents.
 *  - A project without one renders what is verifiable about it — description,
 *    technology, links — and says plainly that the write-up does not exist yet.
 *    Nothing is padded out to make the two look alike.
 *
 * Nothing here is a second project list: both the project and its case study are
 * looked up by slug from the canonical data files.
 */
export function ProjectPage({ slug }: { slug: string }) {
  const index = projects.findIndex((entry) => entry.slug === slug);
  const project = index >= 0 ? projects[index] : undefined;

  usePageTitle(
    project ? `${project.title} · Shritej Koneru` : "Not found · Shritej Koneru",
  );

  // The slug came from the address, not from a link, so it may not exist.
  if (!project) return <NotFoundPage path={projectPath(slug)} />;

  const study = getCaseStudyBySlug(slug);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <main className="w-full bg-background">
      <ProjectBar project={project} index={index} total={projects.length} />

      {study ? (
        study.kind === "featured" ? (
          <>
            <CaseStudyFeatured
              study={study}
              position={1}
              eyebrow="Behind the build"
            />
            <CaseStudyEngineering study={study} />
          </>
        ) : (
          <CaseStudyEditorial
            study={study}
            position={1}
            eyebrow="Behind the build"
            media={
              study.visual ? (
                <ScreenshotFigure visual={study.visual} />
              ) : (
                <FlowDiagram diagram={study.diagram} tone="paper" />
              )
            }
          />
        )
      ) : (
        <ProjectOverview project={project} />
      )}

      <ProjectFooter previous={previous} next={next} />
    </main>
  );
}

/**
 * The page's own chrome — where this page sits in the work, and the way back to
 * the wheel it was opened from.
 */
function ProjectBar({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2.5 sm:px-10">
        <a
          href="/#work"
          className="inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span aria-hidden="true">←</span> All work
        </a>
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.28em] text-ink/40">
          {pad(index + 1)} / {pad(total)}
          <span className="text-ink/30"> · </span>
          {project.title}
        </p>
      </div>
    </header>
  );
}

/**
 * A project nothing is written about yet.
 *
 * The honest version of an empty case study: the description, the technology and
 * the links are all verifiable, so they are shown; the problem/approach notes
 * are not, so the page says so instead of filling three labels with a
 * plausible-sounding story.
 */
function ProjectOverview({ project }: { project: Project }) {
  const { ref, inView, reduced } = useInView<HTMLElement>({ threshold: 0.05 });

  return (
    <article
      ref={ref}
      aria-labelledby={`${project.slug}-heading`}
      className="relative isolate overflow-hidden border-t border-ink/10 bg-background"
    >
      <BlueprintBackdrop tone="paper" rulers />

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
        <header className="max-w-4xl">
          <Eyebrow>
            Project
            {project.status ? ` · ${project.status}` : ""}
          </Eyebrow>
          <h1
            id={`${project.slug}-heading`}
            className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl"
          >
            {project.title}
          </h1>
          <Reveal
            shown={inView}
            delayMs={80}
            as="p"
            className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-ink/70 sm:text-xl"
          >
            {project.description}
          </Reveal>
          <Reveal shown={inView} delayMs={160} className="mt-7">
            <ProjectActions project={project} />
          </Reveal>
          <DrawnRule
            shown={inView}
            tone="paper"
            instant={reduced}
            delayMs={220}
            className="mt-9"
          />
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal shown={inView} delayMs={240}>
              <Eyebrow>Behind the build</Eyebrow>
              <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink/70">
                I haven&apos;t written up the build notes for this one yet — no
                problem, approach or engineering notes are published here,
                because there is nothing documented to draw them from. What is on
                this page is what can be checked: the description, the technology
                and the links come straight from the project itself.
              </p>
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-blueprint underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Read the repository
                  <span aria-hidden="true">→</span>
                </a>
              ) : null}
            </Reveal>
          </div>

          <div className="space-y-10 lg:col-span-5">
            <Reveal shown={inView} delayMs={300}>
              <Eyebrow>Technology</Eyebrow>
              <TechChips tech={project.tech} className="mt-4" />
            </Reveal>

            {project.status ? (
              <Reveal shown={inView} delayMs={360}>
                <Eyebrow>Status</Eyebrow>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/75">
                  {project.status}
                </p>
              </Reveal>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/** The foot of every project page: what the page is drawn from, and what's next. */
function ProjectFooter({
  previous,
  next,
}: {
  previous: Project;
  next: Project;
}) {
  return (
    <footer className="border-t border-ink/10 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/35">
          Source · public project repositories and the documentation written for
          them
        </p>

        <nav
          aria-label="More projects"
          className="mt-8 grid gap-px overflow-hidden rounded-xl border border-ink/12 bg-ink/10 sm:grid-cols-2"
        >
          <a
            href={projectPath(previous.slug)}
            className="group flex min-h-[44px] flex-col justify-center gap-1 bg-background px-5 py-4 transition-colors hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blueprint"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">
              ← Previous
            </span>
            <span className="font-display text-lg text-ink">
              {previous.title}
            </span>
          </a>
          <a
            href={projectPath(next.slug)}
            className="group flex min-h-[44px] flex-col justify-center gap-1 bg-background px-5 py-4 transition-colors hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blueprint sm:items-end sm:text-right"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">
              Next →
            </span>
            <span className="font-display text-lg text-ink">{next.title}</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default ProjectPage;
