import * as React from "react";

import { revealClass, useInView } from "@/components/case-study/use-in-view";
import { cn } from "@/lib/utils";

/**
 * The foot of the home page — a scene index, and the colophon beneath it.
 *
 * Every page here renders its own `<main>`, and this is the one landmark that
 * sits *outside* it, so `<main>` stays the content and there is still a page
 * level `contentinfo` at the end of the document. The project pages already
 * have a footer of their own (`ProjectFooter` in `@/pages/project`); this is the
 * same construction, so the two read as one family.
 *
 * It is an index rather than a list of destinations on purpose. The contact
 * scene already closes the page with GitHub, LinkedIn, email and a way home —
 * repeating any of them here would be the same links twice. What the page has
 * never had is a way back to the top, or any route between its own sections;
 * at this length that is the gap worth filling.
 *
 * The names are each scene's own, used verbatim, and the numbers are this
 * index's own position count rather than a quote from the sections: the page's
 * eyebrows are inconsistent about numbering, so nothing here is presented as
 * theirs.
 *
 * The hairline grid is `ProjectFooter`'s: a `gap-px` grid on an `ink/10`
 * ground, so the rules between the cells *are* the gap. Small mono text stops
 * at `ink/60`, which clears 4.5:1 on the paper; anything lighter on this page
 * is decoration and is hidden from assistive technology.
 *
 * Below the index is the colophon, which says how the page itself was made —
 * the one thing about this site a visitor cannot read anywhere else on it. It
 * carries a single destination, and that destination is the code rather than a
 * way to reach me, so it repeats nothing the contact scene already offers.
 * See `COLOPHON`.
 */

const SECTIONS = [
  { number: "01", label: "Opening", href: "#opening" },
  { number: "02", label: "Introduction", href: "#hero" },
  { number: "03", label: "Work", href: "#work" },
  { number: "04", label: "Open source", href: "#open-source" },
  { number: "05", label: "Journey", href: "#about" },
  { number: "06", label: "Toolkit", href: "#toolkit" },
  { number: "07", label: "Contact", href: "#contact" },
] as const;

/**
 * What the page itself is made of, for the visitor who reads the bottom of a
 * site to find out — a drawing's title block, in the drawing's own words.
 *
 * Every line is checkable in this repository and nothing here is a claim the
 * code does not already make: the stack is `package.json`, the fonts are
 * `tailwind.config.ts` and the three `index.html` actually loads, and the link
 * is the repository this page is built from.
 */
const COLOPHON: { term: string; detail: string; href?: string }[] = [
  { term: "Built with", detail: "Vite · React · TypeScript · Tailwind CSS" },
  { term: "Set in", detail: "Space Grotesk, Inter and IBM Plex Mono" },
  {
    term: "Source",
    detail: "github.com/shritej-koneru/portfolio",
    href: "https://github.com/shritej-koneru/portfolio",
  },
];

/**
 * One index cell. The ring is inset because the cells share hairlines: an
 * outset ring on a middle cell would be clipped by the row above it.
 */
const CELL_CLASS =
  "group flex min-h-[44px] flex-col justify-center gap-1 bg-background px-5 py-4 transition-colors hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blueprint";

export function SiteFooter() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.05 });
  const index = revealClass(inView, 0);

  /**
   * The stylesheet owns the motion: `html { scroll-behavior: smooth }`, which
   * the `prefers-reduced-motion` block already rewrites to `auto`. So asking
   * for a plain scroll is correct in both cases, and this needs no branch.
   */
  const goToTop = React.useCallback(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <footer
      ref={ref}
      aria-labelledby="colophon-heading"
      className="border-t border-ink/10 bg-background"
    >
      <div
        className={cn("mx-auto max-w-7xl px-6 py-12 sm:px-10", index.className)}
        style={index.style}
      >
        <h2
          id="site-index-heading"
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60"
        >
          Site index
        </h2>

        <nav
          aria-labelledby="site-index-heading"
          className="mt-6 grid gap-px overflow-hidden rounded-xl border border-ink/12 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SECTIONS.map(({ number, label, href }) => (
            <a key={number} href={href} className={CELL_CLASS}>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
                {number}
              </span>
              <span className="font-display text-base text-ink">{label}</span>
            </a>
          ))}
          {/* Seven cells leave one slot spare in the two- and four-column
              grids, and an unfilled slot shows the ground the hairlines are
              drawn on. An empty cell of paper closes the rule. It is hidden at
              one column, where there is no slot to fill. */}
          <span aria-hidden="true" className="hidden bg-background sm:block" />
        </nav>

        {/* The title block. Left says what the page is, right says what it is
            made of — the same editorial split scene 05 uses for its
            introduction, so the two read as one family. */}
        <h2
          id="colophon-heading"
          className="mt-12 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60"
        >
          Colophon
        </h2>

        <div className="mt-6 grid gap-8 border-t border-ink/10 pt-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16">
          <p className="max-w-xl text-pretty text-base leading-relaxed text-ink/70">
            I designed and built this site as well as the work in it. It is a
            static build: the open-source graph is read from a public API, and
            the contact form posts to an endpoint I wrote.
          </p>

          <dl className="space-y-5">
            {COLOPHON.map(({ term, detail, href }) => (
              <div key={term}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
                  {term}
                </dt>
                <dd className="mt-1.5 font-display text-sm text-ink">
                  {href ? (
                    // The 44px touch target is the ::after, not the box. A
                    // `min-h` here would push the value away from its label and
                    // break the rhythm the two rows above keep.
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative inline-flex items-center gap-1.5 underline decoration-ink/25 underline-offset-4 transition-colors after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] hover:text-blueprint hover:decoration-blueprint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {detail}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    detail
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-ink/10 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
            © 2026 Shritej Koneru
          </p>

          <button
            type="button"
            onClick={goToTop}
            aria-label="Back to top"
            className="group inline-flex size-11 shrink-0 items-center justify-center border border-ink/20 text-ink/70 transition-colors hover:border-blueprint hover:text-blueprint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            >
              <path
                d="M12 19V5M5 12l7-7 7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
