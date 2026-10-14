import * as React from "react";

import { ProjectActions, TechChips } from "@/components/project-actions";
import type { CaseStudyNote, ResolvedCaseStudy } from "@/data/case-studies";
import { cn } from "@/lib/utils";

import { BlueprintBackdrop } from "./blueprint-backdrop";
import { Eyebrow, FactList, NoteEntry, Reveal } from "./common";
import { useInView } from "./use-in-view";

/**
 * A supporting case study — the compact editorial card.
 *
 * Deliberately shorter than the featured plate and composed asymmetrically, with
 * `reversed` available to swap the media and text columns. On tablet and phone
 * the asymmetry collapses to a single stack, with the notes above the diagram.
 *
 * The layout takes its media as a node, so a project with a real screenshot and
 * a project with only a documented diagram share one component.
 */
export function CaseStudyEditorial({
  study,
  position,
  media,
  reversed = false,
  eyebrow,
}: {
  study: ResolvedCaseStudy;
  position: number;
  media: React.ReactNode;
  reversed?: boolean;
  /** Overrides the default "Case study · NN" label. */
  eyebrow?: string;
}) {
  const { project } = study;
  const { ref, inView } = useInView<HTMLElement>({
    threshold: 0.06,
    rootMargin: "-6% 0px",
  });

  // Whichever the repository actually documents: trade-offs if they exist,
  // otherwise the engineering notes. Never invented to fill the slot.
  const details: CaseStudyNote[] = study.tradeoffs.length
    ? study.tradeoffs
    : study.notes.slice(0, 3);

  return (
    <article
      ref={ref}
      aria-labelledby={`${project.slug}-case-heading`}
      className="relative isolate overflow-hidden border-t border-ink/10 bg-background"
    >
      <BlueprintBackdrop tone="paper" />

      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-10 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className={cn("lg:col-span-7", reversed && "lg:order-2")}>
            <Reveal shown={inView} delayMs={120}>
              {media}
            </Reveal>
          </div>

          <div className={cn("lg:col-span-5", reversed && "lg:order-1")}>
            <Eyebrow>
              {eyebrow ?? `Case study · ${String(position).padStart(2, "0")}`}
            </Eyebrow>
            <h1
              id={`${project.slug}-case-heading`}
              className="mt-3 font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl"
            >
              {project.title}
            </h1>
            <Reveal
              shown={inView}
              delayMs={80}
              as="p"
              className="mt-3 text-pretty text-base leading-relaxed text-ink/70"
            >
              {study.purpose}
            </Reveal>
            <Reveal
              shown={inView}
              delayMs={120}
              as="p"
              className="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.22em] text-ink/45"
            >
              {study.role}
            </Reveal>

            <div className="mt-7 space-y-7">
              <NoteEntry
                label="01 / Problem"
                body={study.problem}
                tone="paper"
                shown={inView}
                delayMs={200}
              />
              <NoteEntry
                label="02 / Approach"
                body={study.approach}
                tone="paper"
                shown={inView}
                delayMs={260}
              />
            </div>

            <DetailList
              items={details}
              label={study.tradeoffs.length ? "03 / Trade-off" : "03 / Details"}
              shown={inView}
              delayMs={320}
            />

            <Reveal shown={inView} delayMs={360} className="mt-8">
              <Eyebrow>Technology</Eyebrow>
              <TechChips tech={project.tech} className="mt-3" />
            </Reveal>

            {study.facts.length ? (
              <div className="mt-8">
                <Eyebrow>Verified in the repository</Eyebrow>
                <FactList
                  facts={study.facts}
                  tone="paper"
                  shown={inView}
                  delayMs={400}
                  className="mt-4"
                />
              </div>
            ) : null}

            <Reveal shown={inView} delayMs={440} className="mt-8">
              <ProjectActions project={project} />
            </Reveal>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Compact titled list used for trade-offs and documented decisions. */
function DetailList({
  items,
  label,
  shown,
  delayMs,
}: {
  items: CaseStudyNote[];
  label: string;
  shown: boolean;
  delayMs: number;
}) {
  if (!items.length) return null;
  return (
    <Reveal shown={shown} delayMs={delayMs} className="mt-7">
      <Eyebrow>{label}</Eyebrow>
      <ul className="mt-3 space-y-4">
        {items.map((item) => (
          <li key={item.title}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
              {item.title}
            </p>
            <p className="mt-1 text-pretty text-[14px] leading-relaxed text-ink/65">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export default CaseStudyEditorial;
