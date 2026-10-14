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
the index down the right-hand side scrolls the page to that project's stop.

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
a new entry appears everywhere automatically. Projects are eligible for the
wheel unless marked `featured: false` (those appear under "Also on GitHub").

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

## Scripts

```bash
npm run dev      # local dev server
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```
