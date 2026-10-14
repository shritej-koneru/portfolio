import * as React from "react";

import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

/**
 * Shared project affordances, reused by the Works Wheel (Scene 03) and the case
 * studies (Scene 05) so a project's actions and technology chips look and behave
 * identically wherever the project appears.
 *
 * The rule both places follow: an action is only rendered when the project
 * actually has that link, so a missing demo or repository hides the button
 * instead of leaving a dead one.
 */

const ACTION_CLASS =
  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const PRIMARY_CLASS = cn(ACTION_CLASS, "bg-ink text-paper hover:bg-blueprint");
const SECONDARY_CLASS = cn(
  ACTION_CLASS,
  "border border-ink/25 text-ink/80 hover:border-ink hover:text-ink",
);

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

/** Live / source links — only the actions a project actually has. */
export function ProjectActions({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  // Nothing to offer (e.g. a project whose repository was removed): render no
  // affordance at all rather than pointing at a dead URL.
  if (!project.liveUrl && !project.repoUrl) return null;

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
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
