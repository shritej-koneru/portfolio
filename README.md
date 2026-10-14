# Portfolio — Digital Blueprint

Personal developer portfolio for **shritejkoneru.tech**, built as a "Digital
Blueprint": architectural line-work, ink-reveal interactions and technical
typography.

- **Stack:** Vite + React 18 + TypeScript + Tailwind CSS
- **Deploy:** Vercel (static `dist/`)
- **Active branch:** `redesign` (preview deploys from this branch)

## Opening scenes

1. **Ink Reveal** (`src/components/ui/ink-reveal.tsx`) — carve an ink mask off a
   photograph.
2. **Blueprint Ink Reveal hero** (`src/components/ui/blueprint-ink-reveal.tsx`) —
   the name drafted as an outline plate and uncovered as solid type under the
   pointer.

## Featured Projects (Works Wheel)

`src/components/sections/featured-projects.tsx` renders the project showcase.
The interactive wheel (`src/components/ui/works-wheel.tsx`) receives its items
through props — it holds no project list of its own and never assumes a number
of projects. A conventional, static project list is used automatically if the
environment can't run the 3D wheel.

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
<https://github.com/shritej-koneru>. There is **no** runtime GitHub API call and
**no** token in the browser code. A later integration could discover repositories
and merge them with this manual metadata, but it is not implemented.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```
