import * as React from "react";

import { revealClass, useInView } from "@/components/case-study/use-in-view";
import { GITHUB_PROFILE } from "@/data/projects";
import { cn } from "@/lib/utils";

/**
 * The foot of the home page — who this is, then the site index.
 *
 * Every page here renders its own `<main>`, and this is the one landmark that
 * sits *outside* it, so `<main>` stays the content and there is still a page
 * level `contentinfo` at the end of the document. The project pages already
 * have a footer of their own (`ProjectFooter` in `@/pages/project`); this is the
 * same construction, so the two read as one family.
 *
 * It opens with the summary a footer is the right place for and the rest of the
 * page has no room for: the role, the education, where the work is done from,
 * and the way to reach me. Repeating those here is the one repetition this page
 * allows itself. The contact scene lists the same three destinations and the
 * journey scene lists two of them, and that is the point — someone who has read
 * to the very bottom should not have to scroll back up to find out who they
 * have been reading or how to write to me.
 *
 * None of it is written for the footer. The role line is verbatim from the
 * description this site already ships (`index.html`), the education and the
 * location are scene 05's resume facts, and the current role is the milestone
 * `@/data/timeline` already carries.
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
 * at `ink/60`, which clears 4.5:1 on the paper; anything lighter on this page
 * is decoration and is hidden from assistive technology.
 *
 * There is no rule across the top of it. Scene 08 ends on the same paper as
 * this footer, with the cracked ground fading out a little above it, and a
 * hairline between the two read as a hard cut through a surface that had not
 * actually ended. The rules inside the footer — under its heading, above the
 * copyright — carry the structure on their own.
 */

/** Verbatim from the description this site already ships. */
const ROLE = "Computer Science student, developer and builder.";

/** From the resume, in the shape scene 05 presents its own facts. */
const DETAILS = [
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
  {
    term: "Currently",
    detail: "Campus Innovator, SPARC Foundation",
    sub: "Leading technical initiatives for students",
  },
];

/**
 * The same three destinations the contact scene lists. GitHub uses the one
 * profile URL the rest of the site shares; LinkedIn and the address are
 * declared here in the shape scene 05 declares its own.
 */
const PROFILE_LINKS = [
  { label: "GitHub", href: GITHUB_PROFILE, external: true },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/shritej-koneru-560111324",
    external: true,
  },
  {
    label: "Email",
    href: "mailto:mail4shritejkoneru@gmail.com",
    external: false,
  },
] as const;

const SECTIONS = [
  { number: "01", label: "Opening", href: "#opening" },
  { number: "02", label: "Introduction", href: "#hero" },
  { number: "03", label: "Work", href: "#work" },
  { number: "04", label: "Open source", href: "#open-source" },
  { number: "05", label: "Journey", href: "#about" },
  { number: "06", label: "Toolkit", href: "#toolkit" },
  { number: "07", label: "Contact", href: "#contact" },
  { number: "08", label: "Resume", href: "#resume" },
] as const;

/**
 * One index cell. The ring is inset because the cells share hairlines: an
 * outset ring on a middle cell would be clipped by the row above it.
 */
const CELL_CLASS =
  "group flex min-h-[44px] flex-col justify-center gap-1 bg-background px-5 py-4 transition-colors hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blueprint";

/**
 * The profile links follow scene 05's, so the two blocks read as one family.
 */
const LINK_CLASS =
  "inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70 transition-colors hover:text-blueprint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
      aria-labelledby="footer-about-heading"
      className="bg-background"
    >
      <div
        className={cn("mx-auto max-w-7xl px-6 pt-10 pb-12 sm:px-10", reveal.className)}
        style={reveal.style}
      >
        <h2
          id="footer-about-heading"
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60"
        >
          About
        </h2>

        {/* The summary, and the facts beside it — the same editorial split
            scene 05 uses for its introduction, so the two read as one family. */}
        <div className="mt-6 grid gap-8 border-t border-ink/10 pt-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16">
          <div className="max-w-xl space-y-4 text-pretty">
            <p className="font-display text-lg leading-snug text-ink">
              {ROLE}
            </p>
            <p className="text-base leading-relaxed text-ink/75">
              I build software end to end — the interface, the code and the
              deploy. Most of it starts as something I wanted to exist, and
              I&apos;m going deeper on the other side of that work: REST APIs,
              data pipelines and cloud tooling.
            </p>
          </div>

          <div>
            <dl className="space-y-5">
              {DETAILS.map(({ term, detail, sub }) => (
                <div key={term}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
                    {term}
                  </dt>
                  <dd className="mt-1.5 font-display text-sm text-ink">
                    {detail}
                    <span className="mt-0.5 block font-sans text-sm leading-relaxed text-ink/60">
                      {sub}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-ink/10 pt-4">
              {PROFILE_LINKS.map(({ label, href, external }) => (
                <a
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className={LINK_CLASS}
                >
                  {label}
                  {external && <span aria-hidden="true">↗</span>}
                </a>
              ))}
            </div>
          </div>
        </div>

        <h2
          id="site-index-heading"
          className="mt-12 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60"
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
