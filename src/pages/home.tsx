import { useState } from "react";

import { AboutJourney } from "@/components/sections/about-journey";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { OpenSourceActivity } from "@/components/sections/open-source-activity";
import { TechnicalToolkit } from "@/components/sections/technical-toolkit";
import ContactWithGlobeDemo from "@/components/contact-with-globe-demo";
import BlueprintInkReveal from "@/components/ui/blueprint-ink-reveal";
import InkReveal from "@/components/ui/ink-reveal";
import { usePageTitle } from "@/lib/router";

/** Blueprint paper (#F2F0E9) — stable reference so the canvas never re-inits. */
const MASK_COLOR: [number, number, number] = [242, 240, 233];

/** Two stacked lines on every width; the component condenses each line. */
const NAME_WORDMARK = "SHRITEJ\nKONERU";

/**
 * The home page.
 *
 * Scene 1 — interactive ink reveal over a photograph.
 * Scene 2 — blueprint ink reveal hero: the name is drafted as an outline plate
 *           and uncovered as solid type under the pointer.
 * Scene 3 — the Works Wheel, in `featured-projects.tsx`.
 * Scene 4 — the contribution skyline, in `open-source-activity.tsx`.
 * Scene 5 — about and the journey timeline, in `about-journey.tsx`.
 * Scene 6 — the technical toolkit, in `technical-toolkit.tsx`.
 * Scene 7 — contact, with the wireframe globe and the message form, in
 *           `src/components/ui/contact-with-globe.tsx`.
 *
 * Every scene shares the same blueprint-paper field (#F2F0E9) so the hand-off
 * is a scroll, not a colour cut.
 *
 * The work itself now lives on its own page — one per project, at
 * `/work/<slug>` — so the wheel and the cards beneath it open a project rather
 * than scrolling past a summary of it. See `src/pages/project.tsx`.
 */
export function HomePage() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  usePageTitle("Shritej Koneru");

  return (
    <main className="w-full">
      {/* ------------------------------------------------------------------ */}
      {/* Scene 1 — ink reveal                                                */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="opening"
        aria-label="Opening"
        className="relative h-[100svh] w-full overflow-hidden bg-background"
        onMouseMove={() => setHasInteracted((prev) => prev || true)}
        onTouchStart={() => setHasInteracted((prev) => prev || true)}
      >
        <img
          src="/images/campus-park-intro.jpg"
          alt="Shritej Koneru standing in a campus park"
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
        />

        {/* The brush wipes the ink away at the source component's own speed; the
            uncovered photo then holds for `lifetime` before the ink fades back. */}
        <InkReveal
          maskColor={MASK_COLOR}
          brushSize={150}
          // Revealed area stays uncovered for 10s, then fades back to ink.
          lifetime={10000}
          cleared={revealed}
        />

        <div
          className={`pointer-events-none absolute inset-x-0 bottom-10 z-30 flex justify-center transition-opacity duration-700 ${
            hasInteracted || revealed ? "opacity-0" : "opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="pointer-events-auto rounded-full border border-ink/20 bg-paper/70 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ink/70 backdrop-blur-sm transition-colors hover:border-ink/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Move to uncover
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Scene 2 — blueprint ink reveal hero                                 */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="hero"
        aria-label="Introduction"
        className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-background"
      >
        {/* Engineering grid — restrained, non-interactive backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(17,19,24,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,19,24,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top metadata row */}
        <div className="relative z-10 flex items-center justify-between px-6 py-5 font-mono text-[10px] uppercase tracking-[0.3em] text-ink/45">
          <span>Digital Blueprint</span>
          <span className="text-ink/30">Rev 02 · 2026</span>
        </div>

        {/* Plate + supporting copy, vertically centred */}
        <div className="relative z-10 flex flex-1 flex-col justify-center py-6">
          <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-8">
            <h1 className="sr-only">
              Shritej Koneru — Computer Science Student, Developer and Builder
            </h1>

            <BlueprintInkReveal
              wordmark={NAME_WORDMARK}
              inkRadius={190}
              showCoordinates
              // pan-y keeps vertical scrolling on touch; a tap still reveals.
              className="[touch-action:pan-y]"
            />

            <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-5 text-center sm:mt-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink/55 sm:text-[11px]">
                Computer Science Student · Developer · Builder
              </p>
              <p className="font-display text-xl leading-tight text-ink sm:text-2xl">
                Turning ideas into working software.
              </p>

              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                <a
                  href="#work"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-7 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-paper transition-colors hover:bg-blueprint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Explore Projects
                </a>
                <a
                  href="#about"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/25 px-7 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ink/80 transition-colors hover:border-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  About Me
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-6">
          <span className="flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
            Scroll
            <svg
              width="14"
              height="16"
              viewBox="0 0 14 16"
              fill="none"
              aria-hidden="true"
              className="animate-bounce"
            >
              <path
                d="M7 1v13M2 9l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Featured Projects — dynamic Works Wheel over the central data file   */}
      {/* ------------------------------------------------------------------ */}
      <FeaturedProjects />

      {/* ------------------------------------------------------------------ */}
      {/* Scene 04 — contribution skyline over the live GitHub history         */}
      {/* ------------------------------------------------------------------ */}
      <OpenSourceActivity />

      {/* ------------------------------------------------------------------ */}
      {/* Scene 05 — about and the journey timeline                            */}
      {/* ------------------------------------------------------------------ */}
      <AboutJourney />

      {/* ------------------------------------------------------------------ */}
      {/* Scene 06 — the technical toolkit                                     */}
      {/* ------------------------------------------------------------------ */}
      <TechnicalToolkit />

      {/* ------------------------------------------------------------------ */}
      {/* Scene 07 — contact, with the wireframe globe and the message form    */}
      {/* ------------------------------------------------------------------ */}
      <div id="contact">
        <ContactWithGlobeDemo />
      </div>
    </main>
  );
}

export default HomePage;
