/**
 * Scene 05 — Selected Case Studies.
 *
 * This is *not* a second project list. Every entry here is keyed by the `slug`
 * of a project in `src/data/projects.ts`, and the section resolves the name,
 * description, links, cover and technology chips from that single source of
 * truth. If a slug is missing here, nothing renders — so this file can never
 * drift into a competing list, and removing a project removes its case study.
 *
 * Everything below is transcribed from material that already exists: the project
 * READMEs under github.com/shritej-koneru and the resume that seeded
 * `projects.ts`. Nothing is measured, estimated or invented — if a repository
 * does not document challenges, `tradeoffs` stays empty and the UI hides the
 * block instead of filling it with a plausible-sounding story.
 */

import { projects, type Project } from "@/data/projects";

export type CaseStudyKind = "featured" | "supporting";

/** A short titled note — an engineering decision, trade-off or post-mortem. */
export interface CaseStudyNote {
  title: string;
  body: string;
}

/** A cell in the schematic flow grid below a case study. */
export interface CaseStudyDiagramStep {
  label: string;
  detail: string;
}

export interface CaseStudyDiagram {
  caption: string;
  /** Where the diagram's content comes from, stated on the page. */
  source: string;
  steps: CaseStudyDiagramStep[];
}

/** A real screenshot of the running project (see `public/images/case-studies`). */
export interface CaseStudyVisual {
  src: string;
  alt: string;
  caption: string;
}

export interface CaseStudy {
  /** Must match a `slug` in `src/data/projects.ts`. */
  slug: string;
  kind: CaseStudyKind;
  /** What was actually built and by whom, from the resume/README. */
  role: string;
  /** One line of purpose, shown beside the title. */
  purpose: string;
  problem: string;
  approach: string;
  /** The documented stack — richer than the wheel's summary chips. */
  stack: string[];
  /** Decisions and details lifted from the repository docs. */
  notes: CaseStudyNote[];
  /** Documented trade-offs. Empty when the repository documents none. */
  tradeoffs: CaseStudyNote[];
  /** Verified numbers/outcomes, only where the docs state them. */
  facts: string[];
  diagram: CaseStudyDiagram;
  /** An authentic excerpt of a documented project structure, when one exists. */
  structure?: { caption: string; lines: string[] };
  visual?: CaseStudyVisual;
}

/** A case study joined to its entry in the canonical project list. */
export interface ResolvedCaseStudy extends CaseStudy {
  project: Project;
}

const caseStudyList: CaseStudy[] = [
  // ---------------------------------------------------------------- featured
  {
    slug: "equialert",
    kind: "featured",
    role: "Independent build — interface, API and deployment.",
    purpose:
      "One dark-mode dashboard for Indian markets: live prices, news, watchlists and an AI insights chatbot.",
    problem:
      "Following NSE and BSE means moving between a price screen, a news feed, a watchlist kept somewhere else and a separate tool for questions. EquiAlert holds all four in one dashboard built around Indian market hours, with market status, opening and closing times, and SMS reminders for the sessions that matter.",
    approach:
      "A single TypeScript codebase split three ways — a React client, an Express API and a shared schema both sides import. The client reads server state through TanStack Query, the server persists to PostgreSQL through Drizzle ORM, and a WebSocket channel pushes live prices rather than the browser polling for them.",
    stack: [
      "React 18",
      "TypeScript",
      "Vite",
      "Wouter",
      "TanStack Query",
      "Tailwind CSS",
      "Radix UI / shadcn",
      "Express.js",
      "Drizzle ORM",
      "PostgreSQL (Neon)",
      "WebSocket",
      "Zod",
      "NewsAPI",
      "Groq · Llama 3.3 70B",
      "Twilio",
    ],
    notes: [
      {
        title: "One schema, both sides",
        body: "`shared/schema.ts` holds the definitions the client and the Express server both import, so a shape cannot be valid in one place and wrong in the other.",
      },
      {
        title: "Updates travel one channel",
        body: "Live prices arrive over WebSocket connections maintained by the server, which keeps the dashboard current without a polling loop on the client.",
      },
      {
        title: "Third parties sit behind the API",
        body: "NewsAPI, Groq and Twilio are only ever called from the server's routes and scheduler. The browser never holds one of those keys.",
      },
      {
        title: "Scheduling lives on the server",
        body: "`server/scheduler.ts` fires the timed notifications — market open at 9:15, market close at 3:30, and an evening reminder — instead of a client timer that dies with the tab.",
      },
      {
        title: "Serverless Postgres, typed queries",
        body: "Data lives in PostgreSQL on Neon, reached through Drizzle ORM and wrapped in `server/storage.ts` so routes never build SQL by hand.",
      },
    ],
    tradeoffs: [],
    facts: [
      "Real-time price updates over WebSocket",
      "Watchlist routes: list, add, remove, toggle alerts",
      "News, chat and SMS notification endpoints",
      "Scheduled notifications at market open, market close and in the evening",
    ],
    diagram: {
      caption:
        "System map — how a request and a price update move through the application.",
      source: "transcribed from the project's README architecture section",
      steps: [
        {
          label: "Client",
          detail:
            "React 18 built with Vite. Wouter for routing, TanStack Query for server state, Tailwind with Radix UI primitives for the interface.",
        },
        {
          label: "API",
          detail:
            "Express with TypeScript. Watchlist, profile, market news, the AI chat route and the notification route.",
        },
        {
          label: "Data",
          detail:
            "PostgreSQL on Neon, read and written through Drizzle ORM so queries stay typed end to end.",
        },
        {
          label: "Live channel",
          detail:
            "A WebSocket connection carries live price updates to the dashboard, with market status and indicator colours driving the display.",
        },
        {
          label: "External services",
          detail:
            "NewsAPI for financial news, Groq running Llama 3.3 70B for the chatbot, Twilio for the SMS alerts.",
        },
      ],
    },
    structure: {
      caption: "Project structure",
      lines: [
        "EquiAlert/",
        "├── client/                 # React frontend",
        "│   ├── src/",
        "│   │   ├── components/     # UI components",
        "│   │   ├── pages/          # Route components",
        "│   │   ├── hooks/          # Custom React hooks",
        "│   │   └── lib/            # Utilities and config",
        "│   └── index.html",
        "├── server/                 # Express backend",
        "│   ├── index.ts            # Main server entry",
        "│   ├── routes.ts           # API route definitions",
        "│   ├── storage.ts          # Database layer",
        "│   └── scheduler.ts        # Background tasks",
        "├── shared/                 # Shared types and schemas",
        "│   └── schema.ts           # Database schema definitions",
        "└── package.json            # Dependencies and scripts",
      ],
    },
    visual: {
      src: "/images/case-studies/equialert.jpg",
      alt: "EquiAlert's dark-mode dashboard: the EQUIALERT header with a stock search field, a market status banner reading “Market Closed”, the Market Overview and My Home panels, and the Home / News / Stocks navigation.",
      caption:
        "EquiAlert running at equialert.onrender.com — captured from the live application.",
    },
  },

  // -------------------------------------------------------------- supporting
  {
    slug: "stocks-api",
    kind: "supporting",
    role: "Independent build — API, scrapers and data layer.",
    purpose:
      "A market data microservice that keeps answering when one of its two sources does not.",
    problem:
      "A single market data source is a single point of failure, and the two free ones behave differently. Google Finance answers quickly but frequently returns null volume and market cap; Yahoo Finance gives complete data but is slower and rate-limits sooner.",
    approach:
      "The scraper layer is modular instead of bolted into the routes: an abstract base interface, one implementation per source, a symbol mapper that translates exchange formats, and a factory that owns the fallback. The service then caches what is expensive to fetch, rate-limits its surface and versions itself under /api/v1.",
    stack: [
      "FastAPI",
      "Python",
      "SQLAlchemy 2.0",
      "yfinance",
      "Pandas",
      "NumPy",
      "Beautiful Soup 4",
      "cachetools",
      "slowapi",
      "Loguru",
      "SQLite / PostgreSQL",
      "Uvicorn",
    ],
    notes: [
      {
        title: "The fallback lives in one place",
        body: "`scraper_factory.py` chooses the source and retries the alternate one on failure. Routes ask for a quote and never worry about which source answered.",
      },
      {
        title: "Cache the expensive call",
        body: "An in-memory TTL cache holds quotes for 5 minutes and historical data for an hour, so repeat requests never re-scrape.",
      },
      {
        title: "Keep the health check cheap",
        body: "`/health` deliberately does no heavy work, so uptime pings from monitoring services do not wake the scrapers.",
      },
      {
        title: "Protect the surface",
        body: "slowapi caps traffic at 60 requests per minute per IP before a request reaches a scraper.",
      },
      {
        title: "Version the API",
        body: "Routers are grouped under `/api/v1` — stocks, analytics and chart-ready output — so the surface can change without breaking callers.",
      },
    ],
    tradeoffs: [
      {
        title: "Faster data or complete data",
        body: "Google Finance is quick but returns nulls; Yahoo Finance is complete but slower with tighter limits. Rather than pick a winner, the API takes `source=google|yahoo|auto` and recommends `yahoo` for data quality and `auto` when reliability matters most.",
      },
    ],
    facts: [
      "Technical indicators: SMA, EMA, RSI, MACD and Bollinger Bands",
      "60 requests per minute per IP",
      "5-minute quote cache · 1-hour history cache",
      "SQLite locally, PostgreSQL in production",
      "Four models: Stock, PriceHistory, IndicatorCache, MarketSnapshot",
    ],
    diagram: {
      caption: "Data-source map — the fallback path the service is built around.",
      source: "transcribed from the project's README architecture section",
      steps: [
        {
          label: "Two sources",
          detail:
            "Google Finance read by scraping, Yahoo Finance read through the yfinance library.",
        },
        {
          label: "Scraper factory",
          detail:
            "One entry point that picks a source, maps exchange formats and falls back to the alternate source on failure.",
        },
        {
          label: "Cache",
          detail:
            "In-memory TTL cache in front of the scrapers: quotes and historical data are served from memory when warm.",
        },
        {
          label: "Persistence",
          detail:
            "SQLAlchemy models track symbols, OHLCV history, computed indicators and market snapshots — including which source produced each row.",
        },
        {
          label: "Routers",
          detail:
            "/api/v1 groups the surface: quotes and history, analytics and comparison, and chart-ready endpoints.",
        },
      ],
    },
  },
  {
    slug: "retroos",
    kind: "supporting",
    role: "Started at the Hack Club webOS jam, then extended on my own.",
    purpose:
      "A retro operating system that runs in the browser and boots like an old machine.",
    problem:
      "The idea was a browser desktop that feels like switching on an old computer: a BIOS-style boot sequence, a taskbar, windows you can drag and resize, and applications that live in them. The guide stopped long before the idea did, so it kept growing.",
    approach:
      "Everything rests on one idea in `js/windowManager.js`: an app is an object with an open function, and the window manager owns the frame, title bar, drag, resize and minimise. Adding an app means one new file and one script tag, which is how the desktop grew without the code turning into spaghetti.",
    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "Canvas",
      "Web Audio API",
      "localStorage",
    ],
    notes: [
      {
        title: "One rule: never block the desktop",
        body: "The boot screen used to gate everything behind it, so a hiccup meant a blank page. It is now purely visual — the desktop loads underneath and the boot screen always clears itself on a timer.",
      },
      {
        title: "The blank screen",
        body: "The page loaded, then went blank about a second later, only in Firefox-based browsers. The cause was two things stacked: a service worker taking over the page right after load, and a full-screen CRT flicker animation some renderers disliked. Removing both fixed it everywhere.",
      },
      {
        title: "Caching on GitHub Pages",
        body: "GitHub Pages caches aggressively, so pushes kept serving the old build. Every script and style tag now carries a version query string that is bumped on each real change, which forces the browser to fetch the new files.",
      },
      {
        title: "Positions that stuck",
        body: "Desktop icon positions were saved to localStorage, which froze the layout forever after a single drag. The saving was removed — dragging still works during a session, but a refresh returns the clean grid.",
      },
    ],
    tradeoffs: [],
    facts: [
      "Games included: Snake, Tetris, Pong, Breakout, Minesweeper, 2048, Flappy, Memory and Tic-Tac-Toe",
      "Four virtual desktops, switched with Alt+1 through Alt+4",
      "Five chip-tune tracks generated with the Web Audio API",
      "No framework, no libraries and no build step",
      "Five devlogs written while building it",
    ],
    diagram: {
      caption: "Runtime map — one window manager, one file per application.",
      source: "transcribed from the project's README",
      steps: [
        {
          label: "Entry",
          detail:
            "A single index.html of plain HTML, CSS and JavaScript. No build step — opening the folder runs the OS.",
        },
        {
          label: "Window manager",
          detail:
            "Creates the frame, title bar, buttons, drag and resize, then hands the inside to the app. It was not touched again after the first version.",
        },
        {
          label: "Applications",
          detail:
            "Each app under `js/apps` is an object with an open function, registered with one script tag in index.html.",
        },
        {
          label: "Canvas",
          detail: "The games and Paint draw their frames to canvas.",
        },
        {
          label: "Audio",
          detail:
            "Chip-tune music, background play and interface sound effects are generated through the Web Audio API.",
        },
      ],
    },
    visual: {
      src: "/images/case-studies/retroos.jpg",
      alt: "RetroOS in the browser: a retro desktop of app and game icons — My Computer, NetSurf 95, Terminal, Paint, Snake, Minesweeper and more — above a taskbar with a START button, a clock and four virtual desktops.",
      caption:
        "RetroOS running at shritej-koneru.github.io/retroos — captured from the live build.",
    },
  },
];

/**
 * Case studies joined to their project entry. Entries whose slug no longer
 * exists in `projects.ts` are dropped, so the page can never link to a project
 * that isn't in the canonical list.
 */
export const getCaseStudies = (): ResolvedCaseStudy[] =>
  caseStudyList.flatMap((study) => {
    const project = projects.find((entry) => entry.slug === study.slug);
    return project ? [{ ...study, project }] : [];
  });

/** The one featured case study, or `undefined` if none is flagged. */
export const getFeaturedCaseStudy = (): ResolvedCaseStudy | undefined =>
  getCaseStudies().find((study) => study.kind === "featured");

/** Compact supporting studies shown after the featured one. */
export const getSupportingCaseStudies = (): ResolvedCaseStudy[] =>
  getCaseStudies().filter((study) => study.kind === "supporting");
