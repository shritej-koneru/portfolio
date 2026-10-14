# Portfolio — Digital Blueprint

Personal developer portfolio for **shritejkoneru.tech**, built as a "Digital
Blueprint": architectural line-work, ink-reveal interactions and technical
typography.

- **Stack:** Vite + React 18 + TypeScript + Tailwind CSS
- **Deploy:** Vercel (static `dist/`), project `portfolio` on the Custom Craft Team account
- **Branches:** all work happens on `redesign`, and that branch is the Vercel
  project's **production branch** — pushing to it publishes straight to the live
  site (`portfolio-seven-psi-l2qf199nrn.vercel.app`). `main` holds the previous
  design and never receives redesign work.

## Opening scenes

1. **Ink Reveal** (`src/components/ui/ink-reveal.tsx`) — wipe an ink mask off a
   photograph. Each brush stamp grows to full size in `expandMs` (600ms), and the
   uncovered area is held for `lifetime` (10s) before the ink fades back over
   `fadeMs`. The hold is refreshed by every new stamp, so it runs from the moment
   the pointer stops wiping.
2. **Blueprint Ink Reveal hero** (`src/components/ui/blueprint-ink-reveal.tsx`) —
   the name drafted as an outline plate and uncovered as solid type under the
   pointer.

Scene 2 honours `prefers-reduced-motion` by removing the *motion*, not the piece
(it snaps instead of springing). Scene 1 runs the source component's own brush
motion unchanged.

## Pages and routing

The site is a single-page app with two kinds of address, both handled by
`src/lib/router.tsx` — the History API plus `useSyncExternalStore`, so **no
router dependency was added**:

| Address | Renders |
| --- | --- |
| `/` | `src/pages/home.tsx` — the scenes on this page |
| `/work/<slug>` | `src/pages/project.tsx` — one project on its own page |
| anything else | `src/pages/not-found.tsx` — says what was asked for, offers a way back |

- **Every project has a page.** The wheel's cards, the "Open project" link in the
  details panel beneath the wheel and the titles in the "Also on GitHub" list all
  point at `/work/<slug>`. Those are ordinary root-relative `<a>` links, and
  `useRouter` installs one delegated click listener that upgrades them to
  client-side navigation — so a component that knows nothing about routing (the
  wheel, for instance) still links correctly. External links, new tabs, downloads
  and modifier-clicks are left to the browser, and `#section` links stay native.
- **Deep links work.** `vercel.json` already rewrites every path to
  `index.html`, so `/work/equialert` opened cold renders that project rather than
  a 404.
- **The router owns scroll.** A new page starts at its top, or at its anchor — so
  the project page's "← All work" link lands on the wheel rather than at the top
  of the home page — and the back button returns you to where you were.
  `history.scrollRestoration` is set to `manual` so the browser does not fight
  that.

## Featured Projects (Works Wheel)

`src/components/sections/featured-projects.tsx` renders the project showcase.
The wheel (`src/components/ui/works-wheel.tsx`) receives its items through props
— it holds no project list of its own and never assumes a number of projects. A
conventional, static project list is used automatically if the environment can't
run the 3D wheel.

The section is **pinned to the viewport and driven by the page scroll** rather
than by the cursor: the reader sees the ring (circle) first, then the drum
carries each project to the front one after another as they keep scrolling, and
the page carries on to the next section once the last project has been shown.
The wheel does not capture wheel or touch input, so the scrollbar, trackpad,
touch and arrow keys all behave normally.

Scroll length scales with the number of projects — `PIN_STEP_VH` in
`featured-projects.tsx` is the percent of viewport height of scrolling per
project — so adding a project lengthens the section and adds a stop
automatically, with no hardcoded count or index anywhere. Clicking a project in
the index down the right-hand side scrolls the page to that project's stop;
clicking the card itself — or the "Open project" link in the panel below the
wheel — opens that project's own page (see **Pages and routing**).

### Adding a project

Everything comes from one file: **`src/data/projects.ts`**.

1. **Add an object** to the `projects` array:

   ```ts
   {
     slug: "my-project",           // stable id: React key, anchor, cover name
     title: "My Project",
     description: "One or two short sentences.",
     image: "/images/projects/my-project.jpg", // optional
     tech: ["TypeScript", "React"],            // only what you really used
     liveUrl: "https://example.com",           // optional — omit if none
     repoUrl: "https://github.com/...",        // optional — omit if private
     // featured: false,                       // optional — keep it off the wheel
     // status: "In Progress",                 // optional — Completed | In Progress | Prototype
   }
   ```

2. **Add a cover** (optional). Drop a landscape image at
   `public/images/projects/<slug>.jpg` and point `image` at it. Without a cover
   the wheel draws a labelled plate with the project initials, so a project
   still renders if art isn't ready.

3. **Provide links only when they work.** If a project has no public demo or
   repository, leave those fields out — the UI hides the missing action instead
   of rendering a dead link.

The wheel, the details panel and the fallback list all read from this array, so
a new entry appears everywhere automatically — including its own page at
`/work/<slug>`. Projects are eligible for the wheel unless marked
`featured: false` (those appear under "Also on GitHub").

> **Temporary covers:** the current `public/images/projects/*.svg` files are
> generated Digital Blueprint placeholders, not screenshots. Regenerate them with
> `node scripts/generate-project-covers.mjs`, or replace them with real
> screenshots by updating `image` in `src/data/projects.ts`.

### GitHub

Project metadata is curated by hand from the public repositories at
<https://github.com/shritej-koneru>. Curating the project list makes **no**
runtime GitHub API call and uses **no** token. A later integration could
discover repositories and merge them with this manual metadata, but it is not
implemented. (Scene 04 below does read the public contribution graph at
runtime — see there for how and why.)

## Scene 04 — Contribution Skyline

`src/components/sections/open-source-activity.tsx` renders directly after the
Works Wheel: the wheel shows what was built, this shows the activity behind it.
Heading *"Every commit builds something."*, technical label
`04 / OPEN SOURCE ACTIVITY`, and a link to the profile.

The chart itself is `src/components/ui/contribution-skyline.tsx` (the 21st.dev
"Contribution Skyline" component by @kedhareswer), copied in as-is: one canvas,
React the only import, no extra dependency. It draws the year as a heat map and
folds it into an isometric skyline on first sight, with hover/tap day readouts,
arrow-key navigation, legend isolation, a 2D/3D toggle and drag-to-orbit (which
is kept — it double-click-resets and yields vertical scrolling to the page on
touch via `touch-action: pan-y`). The card is coloured through the CSS variables
it already reads (`--color-background`, `--color-foreground`, `--color-border`,
`--color-muted-foreground`), which `PLATE_COLORS` in the section sets to the
ink plate. The scene adds **no** pinned scroll — the Works Wheel owns that.

### Where the contribution data comes from

Real data, always — the scene never draws generated activity.

- GitHub has no unauthenticated REST/GraphQL endpoint for the contribution
  calendar, and `github.com/users/<user>/contributions` is served **without**
  CORS headers, so a static browser app cannot read the graph from github.com.
- `src/data/contributions.ts` therefore reads the public, key-less
  [github-contributions-api](https://github-contributions-api.jogruber.de)
  service, which resolves that same public graph and does send
  `Access-Control-Allow-Origin: *`. **No token, secret or credential is involved
  anywhere, and nothing is stored beyond the page's lifetime.**
- The username is not hardcoded: it is derived from `GITHUB_PROFILE` in
  `src/data/projects.ts`, so changing that URL moves the scene with it.
- Every response is validated (`readContributions`) before it can render: bad
  dates, negative counts and unexpected shapes are dropped, and a payload that
  does not look like a calendar falls back rather than drawing something.

States, all verified in a browser: **loading** reserves the chart's own footprint
(the grid is always 53 weeks × 7 days, so the placeholder uses that ratio capped
at 620px) so the data landing shifts nothing; **empty** (a real year with zero
contributions) and **unavailable** (request failed, timed out after 9s, or the
payload was unrecognisable) both render a short honest note and a link to the
profile. There are no invented counts, streaks or dates, and the total in the
card header is computed from the fetched days.

> To point the scene at a different source, change `CONTRIBUTIONS_ENDPOINT` in
> `src/data/contributions.ts`. To change the colour ramp, edit
> `SKYLINE_PALETTE` in `open-source-activity.tsx`.

## Project pages — behind the build

`src/pages/project.tsx` is what `/work/<slug>` renders. It reads the project from
`src/data/projects.ts` and any build notes from `src/data/case-studies.ts`, both
looked up by slug, and renders one of two things:

- **A project with a case study** gets the full write-up. A `kind: "featured"`
  project opens on the light blueprint plate (`case-study-featured.tsx`) — its
  real screenshot in the widest column, a narrow rail carrying the role,
  `01 / PROBLEM`, `02 / APPROACH` and `03 / TECHNOLOGY` — and continues into the
  dark engineering view (`case-study-engineering.tsx`): the system map, the
  engineering notes, the documented stack and, where the repository publishes
  one, its real project structure. A `kind: "supporting"` project gets the
  compact editorial layout (`case-study-editorial.tsx`), labelled `03 / TRADE-OFF`
  when the repository documents one and `03 / DETAILS` when it does not.
- **A project without one** renders what is verifiable — description,
  technology, status and links, all from `projects.ts` — and says plainly that
  the build notes are not written yet. No problem/approach prose is invented to
  fill the labels, so a page for an undocumented project is short by design.

Either way the page is framed by its own chrome: a sticky bar carrying the way
back to the wheel (`/#work`) and the project's position in the work (`03 / 15`),
and a footer with the previous and next project.

`src/components/case-study/` holds the reusable pieces (`blueprint-backdrop.tsx`
for the grid, ruler and drawn rules, `flow-diagram.tsx` for the schematic,
`screenshot-figure.tsx` for the clip-path screenshot reveal, `common.tsx` for the
labels and notes, `use-in-view.ts` for the single reveal hook). None of them
knows about a specific project, and the actions and technology chips come from
the shared `src/components/project-actions.tsx`, which the Works Wheel uses too.

**No animation library was added.** Reveals are one IntersectionObserver per
block plus CSS transitions, and the blueprint rules are drawn with a single
`stroke-dashoffset` transition. Under `prefers-reduced-motion: reduce` every
block is rendered immediately, the screenshot loses its clip-path and the rules
appear fully drawn. Nothing is pinned, and no scroll or touch input is captured.

### Adding or changing a case study

Case studies are **not** a second project list. `src/data/case-studies.ts` stores
notes keyed by the `slug` of a project in `src/data/projects.ts`, and the page
resolves name, description, links and technology from there — `getCaseStudyBySlug`
finds one, and an entry whose slug is not in the project list is skipped, so the
site can never link to a project that no longer exists.

1. Add or edit an object in `caseStudyList`, with `slug` matching a project.
2. `kind: "featured"` marks the one project that gets the light plate *and* the
   dark engineering view; everything else is `kind: "supporting"` and gets the
   compact editorial layout.
3. Fill only what the repository actually documents. `tradeoffs` stays empty for
   projects that document none, and the UI hides the block rather than inventing
   a story — that is why the featured project has no trade-off section.
4. Screenshots live in `public/images/case-studies/<slug>.jpg` and are referenced
   through `visual`. They are real captures of the running project, not mockups;
   drop the field and a project falls back to its diagram.
5. Nothing else to wire up: the entry gives that project's existing page its full
   write-up.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```
