import * as React from "react";

import { revealClass, useInView } from "@/components/case-study/use-in-view";
import { SECTIONS } from "@/data/sections";
import { cn } from "@/lib/utils";

/**
 * The foot of the home page — the site index, and the way back to the top.
 *
 * Every page here renders its own `<main>`, and this is the one landmark that
 * sits *outside* it, so `<main>` stays the content and there is still a page
 * level `contentinfo` at the end of the document. The project pages already
 * have a footer of their own (`ProjectFooter` in `@/pages/project`); this is the
 * same construction, so the two read as one family.
 *
 * It used to open on the same summary scene 05 carries, because someone who had
 * read to the very bottom should not have to scroll back up to find out who they
 * had been reading. That summary now sits under the name it belongs to, in the
 * Introduction's about block (`@/components/sections/intro-about`), where it is
 * read on the way in rather than at the end, so repeating it here would only be
 * the same paragraph twice on one page.
 *
 * Below it is the site index. It is an index rather than a list of destinations
 * on purpose: what the page has never had is a way back to the top, or any
 * route between its own sections, and at this length that is the gap worth
 * filling. The names are each scene's own, used verbatim, and the numbers are
 * this index's own position count rather than a quote from the sections: the
 * page's eyebrows are inconsistent about numbering, so nothing here is
 * presented as theirs.
 *
 * The hairline grid is `ProjectFooter`'s: a `gap-px` grid on an `ink/10`
 * ground, so the rules between the cells *are* the gap. Small mono text stops
 * at `ink/60`, which clears 4.5:1 on the paper.
 *
 * There is no rule across the top of it. Scene 08 ends on the same paper as
 * this footer, with the cracked ground fading out a little above it, and a
 * hairline between the two read as a hard cut through a surface that had not
 * actually ended. The rules inside the footer — under its heading, above the
 * copyright — carry the structure on their own.
 */

/**
 * One index cell. The ring is inset because the cells share hairlines: an
 * outset ring on a middle cell would be clipped by the row above it.
 */
const CELL_CLASS =
  "group flex min-h-[44px] flex-col justify-center gap-1 bg-background px-5 py-4 transition-colors hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blueprint";

export function SiteFooter() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.05 });
  const reveal = revealClass(inView, 0);

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
      aria-labelledby="site-index-heading"
      className="bg-background"
    >
      <div
        className={cn("mx-auto max-w-7xl px-6 pt-10 pb-12 sm:px-10", reveal.className)}
        style={reveal.style}
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
        </nav>

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
