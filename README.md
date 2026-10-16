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

## Scene 05 — About & the Journey

`src/components/sections/about-journey.tsx` closes the page: the paper plate
after the ink of the skyline. Label `05 / THE JOURNEY`, heading *"The path so
far."*, a short introduction with the facts that are actually known (degree,
city) and the two profile links, then the timeline.

`src/components/ui/timeline.tsx` renders the milestones in **two layouts from one
piece of data**:

- **Motion allowed and the viewport at least 640px tall** — a pinned horizontal
  track, on a phone as well as a desktop. The heading and the introduction stay in
  the page's normal flow; the timeline band then holds the viewport while the
  reader keeps scrolling, carrying a rule and the milestones that belong to it
  from right to left. The milestones alternate above and below the line at every
  width — that alternation is load-bearing, not cosmetic: it is what keeps two
  milestones on the same side a full `item + gap` apart, so a copy block can never
  read through its neighbour. They are one chronology read in order.
- **`prefers-reduced-motion: reduce`, a viewport shorter than 640px, or a motion
  layer that could not be built** — a compact vertical `<ol>` with no pin, no
  scrub and no grid decoration. Nothing is held behind an animation, so the
  milestones are on the page even if the script never runs.

## Scene 06 — Technical Toolkit

`src/components/sections/technical-toolkit.tsx` is the ruled plate at the end of
the page. It renders the 34 technologies from `src/data/toolkit.ts`, grouped into
Languages, Web, Backend and Tools. The tab row is an accessible ARIA tablist
with roving focus, Home/End and arrow keys, and a measured sliding ink pill.
The grid reuses the Logo Cloud 2 corner-plus pattern with full-bleed top/bottom
rules and gap hairlines. Each tile is a whole-cell button (for valid HTML, a
button with links outside it) showing the projects that use it, and it opens an
inline detail panel that stays at a reserved height (no layout shifts). Project
links go to the existing `/work/<slug>` pages, and everything honours
`prefers-reduced-motion`. C++ is marked "Exploring" with its Cisco C++ Essentials
source; the rest of the "exploring" legend is derived from the data.

Both pinned layouts are one implementation driven by two geometry sets: `WIDE`
(`head`/`item`/`gap` in `vw`, `pinPerItem` in `vh`) and `NARROW` (a wider column,
a shorter pin per milestone), tuned so the track travels about 1.65px sideways per
1px of scroll in both. The copy's offset from the rule and the stem length come
from the same set, so the geometry follows the viewport without a second code
path. The rule itself runs across the middle of the band at both sizes.

The pinned band is `position: sticky` inside a spacer whose height is
`calc(110vh + milestones × pinPerItem)` — 14vh per milestone on a wide screen,
12vh on a narrow one; GSAP (`gsap/ScrollTrigger`) is used **only** to
scrub the animation against the scroll — `start: "top top"`, `end: "bottom
bottom"`, **no** `pin: true` — so nothing is inserted into the document, the
`#about` anchor stays honest, and the layout cannot shift when the bundle lands,
because the height is reserved before any script runs. Track width, pin length
and each milestone's reveal time are all computed from the number of milestones,
so there is no hardcoded count anywhere.

A copy's lines rise once the block has arrived, and the reveal is bounded at both
ends: it starts when the block is on screen and it always **finishes before the
block's leading edge reaches the left of the screen**, so the last lines never
rise while the block is already on its way out. The pop is defined as a travel
distance (`revealTravel`, in `vw`) rather than a share of the timeline, so it
takes the same amount of scrolling whatever the milestone count — and it has to
fit inside `100 - item` `vw`, the stretch in which a block is wholly on screen.
On a phone that stretch is only 18vw, so the pop there is a short, deliberate
snap (measured: it runs with the block fully visible, straddling the middle of
the screen) rather than the long rise the wide layout gets.

Two deliberate colour choices on the paper plate: technical blue is the **draft
line work** (the rule and the stems), the milestone markers are **solid ink** so
each point reads as the anchor it is, and everything meant to be read is ink.
Measured on `#F2F0E9`, blueprint `#5977E8` is 3.52:1 — below AA for small text —
so the milestone dates, descriptions and annotations use ink at 65–70%
(4.7:1 to 6.5:1) rather than blue, and the single milestone link is ink at 75%
with a hairline underline that turns blue on hover. The markers are ink for the
same reason: the anchor points are the strongest thing on the rule (≈16:1), and
no colour outside the palette is introduced for one element.

### Adding a milestone

Everything comes from one file: **`src/data/timeline.ts`**.

1. Append an object to `milestoneList`:

   ```ts
   {
     id: "my-milestone",     // stable id: React key and animation hook
     start: "2026-08",       // YYYY-MM — the list sorts on this
     period: "Aug 2026",     // what the reader sees
     title: "What it was",
     organisation: "Where",  // optional — the line is hidden when omitted
     description: "One short sentence.",
     category: "Learning",   // Education | Leadership | Learning
     note: "Score 92%",      // optional — a small technical annotation
     href: "/work/thing",    // optional — only when the link really exists
     linkLabel: "See the project", // optional — defaults to "Open"
   }
   ```

2. Nothing else to wire up. The list is sorted chronologically (`start`) and the
   section lengthens its own scroll, adds a stop and re-times the reveals for the
   new count.

3. **Do not invent milestones.** Every entry is copied from
   `Shritej_Koneru_Resume_2page.pdf` — education, leadership roles and selected
   learning. A milestone that is not in the resume does not belong here, and a
   missing `href` is left off rather than pointed at a guessed URL. Only one
   milestone links anywhere: the Web Designer role links to `/work/awssahe`,
   the page of the community site that already exists in
   `src/data/projects.ts`.

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

**The project pages add no animation library.** Reveals are one
IntersectionObserver per block plus CSS transitions, and the blueprint rules are
drawn with a single `stroke-dashoffset` transition. Under
`prefers-reduced-motion: reduce` every block is rendered immediately, the
screenshot loses its clip-path and the rules appear fully drawn. Nothing is
pinned, and no scroll or touch input is captured. (Scene 05's timeline is the
one part of the site that uses GSAP — see there.)

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

## Scene 07 - Contact

The form in `src/components/ui/contact-with-globe.tsx` posts to an endpoint that
emails the message on through [Resend](https://resend.com). The endpoint lives in
`server/`, and it is deliberately small: one file, no dependencies. Node's
`fetch` talks to Resend's REST API directly, so there is nothing to install and
the cold start on a free instance stays short.

### Running it

The front end needs one variable, baked in at build time:

```bash
VITE_CONTACT_ENDPOINT=https://<your-service>.onrender.com/api/contact
```

Left unset the form still renders, but submitting says it is not connected
rather than pretending to send. `.env.example` carries it.

The endpoint reads its own settings from the environment, so no secret is ever
put in `.env`:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Required. From `resend.com/api-keys`. |
| `CONTACT_TO_EMAIL` | Where messages land. Defaults to the address in the contact section. |
| `CONTACT_FROM_EMAIL` | The sender. `onboarding@resend.dev` until a domain is verified — Resend then only delivers to the account's own address. |
| `CONTACT_FROM_NAME` | Display name on the notification. |
| `ALLOWED_ORIGINS` | Comma-separated origins. Blank accepts any — the endpoint keeps no session, no cookie and no stored data. |

To run it locally, `cd server && npm start` on Node 20 or newer with
`RESEND_API_KEY` in the environment. `GET /health` answers `{"ok":true}`, which
is both the host's health check and the URL a keep-warm ping should hit.

### Deploying

`render.yaml` describes the service, so Render can create it from this
repository: **New → Blueprint**, choose the repo, and supply the secrets it asks
for. The site itself still deploys separately — it is a static bundle and does
not need this service running in order to render.

One consequence of hosting it there: a free Render instance sleeps after 15
minutes idle, so the first message after a quiet spell can take up to a minute to
send. If that matters, point a free uptime monitor at `/health` every 10 minutes,
or move the endpoint somewhere without cold starts.

### What arrives

The notification carries the message and everything useful for judging whether
to reply: name, email and company; the time it was sent in UTC and in the
visitor's own timezone; the page they sent it from and the page they arrived
through; their browser, language and IP. `reply_to` is set to the visitor's
address, so hitting Reply goes straight back to them.

Two things keep it from being a spam pipe: a form-filling honeypot (`website` —
hidden, unfocusable, and any submission that fills it is rejected) and a limit of
five messages per IP per minute.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```
