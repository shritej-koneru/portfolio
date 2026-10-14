/**
 * Single source of truth for the Featured Projects showcase.
 *
 * Every entry here is real: the titles, descriptions and links come from the
 * resume (`client/public/assets/resume.pdf` on `main`) and the public repos at
 * github.com/shritej-koneru. Nothing is invented — if a project has no demo or
 * repository, the corresponding field is simply omitted and the UI hides that
 * action.
 *
 * To add a project, see README.md > "Adding a project".
 */

export type ProjectStatus = "Completed" | "In Progress" | "Prototype";

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
  /** Only set when a working, public demo exists. */
  liveUrl?: string;
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
      "Full-stack dark-mode web app for Indian stock markets with real-time stock tracking, market news, watchlist management and an AI-powered insights chatbot.",
    image: cover("equialert"),
    tech: ["TypeScript", "React", "Node.js", "Python"],
    liveUrl: "https://equialert.onrender.com/",
    repoUrl: "https://github.com/shritej-koneru/EquiAlert",
  },
  {
    slug: "stocks-api",
    title: "Stocks-API",
    description:
      "FastAPI analytics API with real-time quotes, historical data and technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands), powered by dual Google Finance and Yahoo Finance sources with automatic fallback.",
    image: cover("stocks-api"),
    tech: ["Python", "FastAPI", "SQLite", "PostgreSQL"],
    liveUrl: "https://stocks-api-pfay.onrender.com",
    repoUrl: "https://github.com/shritej-koneru/Stocks-API",
  },
  {
    slug: "floatchat-sahe",
    title: "FloatChatSAHE",
    description:
      "AI-powered conversational system for querying and visualising ARGO oceanographic float data in natural language, simplifying access to scientific datasets for researchers and analysts.",
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
      "Premium student-focused service website for laptop optimisation and virtualisation, with a 3D shader hero, scroll storytelling and a full service catalog.",
    image: cover("projectnova"),
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js"],
    liveUrl: "https://bit.ly/projectnovaservices",
    repoUrl: "https://github.com/shritej-koneru/ProjectNOVA",
  },
  {
    slug: "multi-file-conversion",
    title: "Multi-File Conversion",
    description:
      "Batch file conversion across documents, images, audio and video with smart format suggestions and instant downloads.",
    image: cover("multi-file-conversion"),
    tech: ["TypeScript", "React", "Docker", "Shell"],
    liveUrl: "https://multi-file-conversion-1.onrender.com",
    repoUrl: "https://github.com/shritej-koneru/Multi-File-Conversion",
  },
  {
    slug: "ai-study-assistant",
    title: "AI Study Assistant",
    description:
      "Voice-enabled study copilot that helps students understand concepts faster, summarise study material and generate quizzes from notes and PDFs.",
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
      "Android application for managing campus events and coordination workflows, developed for the EPICS program.",
    image: cover("event-management-hub"),
    tech: ["Kotlin", "Android"],
    repoUrl: "https://github.com/shritej-koneru/Event-Management-Hub-EPICS",
  },
  {
    slug: "expense-tracker",
    title: "Expense Tracker",
    description:
      "Fully offline Android app to log income and expenses, categorise transactions and visualise spending patterns through built-in charts and analytics.",
    image: cover("expense-tracker"),
    tech: ["Kotlin", "Android", "SQLite"],
    repoUrl: "https://github.com/shritej-koneru/Expense-Tracker-App",
  },
  {
    slug: "lgc-official-website",
    title: "LGC Official Website",
    description:
      "Responsive portfolio website for LGC (Let's Get Connected) with smooth animations, mobile-first design, dynamic JSON-driven content and GitHub integration.",
    image: cover("lgc-official-website"),
    tech: ["TypeScript", "React", "Vite", "Tailwind CSS", "Framer Motion", "Express.js"],
    // The public repository for this project was removed, so no links are
    // offered here rather than pointing at a dead URL.
  },

  // --- Additional public repositories, kept off the wheel but still linked ---
  {
    slug: "qr-display-hologram",
    title: "QR Display as Hologram",
    description:
      "Hologram-style QR display GIF viewer for ARVR SAHE, with an Express + Supabase backend, security hardening and structured logging.",
    image: cover("qr-display-hologram"),
    tech: ["JavaScript", "Express", "Supabase"],
    repoUrl: "https://github.com/shritej-koneru/QR-display-as-Hologram",
    featured: false,
  },
  {
    slug: "uppalapati-farms-ghee",
    title: "Uppalapati Farms Ghee",
    description: "Storefront website for Uppalapati Farms ghee.",
    image: cover("uppalapati-farms-ghee"),
    tech: ["JavaScript", "HTML", "CSS"],
    repoUrl: "https://github.com/shritej-koneru/uppalapati-farms-ghee",
    featured: false,
  },
  {
    slug: "awssahe",
    title: "AWS SAHE",
    description: "Web project for the AWS student community at SAHE.",
    image: cover("awssahe"),
    tech: ["TypeScript", "JavaScript", "CSS"],
    liveUrl: "https://awssahe.in",
    repoUrl: "https://github.com/shritej-koneru/awssahe",
    featured: false,
  },
  {
    slug: "portfolio",
    title: "Portfolio",
    description:
      "This site — a Digital Blueprint portfolio built with Vite, React and Tailwind.",
    image: cover("portfolio"),
    tech: ["TypeScript", "React", "Vite", "Tailwind CSS"],
    liveUrl: "https://portfolio-custom-craft-team.vercel.app",
    repoUrl: "https://github.com/shritej-koneru/portfolio",
    featured: false,
    status: "In Progress",
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
