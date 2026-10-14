import { TechChips } from "@/components/project-actions";
import type { ResolvedCaseStudy } from "@/data/case-studies";

import { BlueprintBackdrop, DrawnRule } from "./blueprint-backdrop";
import { Eyebrow, FactList, NoteEntry, Reveal } from "./common";
import { FlowDiagram } from "./flow-diagram";
import { useInView } from "./use-in-view";

/**
 * The dark engineering view — a featured project's implementation.
 *
 * This is the deep-ink counterpart to the light plate above it: same sheet, same
 * 48px module, inverted. Everything drawn here is transcribed from the project's
 * own documentation (see `src/data/case-studies.ts`), and the diagram says so on
 * the page rather than letting a drawing imply more than the repository states.
 *
 * No scrolling is hijacked — the block reveals itself once and then leaves the
 * reader alone to examine the details.
 */
export function CaseStudyEngineering({ study }: { study: ResolvedCaseStudy }) {
  const { project } = study;
  const { ref, inView, reduced } = useInView<HTMLElement>({
    threshold: 0.05,
    rootMargin: "-6% 0px",
  });

  return (
    <article
      ref={ref}
      aria-labelledby={`${project.slug}-engineering-heading`}
      className="relative isolate overflow-hidden bg-[#0B0E14] text-paper"
    >
      <BlueprintBackdrop tone="ink" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
        <header className="max-w-3xl">
          <Eyebrow>Implementation · system map</Eyebrow>
          <h2
            id={`${project.slug}-engineering-heading`}
            className="mt-4 font-display text-3xl leading-tight tracking-tight text-paper sm:text-4xl lg:text-5xl"
          >
            Inside {project.title}.
          </h2>
          <Reveal
            shown={inView}
            delayMs={80}
            as="p"
            className="mt-4 text-pretty text-base leading-relaxed text-paper/70"
          >
            How the pieces fit together, what the code separates, and what the
            repository documents about each decision.
          </Reveal>
          <DrawnRule
            shown={inView}
            tone="ink"
            instant={reduced}
            delayMs={140}
            className="mt-8"
          />
        </header>

        <div className="mt-10 sm:mt-12">
          <FlowDiagram diagram={study.diagram} tone="ink" />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <Eyebrow>Engineering notes</Eyebrow>
            <div className="mt-6 grid gap-8 sm:grid-cols-2">
              {study.notes.map((note, index) => (
                <NoteEntry
                  key={note.title}
                  label={`Note ${String(index + 1).padStart(2, "0")}`}
                  title={note.title}
                  body={note.body}
                  tone="ink"
                  shown={inView}
                  delayMs={index * 80}
                />
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <Reveal shown={inView} delayMs={120}>
              <Eyebrow>Documented stack</Eyebrow>
              <TechChips tech={study.stack} tone="ink" className="mt-4" />
            </Reveal>

            {study.facts.length ? (
              <div>
                <Eyebrow>What the docs state</Eyebrow>
                <FactList
                  facts={study.facts}
                  tone="ink"
                  shown={inView}
                  delayMs={200}
                  className="mt-4"
                />
              </div>
            ) : null}
          </div>
        </div>

        {study.structure ? (
          <Reveal shown={inView} delayMs={120} className="mt-12">
            <figure>
              <figcaption>
                <Eyebrow>{study.structure.caption}</Eyebrow>
              </figcaption>
              <pre className="mt-4 overflow-x-auto rounded-lg border border-paper/12 bg-[#080A0E] p-4 font-mono text-[11px] leading-relaxed text-paper/70 sm:p-5">
                {study.structure.lines.join("\n")}
              </pre>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/35">
                Transcribed from the repository README
              </p>
            </figure>
          </Reveal>
        ) : null}
      </div>
    </article>
  );
}

export default CaseStudyEngineering;
