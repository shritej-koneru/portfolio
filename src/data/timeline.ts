/**
 * Scene 05 — the journey.
 *
 * Every entry here is real. The facts come from the resume
 * (`Shritej_Koneru_Resume_2page.pdf`) — education, the leadership roles and the
 * selected certifications are copied from it, not written for the layout. If an
 * entry is not in the resume, it does not belong here.
 *
 * This is a plain data file, not a second project list: milestones are their own
 * content and nothing is pulled from `projects.ts` except where a milestone
 * points at a project page that already exists.
 *
 * ## Adding a milestone
 *
 * Append an object to `milestoneList` below and it appears — the timeline is
 * built from the array and never assumes a number of items.
 *
 * ```ts
 * {
 *   id: "my-milestone",     // stable id: React key, scroll anchors, animation hooks
 *   start: "2026-08",       // YYYY-MM — the list sorts on this
 *   period: "Aug 2026",     // what the reader sees
 *   title: "What it was",
 *   organisation: "Where",  // optional — hidden when omitted
 *   description: "One short sentence.",
 *   category: "Learning",   // Education | Leadership | Learning
 *   note: "Score 92%",      // optional — a small technical annotation
 *   href: "/work/thing",    // optional — only when the link really exists
 *   linkLabel: "See the project", // optional — defaults to "Open"
 * }
 * ```
 */

export type MilestoneCategory = "Education" | "Leadership" | "Learning";

/** The shape the timeline component renders. Nothing else is required. */
export interface Milestone {
  /** Stable id. Used for React keys and as the animation hook. */
  id: string;
  /** Machine date, `YYYY-MM`. The timeline sorts on this. */
  start: string;
  /** End date, `YYYY-MM`. Omit for a single date or something ongoing. */
  end?: string;
  /** The period as the reader sees it, e.g. `2024 – 2028`. */
  period: string;
  title: string;
  /** Institution, organisation or programme. Hidden when omitted. */
  organisation?: string;
  description: string;
  category: MilestoneCategory;
  /** A short technical annotation — a score, a mode of study. */
  note?: string;
  /** Only set when the link genuinely exists. */
  href?: string;
  /** Text for `href`. Defaults to "Open". */
  linkLabel?: string;
}

/**
 * Chronological. Two entries that share a month keep the order they are written
 * in here, which is why `sort` is stable rather than a tie-broken comparison.
 */
const milestoneList: Milestone[] = [
  {
    id: "school-cbse",
    start: "2012-06",
    end: "2022-05",
    period: "2012 – 2022",
    title: "10th Grade — CBSE",
    organisation: "Veeramachaneni Paddayya Siddhartha Public School, Vijayawada",
    description:
      "Secondary education, with a foundation in science and mathematics.",
    category: "Education",
    note: "72.6%",
  },
  {
    id: "intermediate-mpc",
    start: "2022-06",
    end: "2024-05",
    period: "2022 – 2024",
    title: "Intermediate — MPC",
    organisation: "Krishna Reddy Sri Chaitanya, Vijayawada",
    description: "Mathematics, Physics and Chemistry.",
    category: "Education",
    note: "86.8%",
  },
  {
    id: "btech-cse",
    start: "2024-07",
    period: "2024 – 2028",
    title: "B.Tech in Computer Science",
    organisation: "Siddhartha Academy of Higher Education, Vijayawada",
    description:
      "Software engineering, AI-enabled products and mobile application development.",
    category: "Education",
    note: "CGPA 8.64",
  },
  {
    id: "python-essentials",
    start: "2024-10",
    end: "2024-11",
    period: "Oct – Nov 2024",
    title: "Python Essentials 1 & 2",
    organisation: "Cisco Networking Academy",
    description:
      "Two-part foundation in Python, taken alongside the first year of the degree.",
    category: "Learning",
    note: "Certified",
  },
  {
    id: "android-developer",
    start: "2025-06",
    end: "2025-12",
    period: "Jun – Dec 2025",
    title: "Google Android Developer",
    organisation: "EduSkills / AICTE",
    description:
      "Certification in Android development, followed by a virtual internship with the same programme.",
    category: "Learning",
    note: "Certification + internship",
  },
  {
    id: "build-with-ai",
    start: "2025-09",
    period: "Sep 2025",
    title: "Build with AI: Intro to Gemini 2.0 Flash",
    organisation: "L4G Solutions / India Edu Program",
    description:
      "Hands-on introduction to building with Google's Gemini models.",
    category: "Learning",
    note: "Workshop",
  },
  {
    id: "technovate-ideate",
    start: "2025-09",
    period: "Sep 2025 – Present",
    title: "Ideate Station Executive",
    organisation: "TechnoVate-SAHE",
    description:
      "Screening and refining student ideas into actionable proposals through brainstorming sessions.",
    category: "Leadership",
    note: "On-campus",
  },
  {
    id: "nptel-java",
    start: "2025-10",
    period: "Oct 2025",
    title: "Programming in Java",
    organisation: "NPTEL / IIT Kharagpur",
    description: "Twelve-week course, completed with Elite certification.",
    category: "Learning",
    note: "Elite · 61%",
  },
  {
    id: "linux-essentials",
    start: "2025-10",
    period: "Oct 2025",
    title: "Linux Essentials",
    organisation: "Cisco Networking Academy",
    description:
      "The command line, file systems and the fundamentals of working in a Linux environment.",
    category: "Learning",
  },
  {
    id: "sparc-campus-innovator",
    start: "2026-01",
    period: "Jan 2026 – Present",
    title: "Campus Innovator",
    organisation: "SPARC Foundation",
    description:
      "Leading ideation and execution of student-focused technical initiatives.",
    category: "Leadership",
    note: "Remote",
  },
  {
    id: "quantum-fundamentals",
    start: "2026-02",
    period: "Feb 2026",
    title: "Quantum Fundamentals",
    organisation: "Amaravati Quantum Valley · Qubitech & WISER",
    description: "Quantum computing fundamentals, completed for one academic credit.",
    category: "Learning",
    note: "1 academic credit",
  },
  {
    id: "aws-web-designer",
    start: "2026-06",
    period: "Jun 2026 – Present",
    title: "Web Designer",
    organisation: "AWS Student Builder Group, Siddhartha University",
    description:
      "Designing and building responsive web experiences for the AWS Student Builder community.",
    category: "Leadership",
    note: "Part-time · On-site",
    // The site for that community is already one of the projects, so this links
    // to its page rather than to a URL that would have to be invented.
    href: "/work/awssahe",
    linkLabel: "See the site",
  },
];

/** Chronological, with the written order kept for entries sharing a month. */
export function getMilestones(): Milestone[] {
  return [...milestoneList].sort((a, b) =>
    a.start < b.start ? -1 : a.start > b.start ? 1 : 0,
  );
}
