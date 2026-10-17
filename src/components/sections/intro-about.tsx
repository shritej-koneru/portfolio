import { revealClass, useInView } from "@/components/case-study/use-in-view";
import { GITHUB_PROFILE } from "@/data/projects";

/**
 * The Introduction's about block — scene 02's answer to "who is this".
 *
 * The summary used to close the page, at the bottom of the site footer. It is
 * here instead because the reader should meet it on the way in, under the name
 * it belongs to and before the work it explains, instead of after every scene
 * has gone by. The footer keeps the site index and nothing else.
 *
 * None of it is written for this block. The role line is verbatim from the
 * description this site already ships (`index.html`), the education and the
 * location are scene 05's resume facts, and the current role is the milestone
 * `@/data/timeline` already carries.
 *
 * The two-column editorial split is scene 05's (`about-journey.tsx`): prose on
 * the left, the facts and the ways to reach me on the right, so the two blocks
 * read as one family. Small mono text stops at `ink/60`, which clears 4.5:1 on
 * the paper; the rules carry the structure, and nothing here is decoration.
 *
 * The reveal is the page's usual one — a single IntersectionObserver, which
 * reduced motion skips, leaving the copy present and readable either way.
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

/** The profile links follow scene 05's, so the two blocks read as one family. */
const LINK_CLASS =
  "inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70 transition-colors hover:text-blueprint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function IntroAbout() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.08 });
  const reveal = revealClass(inView, 0);

  return (
    <div
      ref={ref}
      className={`mx-auto mt-14 w-full max-w-4xl border-t border-ink/10 pt-10 text-left sm:mt-16 ${reveal.className}`}
      style={reveal.style}
    >
      <h2
        id="intro-about-heading"
        className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60"
      >
        About Me
      </h2>

      <div className="mt-6 grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14">
        <div className="space-y-4 text-pretty">
          <p className="font-display text-lg leading-snug text-ink">{ROLE}</p>
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
    </div>
  );
}

export default IntroAbout;
