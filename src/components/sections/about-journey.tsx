import * as React from "react";

import { revealClass, useInView } from "@/components/case-study/use-in-view";
import Timeline from "@/components/ui/timeline";
import { GITHUB_PROFILE } from "@/data/projects";
import { getMilestones } from "@/data/timeline";

/**
 * Scene 05 — About & the journey.
 *
 * Sits directly after the contribution skyline and is deliberately its
 * opposite: paper, not ink. The skyline is the record of *activity*; this is the
 * record of *direction* — where the learning came from and where it is going.
 *
 * The scene is an introduction followed by the timeline. The introduction stays
 * in the page's normal flow, so the heading is legible on the way in; the
 * timeline then takes over the scroll for as long as it needs (see
 * `@/components/ui/timeline`). Nothing here is pinned or hidden by CSS — the
 * only reveal is a single IntersectionObserver, which reduced motion skips.
 *
 * Content lives in two places on purpose: the milestone list is data
 * (`@/data/timeline`), and the prose below is scene copy, written the way the
 * other sections write theirs.
 */

/**
 * From the resume's contact line. Kept here rather than in `projects.ts`
 * because it is not a project — the scene's only other profile link.
 */
const LINKEDIN_PROFILE =
  "https://www.linkedin.com/in/shritej-koneru-560111324";

const PROFILE_LINKS = [
  { label: "GitHub", href: GITHUB_PROFILE },
  { label: "LinkedIn", href: LINKEDIN_PROFILE },
];

/** From the resume: education, location, and what the degree covers. */
const FACTS = [
  {
    term: "Studying",
    detail: "B.Tech in Computer Science",
    sub: "Siddhartha Academy of Higher Education, Vijayawada",
  },
  {
    term: "Based in",
    detail: "Vijayawada, Andhra Pradesh",
    sub: "India",
  },
];

export function AboutJourney() {
  const items = React.useMemo(() => getMilestones(), []);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.08 });

  const heading = revealClass(inView, 0);
  const facts = revealClass(inView, 120);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative scroll-mt-24 border-t border-ink/10 bg-background pt-20 sm:pt-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div ref={ref} className={heading.className} style={heading.style}>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blueprint">
            05 / The Journey
          </p>
          <h2
            id="about-heading"
            className="mt-4 max-w-3xl font-display text-4xl tracking-tight text-ink sm:text-5xl"
          >
            The path so far.
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-ink/70">
            What I&apos;ve studied, and everything I&apos;ve built outside it.
          </p>
        </div>

        {/* Introduction, and where it comes from — an editorial two-column block */}
        <div className="mt-12 grid gap-10 border-t border-ink/10 pt-10 sm:mt-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16">
          <div className="space-y-5 text-pretty text-base leading-relaxed text-ink/75 sm:text-lg">
            <p>
              I build software end to end — the interface, the code and the
              deploy. Most of it starts as something I wanted to exist: a
              stock-market dashboard for Indian markets, an offline Android
              expense tracker, a voice assistant that runs on my own machine.
              What I keep coming back to is the part where the whole thing is
              mine to design and ship.
            </p>
            <p>
              How it looks and feels matters as much to me as whether it works,
              which is why interface design keeps pulling me back — Figma
              drafts, motion and the details nobody is supposed to notice.
              Right now I&apos;m going deeper on the other side of that work:
              REST APIs, data pipelines and cloud tooling, and where AI models
              fit into products people actually use.
            </p>
          </div>

          <div
            className={`${facts.className} border-t border-ink/10 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-16`}
            style={facts.style}
          >
            <dl className="space-y-6">
              {FACTS.map((fact) => (
                <div key={fact.term}>
                  <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-ink/65">
                    {fact.term}
                  </dt>
                  <dd className="mt-2 font-display text-base font-medium text-ink">
                    {fact.detail}
                    <span className="mt-1 block font-sans text-sm font-normal leading-relaxed text-ink/60">
                      {fact.sub}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
              {PROFILE_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink/70 transition-colors hover:text-blueprint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Timeline
        items={items}
        label="Fig. 05.1 — The Journey"
        periodLabel="Present → Past"
        imageSrc="/images/campus-park-intro.jpg"
        imageAlt="Shritej Koneru standing in a campus park"
        imageCaption="Vijayawada, Andhra Pradesh"
      />

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-4 sm:pb-28">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-ink/10 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/65">
            Source · resume and public repositories
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

export default AboutJourney;
