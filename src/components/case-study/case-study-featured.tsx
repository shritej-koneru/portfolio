import { ProjectActions, TechChips } from "@/components/project-actions";
import type { ResolvedCaseStudy } from "@/data/case-studies";

import { BlueprintBackdrop, DrawnRule } from "./blueprint-backdrop";
import { Eyebrow, NoteEntry, Reveal } from "./common";
import { ScreenshotFigure } from "./screenshot-figure";
import { useInView } from "./use-in-view";

/**
 * The featured case study — the light blueprint plate.
 *
 * Oversized editorial title, the project's real screenshot given the widest
 * column, and a narrow information rail beside it carrying the role, the
 * problem, the approach and the technology chips read from the canonical
 * project data. Lime appears exactly twice: the role marker and nothing else.
 */
export function CaseStudyFeatured({
  study,
  position,
}: {
  study: ResolvedCaseStudy;
  position: number;
}) {
  const { project, visual } = study;
  const { ref, inView, reduced } = useInView<HTMLElement>({
    threshold: 0.06,
    rootMargin: "-6% 0px",
  });

  return (
    <article
      ref={ref}
      aria-labelledby={`${project.slug}-case-heading`}
      className="relative isolate scroll-mt-24 overflow-hidden border-t border-ink/10 bg-background"
    >
      <BlueprintBackdrop tone="paper" rulers />

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-16 sm:px-10 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-24">
        <header className="max-w-4xl">
          <Eyebrow>
            Featured case study · {String(position).padStart(2, "0")}
          </Eyebrow>
          <h3
            id={`${project.slug}-case-heading`}
            className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl"
          >
            {project.title}
          </h3>
          <Reveal
            shown={inView}
            delayMs={80}
            as="p"
            className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-ink/70 sm:text-xl"
          >
            {study.purpose}
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

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            {visual ? <ScreenshotFigure visual={visual} /> : null}
          </div>

          <div className="lg:col-span-5">
            <Reveal shown={inView} delayMs={240}>
              <Eyebrow>Role</Eyebrow>
              <p className="mt-2 flex items-start gap-3 text-[15px] leading-relaxed text-ink/75">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-signal" />
                <span className="min-w-0">{study.role}</span>
              </p>
            </Reveal>

            <div className="mt-8 space-y-8">
              <NoteEntry
                label="01 / Problem"
                body={study.problem}
                tone="paper"
                shown={inView}
                delayMs={300}
              />
              <NoteEntry
                label="02 / Approach"
                body={study.approach}
                tone="paper"
                shown={inView}
                delayMs={380}
              />
            </div>

            <Reveal shown={inView} delayMs={460} className="mt-8">
              <Eyebrow>03 / Technology</Eyebrow>
              <TechChips tech={project.tech} className="mt-3" />
            </Reveal>
          </div>
        </div>

        {/* Hand-off to the dark plate that follows — a deliberate cue rather
            than an abrupt colour cut. */}
        <Reveal shown={inView} delayMs={520} className="mt-12 flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
            Implementation follows
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-ink/10" />
          <span aria-hidden="true" className="font-mono text-[11px] text-ink/40">
            ↓
          </span>
        </Reveal>
      </div>
    </article>
  );
}

export default CaseStudyFeatured;
