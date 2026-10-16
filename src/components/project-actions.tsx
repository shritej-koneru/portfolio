import * as React from "react";

import type { Project, ProjectLiveKind } from "@/data/projects";
import { projectPath } from "@/lib/router";
import { cn } from "@/lib/utils";

/**
 * Shared project affordances, reused by the Works Wheel and the project pages so
 * a project's actions and technology chips look and behave identically wherever
 * the project appears.
 *
 * The rule they follow: an action is only rendered when the project actually has
 * that link, so a missing demo or repository hides the button instead of leaving
 * a dead one. The one exception is the link to the project's own page — every
 * project has one, so that affordance is always there.
 *
 * Every outbound link is labelled for what it is. A deployed app, a live API, a
 * client site and a downloadable release are four different promises, so the
 * project data says which one it holds and the button names it — rather than
 * calling all four a "Live Demo".
 */

const ACTION_CLASS =
  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const PRIMARY_CLASS = cn(ACTION_CLASS, "bg-ink text-paper hover:bg-blueprint");
const SECONDARY_CLASS = cn(
  ACTION_CLASS,
  "border border-ink/25 text-ink/80 hover:border-ink hover:text-ink",
);

const DETAIL_CLASS =
  "group inline-flex min-h-[40px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-blueprint underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function ExtIcon() {
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

/** What the primary button says, per kind of deployment. */
const LIVE_LABEL: Record<ProjectLiveKind, string> = {
  demo: "Live Demo",
  api: "Live API",
  site: "Visit Site",
};

/** Live / release / source links — only the actions a project actually has. */
export function ProjectActions({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const { liveUrl, releaseUrl, repoUrl } = project;

  // Nothing to offer (e.g. a project whose site went offline and whose
  // repository was removed): render no affordance at all rather than pointing
  // at a dead URL.
  if (!liveUrl && !releaseUrl && !repoUrl) return null;

  // The leading action is whatever the reader can actually open or install. A
  // release only takes the primary style when there is no deployment to lead
  // with, so an installable app still has one obvious way in.
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {liveUrl ? (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={PRIMARY_CLASS}
        >
          {LIVE_LABEL[project.liveKind ?? "demo"]}
          <ExtIcon />
        </a>
      ) : null}
      {releaseUrl ? (
        <a
          href={releaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={liveUrl ? SECONDARY_CLASS : PRIMARY_CLASS}
        >
          Download
          <ExtIcon />
        </a>
      ) : null}
      {repoUrl ? (
        <a
          href={repoUrl}
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

export function TechChips({
  tech,
  tone = "paper",
  className,
}: {
  tech: string[];
  tone?: "paper" | "ink";
  className?: string;
}) {
  if (!tech.length) return null;
  const ink = tone === "ink";
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {tech.map((item) => (
        <li
          key={item}
          className={cn(
            "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em]",
            ink
              ? "border-paper/20 text-paper/65"
              : "border-ink/15 text-ink/60",
          )}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * The way into a project's own page at `/work/<slug>`.
 *
 * Deliberately not one of the pill buttons above: those leave the site, this one
 * stays in it, so it reads as a text link and never competes with a project's
 * primary action for the eye.
 */
export function ProjectDetailLink({
  slug,
  label = "Open project",
  className,
}: {
  slug: string;
  label?: string;
  className?: string;
}) {
  return (
    <a href={projectPath(slug)} className={cn(DETAIL_CLASS, className)}>
      {label}
      <span
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
      >
        →
      </span>
    </a>
  );
}
