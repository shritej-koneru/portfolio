/**
 * Single source of truth for the Featured Projects showcase.
 *
 * Every entry here is real. The titles, technologies and links come from the
 * resume (`client/public/assets/resume.pdf` on `main`) and the public repos at
 * github.com/shritej-koneru; the one-line descriptions are written for this
 * page from what those two sources state. Nothing is claimed that they do not
 * back — if a project has no demo or repository, the corresponding field is
 * simply omitted and the UI hides that action.
 *
 * To add a project, see README.md > "Adding a project".
 */

export type ProjectStatus = "Completed" | "In Progress" | "Prototype";

/**
 * What a project's primary link opens.
 *
 * These are not interchangeable. A deployed web app, an API with no interface
 * and a site that went live for a real client are all *live*, but only one of
 * them is a demo — so the project says which it is and the button names what
 * the reader will actually find on the other side.
 */
export type ProjectLiveKind = "demo" | "api" | "site";

export interface Project {
  /** Stable id. Used for React keys, anchors and the cover filename. */
  slug: string;
  title: string;
  /** One or two sentences. Keep it short — this sits beside the wheel. */
  description: string;
  /** Optional cover. Relative path in /public, or any URL an <img> accepts. */
  image?: string;
  /** Technologies actually used. */
  tech: string[];
  /** A public deployment a reader can open. */
  liveUrl?: string;
  /** What `liveUrl` opens. Defaults to `"demo"` when omitted. */
  liveKind?: ProjectLiveKind;
  /**
   * A GitHub release a reader can download and install. This is how the
   * Android apps ship, since there is nothing to open in a browser — so this
   * replaces `liveUrl` for them rather than sitting beside a demo that is not
   * there.
   */
  releaseUrl?: string;
  /** Only set when the repository is public. */
  repoUrl?: string;
  /** Eligible for the wheel unless explicitly `false`. */
  featured?: boolean;
  status?: ProjectStatus;
}

export const GITHUB_PROFILE = "https://github.com/shritej-koneru";

/** Temporary Digital Blueprint covers — see scripts/generate-project-covers.mjs */
const cover = (slug: string) => `/images/projects/${slug}.svg`;

export const projects: Project[] = [
  {
    slug: "equialert",
    title: "EquiAlert",
    description:
      "Dashboard for the Indian stock market: live prices, market news, watchlists and a chatbot that answers questions about a stock.",
    image: cover("equialert"),
    tech: ["TypeScript", "React", "Node.js", "Python"],
    liveUrl: "https://equialert.onrender.com/",
    repoUrl: "https://github.com/shritej-koneru/EquiAlert",
  },
  {
    slug: "stocks-api",
    title: "Stocks-API",
    description:
      "FastAPI analytics API for quotes, historical prices and technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands), read from Google Finance and Yahoo Finance with automatic fallback between the two.",
    image: cover("stocks-api"),
    tech: ["Python", "FastAPI", "SQLite", "PostgreSQL"],
    liveUrl: "https://stocks-api-pfay.onrender.com",
    // No interface to demo: what is deployed is the API itself.
    liveKind: "api",
    repoUrl: "https://github.com/shritej-koneru/Stocks-API",
  },
  {
    slug: "floatchat-sahe",
    title: "FloatChatSAHE",
    description:
      "Chat interface for ARGO oceanographic float data — ask in plain language and see the readings plotted.",
    image: cover("floatchat-sahe"),
    tech: ["JavaScript", "Python", "SQL", "Google Cloud"],
    repoUrl: "https://github.com/shritej-koneru/FloatChatSAHE",
  },
  {
    slug: "friday",
    title: "FRIDAY",
    description:
      "Windows voice assistant with speech-to-text, text-to-speech, wake-word detection and pluggable AI providers (Ollama, OpenAI, Gemini, Grok).",
    image: cover("friday"),
    tech: ["Python", "Ollama", "Speech APIs"],
    repoUrl: "https://github.com/shritej-koneru/FRIDAY-Personal-Assistant",
  },
  {
    slug: "projectnova",
    title: "ProjectNOVA",
    description:
      "Service site for student laptop optimisation and virtualisation, with a 3D shader hero, a scroll-driven story and a full service catalogue.",
    image: cover("projectnova"),
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js"],
    liveUrl: "https://projectnova.s.gy/nova",
    // A client service site that is online under its own name, not a demo.
    liveKind: "site",
    repoUrl: "https://github.com/shritej-koneru/ProjectNOVA",
  },
  {
    slug: "multi-file-conversion",
    title: "Multi-File Conversion",
    description:
      "Batch file conversion for documents, images, audio and video, with format suggestions for each file.",
    image: cover("multi-file-conversion"),
    tech: ["TypeScript", "React", "Docker", "Shell"],
    liveUrl: "https://multi-file-conversion-1.onrender.com",
    repoUrl: "https://github.com/shritej-koneru/Multi-File-Conversion",
  },
  {
    slug: "ai-study-assistant",
    title: "AI Study Assistant",
    description:
      "Browser-based study tool with voice input that summarises notes and PDFs and turns them into quizzes.",
    image: cover("ai-study-assistant"),
    tech: ["JavaScript", "HTML", "CSS"],
    repoUrl: "https://github.com/shritej-koneru/AI-Study-Assistant",
  },
  {
    slug: "retroos",
    title: "RetroOS",
    description:
      "Retro-themed operating system running entirely in the browser with a BIOS boot sequence, CRT display effects, draggable windows and multi-desktop support.",
    image: cover("retroos"),
    tech: ["JavaScript", "HTML", "CSS"],
    liveUrl: "https://shritej-koneru.github.io/retroos/",
    repoUrl: "https://github.com/shritej-koneru/retroos",
  },
  {
    slug: "event-management-hub",
    title: "Event Management Hub",
    description:
      "Android app for managing campus events, built for the EPICS programme.",
    image: cover("event-management-hub"),
    // Written in Java: only the Gradle build files are Kotlin.
    tech: ["Java", "Android"],
    repoUrl: "https://github.com/shritej-koneru/Event-Management-Hub-EPICS",
  },
  {
    slug: "expense-tracker",
    title: "Expense Tracker",
    description:
      "Offline Android app for logging income and expenses, with categories and charts showing where the money goes.",
    image: cover("expense-tracker"),
    tech: ["Kotlin", "Android", "SQLite"],
    // Installed rather than visited, so the release is the way in. The tag is
    // literally "Prototype", which is where the status comes from.
    releaseUrl:
      "https://github.com/shritej-koneru/Expense-Tracker-App/releases/latest",
    repoUrl: "https://github.com/shritej-koneru/Expense-Tracker-App",
    status: "Prototype",
  },
  {
    slug: "lgc-official-website",
    title: "LGC Official Website",
    description:
      "Website built for LGC (Let's Get Connected), with JSON-driven content and GitHub integration.",
    image: cover("lgc-official-website"),
    tech: ["TypeScript", "React", "Vite", "Tailwind CSS", "Framer Motion", "Express.js"],
    // The site is offline and its repository was removed, so this entry offers
    // no links at all rather than pointing at either dead end. It is the only
    // project here with no outbound action, and that is the honest state.
  },

  // --- Additional public repositories, kept off the wheel but still linked ---
  {
    slug: "qr-display-hologram",
    title: "QR Display as Hologram",
    description:
      "Hologram-style QR display and GIF viewer for ARVR SAHE, with an Express and Supabase backend.",
    image: cover("qr-display-hologram"),
    tech: ["JavaScript", "Express", "Supabase"],
    repoUrl: "https://github.com/shritej-koneru/QR-display-as-Hologram",
    featured: false,
  },
  {
    slug: "uppalapati-farms-ghee",
    title: "Uppalapati Farms Ghee",
    description: "Storefront for Uppalapati Farms' ghee.",
    image: cover("uppalapati-farms-ghee"),
    tech: ["JavaScript", "HTML", "CSS"],
    repoUrl: "https://github.com/shritej-koneru/uppalapati-farms-ghee",
    featured: false,
  },
  {
    slug: "awssahe",
    title: "AWS SAHE",
    description:
      "Official site for the AWS Student Builder Club at Siddhartha University.",
    image: cover("awssahe"),
    tech: ["TypeScript", "JavaScript", "CSS"],
    liveUrl: "https://www.awssahe.in",
    // The club's real site on its own domain, not a demo instance.
    liveKind: "site",
    repoUrl: "https://github.com/shritej-koneru/awssahe",
    featured: false,
  },
];

/**
 * Projects eligible for the wheel. Any project is eligible unless it opts out
 * with `featured: false`, so adding a new entry above shows it automatically.
 */
export const getFeaturedProjects = (): Project[] =>
  projects.filter((project) => project.featured !== false);

/** Everything else, surfaced as a plain list beneath the wheel. */
export const getOtherProjects = (): Project[] =>
  projects.filter((project) => project.featured === false);
