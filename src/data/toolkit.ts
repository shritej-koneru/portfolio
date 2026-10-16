/**
 * Single source of truth for Scene 06 — the Technical Toolkit.
 *
 * Two kinds of evidence put a technology on this list, and nothing else does:
 *
 *  1. A project. `projectIds` holds slugs from `@/data/projects`, and the
 *     projects are resolved through that same array at render time — so the
 *     toolkit and the project pages can never disagree, and a project that
 *     leaves the portfolio quietly leaves these tiles too.
 *
 *  2. The resume, when no project backs the claim. Those entries carry a
 *     `source` string instead, and the tile says where the claim comes from
 *     rather than inventing usage for it.
 *
 * Nothing here is scored, rated or dated: no levels, no percentages, no years.
 * A technology is either in the toolkit or it is not.
 *
 * To add a technology, add one object. The counts on the tabs, the group sizes
 * and the "exploring" legend are all derived from this list.
 */

import { projects, type Project } from "@/data/projects";

export type ToolkitCategoryId = "languages" | "web" | "backend" | "tools";

export interface ToolkitCategory {
  id: ToolkitCategoryId;
  label: string;
}

export interface Technology {
  /** Stable identity. Used for React keys, the detail panel, and nothing else. */
  id: string;
  name: string;
  category: ToolkitCategoryId;
  /**
   * Slugs from `@/data/projects`. Empty when no project in the portfolio uses
   * this technology — in that case `source` explains the claim instead.
   */
  projectIds: string[];
  /** Where the claim comes from when no project backs it. */
  source?: string;
  /** True while this is still being learned rather than used day to day. */
  learning?: boolean;
  /**
   * Optional mark. Deliberately unset everywhere: a real logo asset has to be
   * added per technology, and a stand-in would be a claim we cannot back. The
   * tiles are designed to read the same with or without one.
   */
  logo?: { src: string; alt: string };
}

export const CATEGORIES: ToolkitCategory[] = [
  { id: "languages", label: "Languages" },
  { id: "web", label: "Web" },
  { id: "backend", label: "Backend" },
  { id: "tools", label: "Tools" },
];

export const technologies: Technology[] = [
  // Languages
  {
    id: "java",
    name: "Java",
    category: "languages",
    projectIds: [],
    source: "NPTEL · Programming in Java (Elite)",
  },
  {
    id: "python",
    name: "Python",
    category: "languages",
    projectIds: ["equialert", "stocks-api", "floatchat-sahe", "friday"],
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "languages",
    projectIds: [
      "equialert",
      "projectnova",
      "multi-file-conversion",
      "lgc-official-website",
      "awssahe",
      "portfolio",
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "languages",
    projectIds: [
      "floatchat-sahe",
      "ai-study-assistant",
      "retroos",
      "qr-display-hologram",
      "uppalapati-farms-ghee",
      "awssahe",
    ],
  },
  { id: "sql", name: "SQL", category: "languages", projectIds: ["floatchat-sahe"] },
  {
    id: "kotlin",
    name: "Kotlin",
    category: "languages",
    projectIds: ["event-management-hub", "expense-tracker"],
  },
  { id: "c", name: "C", category: "languages", projectIds: [], source: "Resume · languages" },
  {
    id: "cpp",
    name: "C++",
    category: "languages",
    projectIds: [],
    source: "Cisco · C++ Essentials 1 & 2",
    learning: true,
  },

  // Web
  {
    id: "react",
    name: "React",
    category: "web",
    projectIds: [
      "equialert",
      "projectnova",
      "multi-file-conversion",
      "lgc-official-website",
      "portfolio",
    ],
  },
  {
    id: "html5",
    name: "HTML5",
    category: "web",
    projectIds: ["ai-study-assistant", "retroos", "uppalapati-farms-ghee"],
  },
  {
    id: "css3",
    name: "CSS3",
    category: "web",
    projectIds: ["ai-study-assistant", "retroos", "uppalapati-farms-ghee", "awssahe"],
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "web",
    projectIds: ["projectnova", "lgc-official-website", "portfolio"],
  },
  {
    id: "vite",
    name: "Vite",
    category: "web",
    projectIds: ["lgc-official-website", "portfolio"],
  },
  { id: "nextjs", name: "Next.js", category: "web", projectIds: ["projectnova"] },
  {
    id: "framer-motion",
    name: "Framer Motion",
    category: "web",
    projectIds: ["projectnova", "lgc-official-website"],
  },
  { id: "threejs", name: "Three.js", category: "web", projectIds: ["projectnova"] },

  // Backend
  { id: "nodejs", name: "Node.js", category: "backend", projectIds: ["equialert"] },
  {
    id: "express",
    name: "Express.js",
    category: "backend",
    projectIds: ["lgc-official-website", "qr-display-hologram"],
  },
  {
    id: "rest-apis",
    name: "REST APIs",
    category: "backend",
    projectIds: [],
    source: "Resume · backend",
  },
  { id: "fastapi", name: "FastAPI", category: "backend", projectIds: ["stocks-api"] },
  {
    id: "sqlite",
    name: "SQLite",
    category: "backend",
    projectIds: ["stocks-api", "expense-tracker"],
  },
  { id: "postgresql", name: "PostgreSQL", category: "backend", projectIds: ["stocks-api"] },
  {
    id: "supabase",
    name: "Supabase",
    category: "backend",
    projectIds: ["qr-display-hologram"],
  },

  // Tools
  { id: "git", name: "Git", category: "tools", projectIds: [], source: "Every public repository" },
  {
    id: "github",
    name: "GitHub",
    category: "tools",
    projectIds: [],
    source: "github.com/shritej-koneru",
  },
  { id: "docker", name: "Docker", category: "tools", projectIds: ["multi-file-conversion"] },
  { id: "vscode", name: "VS Code", category: "tools", projectIds: [], source: "Resume · tools" },
  {
    id: "android-studio",
    name: "Android Studio",
    category: "tools",
    projectIds: ["event-management-hub", "expense-tracker"],
  },
  { id: "ollama", name: "Ollama", category: "tools", projectIds: ["friday"] },
  { id: "shell", name: "Shell", category: "tools", projectIds: ["multi-file-conversion"] },
  {
    id: "google-cloud",
    name: "Google Cloud Console",
    category: "tools",
    projectIds: ["floatchat-sahe"],
  },
  { id: "postman", name: "Postman", category: "tools", projectIds: [], source: "Resume · tools" },
  { id: "figma", name: "Figma", category: "tools", projectIds: [], source: "Resume · tools" },
  {
    id: "linux",
    name: "Linux",
    category: "tools",
    projectIds: [],
    source: "Cisco · Linux Essentials",
  },
];

export interface ToolkitGroup extends ToolkitCategory {
  items: Technology[];
  /** Derived, never hand-written — the tab and its panel read from this. */
  count: number;
}

/** The categories in display order, each with its technologies and its count. */
export function getToolkitGroups(): ToolkitGroup[] {
  return CATEGORIES.map((category) => {
    const items = technologies.filter((tech) => tech.category === category.id);
    return { ...category, items, count: items.length };
  });
}

export function getTechnologyById(id: string): Technology | undefined {
  return technologies.find((tech) => tech.id === id);
}

/**
 * Resolves a technology's `projectIds` against the real project data, so a tile
 * links to the same titles and addresses the rest of the site uses. An id that
 * no longer exists is dropped rather than rendered as a dead link.
 */
export function getTechnologyProjects(tech: Technology): Project[] {
  return tech.projectIds
    .map((id) => projects.find((project) => project.slug === id))
    .filter((project): project is Project => Boolean(project));
}

/** The technologies still being learned — drives the legend under the grid. */
export function getLearningTechnologies(): Technology[] {
  return technologies.filter((tech) => tech.learning);
}
