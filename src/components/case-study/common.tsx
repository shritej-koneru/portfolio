import * as React from "react";

import { cn } from "@/lib/utils";

import { revealClass } from "./use-in-view";

/**
 * Small pieces shared by the three case-study layouts, so the light featured
 * plate, the dark engineering view and the compact editorial cards all label,
 * stagger and annotate their content the same way.
 *
 * `tone` is the only thing that changes between them: paper is ink-on-paper,
 * ink is paper-on-ink. Nothing here knows about a specific project.
 */

export type Tone = "paper" | "ink";

/** The mono eyebrow used for every technical label in the scene. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.32em] text-blueprint",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Body copy that fades up on reveal, with a stagger delay. */
export function Reveal({
  shown,
  delayMs = 0,
  as: Tag = "div",
  className,
  children,
}: {
  shown: boolean;
  delayMs?: number;
  as?: "div" | "p" | "li" | "span";
  className?: string;
  children: React.ReactNode;
}) {
  const reveal = revealClass(shown, delayMs);
  return (
    <Tag className={cn(reveal.className, className)} style={reveal.style}>
      {children}
    </Tag>
  );
}

/**
 * A numbered note: the drafting label above, then the explanation. Used for the
 * 01 / PROBLEM and 02 / APPROACH blocks and for every engineering note.
 */
export function NoteEntry({
  label,
  title,
  body,
  tone,
  shown,
  delayMs = 0,
  className,
}: {
  label: string;
  title?: string;
  body: string;
  tone: Tone;
  shown: boolean;
  delayMs?: number;
  className?: string;
}) {
  const ink = tone === "ink";
  return (
    <Reveal shown={shown} delayMs={delayMs} className={className}>
      <Eyebrow>{label}</Eyebrow>
      {title ? (
        <h4
          className={cn(
            "mt-2 font-display text-base leading-snug",
            ink ? "text-paper" : "text-ink",
          )}
        >
          {title}
        </h4>
      ) : null}
      <p
        className={cn(
          "mt-2 text-pretty text-[15px] leading-relaxed",
          ink ? "text-paper/70" : "text-ink/70",
        )}
      >
        {body}
      </p>
    </Reveal>
  );
}

/** Verified specifics, marked with a tick rather than a decorative bullet. */
export function FactList({
  facts,
  tone,
  shown,
  delayMs = 0,
  className,
}: {
  facts: string[];
  tone: Tone;
  shown: boolean;
  delayMs?: number;
  className?: string;
}) {
  if (!facts.length) return null;
  const ink = tone === "ink";
  return (
    <Reveal shown={shown} delayMs={delayMs} className={className}>
      <ul className="space-y-2.5">
        {facts.map((fact) => (
          <li
            key={fact}
            className={cn(
              "flex gap-3 text-[13px] leading-relaxed",
              ink ? "text-paper/65" : "text-ink/65",
            )}
          >
            <span aria-hidden="true" className="mt-[7px] h-px w-3 shrink-0 bg-blueprint/70" />
            <span className="min-w-0">{fact}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
