import * as React from "react";

import { CaseStudyEditorial } from "@/components/case-study/case-study-editorial";
import { CaseStudyEngineering } from "@/components/case-study/case-study-engineering";
import { CaseStudyFeatured } from "@/components/case-study/case-study-featured";
import { Eyebrow, Reveal } from "@/components/case-study/common";
import { FlowDiagram } from "@/components/case-study/flow-diagram";
import { ScreenshotFigure } from "@/components/case-study/screenshot-figure";
import { useInView } from "@/components/case-study/use-in-view";
import {
  getFeaturedCaseStudy,
  getSupportingCaseStudies,
} from "@/data/case-studies";

/**
 * Scene 05 — Selected Case Studies, directly after the contribution skyline.
 *
 * The sequence is deliberately staged: a light blueprint plate introduces the
 * featured project, a dark engineering view explains how it is put together, and
 * two compact editorial cards cover the supporting work. Nothing about the
 * section is pinned and no scroll is captured — the reader stays in control of
 * how long they spend on the diagrams.
 *
 * All content comes from `@/data/case-studies`, which in turn resolves each
 * entry against the canonical project list. If there is nothing to show, the
 * section renders nothing at all rather than an empty frame.
 */
export function SelectedCaseStudies() {
  const featured = React.useMemo(() => getFeaturedCaseStudy(), []);
  const supporting = React.useMemo(() => getSupportingCaseStudies(), []);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });

  if (!featured && supporting.length === 0) return null;

  return (
    <section
      id="case-studies"
      aria-labelledby="case-studies-heading"
      className="relative scroll-mt-24 border-t border-ink/10 bg-background"
    >
      <div ref={ref} className="mx-auto max-w-7xl px-6 pb-14 pt-20 sm:px-10 sm:pt-28">
        <Reveal shown={inView}>
          <Eyebrow>05 / Selected Work</Eyebrow>
          <h2
            id="case-studies-heading"
            className="mt-4 font-display text-4xl tracking-tight text-ink sm:text-5xl"
          >
            Behind the build.
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-ink/70">
            Ideas become systems. Systems become things people can use.
          </p>
        </Reveal>
      </div>

      {featured ? <CaseStudyFeatured study={featured} position={1} /> : null}
      {featured ? <CaseStudyEngineering study={featured} /> : null}

      {supporting.map((study, index) => (
        <CaseStudyEditorial
          key={study.slug}
          study={study}
          position={index + 2}
          // Alternate the composition so no two consecutive cards read alike.
          reversed={index % 2 === 1}
          media={
            study.visual ? (
              <ScreenshotFigure visual={study.visual} />
            ) : (
              <FlowDiagram diagram={study.diagram} tone="paper" />
            )
          }
        />
      ))}

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 sm:px-10 sm:pb-28">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/35">
          Source · project repositories and their own documentation
        </p>
      </div>
    </section>
  );
}

export default SelectedCaseStudies;
