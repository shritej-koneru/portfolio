import { useQuery } from "@tanstack/react-query";
import certificationsData from "@/data/certifications.json";

// Portfolio Data with GitHub API Integration
export interface Project {
  id: number;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  stars?: number;
  language?: string;
}

export interface Skill {
  id: number;
  category: string;
  name: string;
  level?: string;
}

export interface Experience {
  id: number;
  company: string;
  position: string;
  duration: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

export interface GitHubProfile {
  name: string;
  bio: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  location: string;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  credentialId?: string;
  credentialUrl?: string;
  logo?: string;
}

// Personal Config
const GITHUB_USERNAME = "shritej-koneru";
export const PERSONAL_INFO = {
  name: "Koneru Shritej",
  title: "Computer Science Engineering Student",
  subtitle: "2nd Year CSE",
  bio: "I'm a 2nd-year Computer Science Engineering student from Vijayawada, Andhra Pradesh, focused on exploring software development through practical projects, including web applications, APIs, and system-oriented tools.",
  email: "mail4shritejkoneru@gmail.com",
  location: "Vijayawada, Andhra Pradesh",
  linkedin: "https://www.linkedin.com/in/shritej-koneru-560111324/",
  github: "https://github.com/shritej-koneru"
};

// Fallback GitHub Profile (used when API rate limit is exceeded)
const FALLBACK_PROFILE: GitHubProfile = {
  name: PERSONAL_INFO.name,
  bio: PERSONAL_INFO.bio,
  avatar_url: "/images/avatar.png",
  html_url: PERSONAL_INFO.github,
  public_repos: 4,
  followers: 0,
  location: PERSONAL_INFO.location
};

// Fallback Skills (used when API rate limit is exceeded)
const FALLBACK_SKILLS: Skill[] = [
  { id: 1, category: "Languages", name: "C" },
  { id: 2, category: "Languages", name: "Python" },
  { id: 3, category: "Languages", name: "JavaScript" },
  { id: 4, category: "Languages", name: "TypeScript" },
  { id: 5, category: "Frontend", name: "React" },
  { id: 6, category: "Frontend", name: "HTML" },
  { id: 7, category: "Frontend", name: "CSS" },
  { id: 8, category: "Backend", name: "Node.js" },
  { id: 9, category: "Tools", name: "Git" },
  { id: 10, category: "Concepts", name: "Data Structures" },
  { id: 11, category: "Concepts", name: "Algorithms" }
];

// Fallback Projects (used when GitHub API rate limit is exceeded)
const FALLBACK_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Multi File Conversion",
    description: "Convert files quickly and easily across formats. Upload single or multiple files, get smart format suggestions, and download converted files instantly. Supports documents, images, audio, video, and more — all in one secure, user-friendly platform.",
    techStack: ["TypeScript", "Shell", "CSS", "HTML", "Dockerfile", "JavaScript"],
    githubUrl: "https://github.com/shritej-koneru/multi-file-conversion",
    liveUrl: "https://multi-file-conversion.vercel.app",
    stars: 0,
    language: "TypeScript"
  },
  {
    id: 2,
    title: "EquiAlert",
    description: "EQUIALERT is a full-stack, dark-mode stock market web application focused on Indian stocks. The platform provides real-time stock tracking, market news, watchlist management, and AI-powered insights through a chatbot interface. The application emphasizes professional financial dashboard aesthetics with color-coded market indicators.",
    techStack: ["TypeScript", "CSS", "HTML", "Python", "JavaScript"],
    githubUrl: "https://github.com/shritej-koneru/EquiAlert",
    stars: 0,
    language: "TypeScript"
  },
  {
    id: 3,
    title: "FloatChatSAHE",
    description: "The current problem statement proposes the development of an AI-powered conversational system for ARGO float data that enables users to query, explore, and visualize oceanographic information using natural language.",
    techStack: ["JavaScript", "Python", "CSS", "HTML"],
    githubUrl: "https://github.com/shritej-koneru/FloatChatSAHE",
    stars: 0,
    language: "JavaScript"
  },
  {
    id: 4,
    title: "Portfolio",
    description: "Personal portfolio website showcasing projects, skills, and experience. Built with modern web technologies and featuring a clean, responsive design with both GUI and terminal views.",
    techStack: ["TypeScript", "React", "CSS", "HTML"],
    githubUrl: "https://github.com/shritej-koneru/Portfolio",
    stars: 0,
    language: "TypeScript"
  }
];

// GitHub API Functions
async function fetchGitHubProfile(): Promise<GitHubProfile> {
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!response.ok) {
      console.error("GitHub API error:", response.status, response.statusText);
      if (response.status === 403) {
        console.error("Rate limit exceeded. Using fallback data.");
      }
      throw new Error(`Failed to fetch GitHub profile: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("GitHub profile loaded:", data.login, data.avatar_url);
    return data;
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    throw error;
  }
}

async function fetchGitHubRepos(): Promise<any[]> {
  const response = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
  );
  if (!response.ok) throw new Error("Failed to fetch GitHub repos");
  return response.json();
}

// Fetch languages for a specific repo
async function fetchRepoLanguages(owner: string, repo: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`
    );
    if (!response.ok) return [];
    const languages = await response.json();
    return Object.keys(languages);
  } catch {
    return [];
  }
}

// Transform GitHub repos to Project format with technical descriptions
async function transformReposToProjects(repos: any[]): Promise<Project[]> {
  const filteredRepos = repos
    .filter(repo => 
      !repo.fork && 
      !repo.archived && 
      repo.name.toLowerCase() !== GITHUB_USERNAME.toLowerCase() // Filter out profile README repo
    );

  const projectsWithLanguages = await Promise.all(
    filteredRepos.map(async (repo) => {
      const languages = await fetchRepoLanguages(repo.owner.login, repo.name);
      return {
        repo,
        languages: languages.length > 0 ? languages : (repo.language ? [repo.language] : ["Code"])
      };
    })
  );

  return projectsWithLanguages.map(({ repo, languages }, index) => {
    // Generate more technical descriptions based on repo name and tech stack
    let description = repo.description || generateTechnicalDescription(repo.name, languages);
    
    return {
      id: index + 1,
      title: repo.name.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      description,
      techStack: languages,
      githubUrl: repo.html_url,
      liveUrl: repo.homepage || undefined,
      stars: repo.stargazers_count,
      language: repo.language
    };
  });
}

// Helper function to generate technical descriptions
function generateTechnicalDescription(repoName: string, techStack: string[]): string {
  const name = repoName.toLowerCase();
  
  // Pattern matching for common project types
  if (name.includes('api') || name.includes('backend') || name.includes('server')) {
    return `Built a REST API focusing on data processing, endpoint design, and server-side logic. Chosen platform enabled rapid prototyping and practical problem-solving.`;
  }
  
  if (name.includes('convert') || name.includes('converter') || name.includes('transform')) {
    return `Built a file conversion tool focusing on format detection, batch processing, and client-side performance. Project explores practical system design using accessible platforms.`;
  }
  
  if (name.includes('stock') || name.includes('finance') || name.includes('market')) {
    return `Developed a financial data API with real-time processing, caching strategies, and analytics endpoints. Built to explore backend architecture and data handling patterns.`;
  }
  
  if (name.includes('equalizer') || name.includes('audio') || name.includes('music')) {
    return `Created an audio manipulation application focusing on DSP algorithms, waveform processing, and real-time visualization. Platform chosen for accessibility and iteration speed.`;
  }
  
  if (name.includes('portfolio') || name.includes('website')) {
    return `Designed a responsive web application with modern UI/UX patterns, API integration, and optimized rendering. Built as part of exploring practical software development.`;
  }
  
  if (name.includes('bot') || name.includes('automation')) {
    return `Built an automation tool focusing on task scheduling, API integration, and error handling. Explores system integration and practical problem-solving.`;
  }
  
  // Default technical description
  const primaryTech = techStack[0] || 'modern technologies';
  return `Built to explore practical problem-solving and system design using ${primaryTech}. Platform chosen for simplicity and effective iteration.`;
}

// Extract skills from GitHub repos
function extractSkillsFromRepos(repos: any[]): Skill[] {
  const languages = new Set<string>();
  repos.forEach(repo => {
    if (repo.language) languages.add(repo.language);
  });

  const languageSkills = Array.from(languages).map((lang, idx) => ({
    id: idx + 1,
    category: ["JavaScript", "TypeScript", "HTML", "CSS"].includes(lang) ? "Frontend" : "Backend",
    name: lang,
    level: "Intermediate"
  }));

  // Add common tools
  const tools: Skill[] = [
    { id: 100, category: "Tools", name: "Git", level: "Advanced" },
    { id: 101, category: "Tools", name: "GitHub", level: "Advanced" },
    { id: 102, category: "Tools", name: "VS Code", level: "Advanced" },
    { id: 103, category: "Tools", name: "npm", level: "Intermediate" },
  ];

  return [...languageSkills, ...tools];
}

// Timeline data (combines education, work, and projects)
const timelineData: Experience[] = [
  {
    id: 1,
    company: "SPARC FOUNDATION",
    position: "Campus Innovator · Internship",
    duration: "Jan 2026 - Present",
    description: "Working on ideation and execution of student-focused technical initiatives, collaborating across teams.",
    startDate: "2026-01-01"
  },
  {
    id: 2,
    company: "TechnoVate-SAHE",
    position: "Ideate Station Executive",
    duration: "Sep 2025 - Present",
    description: "Managed the collection and initial screening of member suggestions, prioritizing innovative concepts. Facilitated brainstorming sessions to refine ideas into actionable proposals.",
    startDate: "2025-09-01"
  },
  {
    id: 3,
    company: "Velagapudi Ramakrishna Siddhartha Engineering College",
    position: "Bachelor's in Computer Science Engineering",
    duration: "2024 - 2028",
    description: "Pursuing CSE degree with focus on software development fundamentals, data structures, algorithms, and practical application development. Learning C, Python, and modern web technologies.",
    startDate: "2024-07-01"
  },
  {
    id: 4,
    company: "Sri Chaitanya Junior College (Krishna Reddy Chaithanya)",
    position: "Intermediate Education (MPC)",
    duration: "2022 - 2024",
    description: "Completed intermediate education with focus on Mathematics, Physics, and Chemistry. Developed strong analytical and problem-solving skills.",
    startDate: "2022-06-01",
    endDate: "2024-05-01"
  },
  {
    id: 5,
    company: "VPS Public School",
    position: "Secondary Education",
    duration: "2012 - 2022",
    description: "Completed primary and secondary education with excellent academic performance. Built foundational knowledge in science, mathematics, and technology.",
    startDate: "2012-06-01",
    endDate: "2022-05-01"
  },
  {
    id: 6,
    company: "Early Interest in Technology",
    position: "Curiosity-Driven Exploration",
    duration: "Before College",
    description: "Developed curiosity about computers and technology through exploration before formal education.",
    startDate: "2010-01-01",
    endDate: "2024-06-01"
  }
];

// Current status
export const CURRENT_STATUS = {
  education: {
    institution: "Velagapudi Ramakrishna Siddhartha Engineering College",
    degree: "Bachelor's in Computer Science Engineering",
    year: "2nd Year (2024-2028)",
    location: "Vijayawada, Andhra Pradesh, India"
  },
  work: [
    {
      title: "Campus Innovator",
      organization: "SPARC FOUNDATION",
      type: "Internship",
      status: "Active"
    },
    {
      title: "Ideate Station Executive",
      organization: "TechnoVate-SAHE",
      type: "Leadership",
      status: "Active"
    }
  ],
  skills: ["C", "Python", "JavaScript", "React", "HTML/CSS", "Git", "Data Structures", "Algorithms"],
  interests: ["Full-Stack Development", "Data Structures", "Algorithms", "Innovation"]
};

// Hooks with GitHub API Integration
export function useProjects() {
  return useQuery({
    queryKey: ["github-projects"],
    queryFn: async () => {
      // Try to load from localStorage first
      const cached = localStorage.getItem('github-projects-cache');
      const cacheTime = localStorage.getItem('github-projects-cache-time');
      
      // Use cached data if it's less than 24 hours old
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        const maxAge = 1000 * 60 * 60 * 24; // 24 hours
        if (age < maxAge) {
          console.log('Using cached projects data');
          return JSON.parse(cached);
        }
      }
      
      try {
        const repos = await fetchGitHubRepos();
        const projects = await transformReposToProjects(repos);
        
        // Cache the successful response
        localStorage.setItem('github-projects-cache', JSON.stringify(projects));
        localStorage.setItem('github-projects-cache-time', Date.now().toString());
        console.log('Fetched and cached new projects data');
        
        return projects;
      } catch (error) {
        console.warn("Failed to fetch GitHub projects, using fallback data:", error);
        
        // If we have old cached data, use it even if expired
        if (cached) {
          console.log('Using expired cache as fallback');
          return JSON.parse(cached);
        }
        
        return FALLBACK_PROJECTS;
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchInterval: false, // Don't auto-refetch to avoid rate limits
    retry: false, // Don't retry failed requests
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ["github-skills"],
    queryFn: async () => {
      // Try to load from localStorage first
      const cached = localStorage.getItem('github-skills-cache');
      const cacheTime = localStorage.getItem('github-skills-cache-time');
      
      // Use cached data if it's less than 24 hours old
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        const maxAge = 1000 * 60 * 60 * 24; // 24 hours
        if (age < maxAge) {
          console.log('Using cached skills data');
          return JSON.parse(cached);
        }
      }
      
      try {
        const repos = await fetchGitHubRepos();
        const skills = extractSkillsFromRepos(repos);
        
        // Cache the successful response
        localStorage.setItem('github-skills-cache', JSON.stringify(skills));
        localStorage.setItem('github-skills-cache-time', Date.now().toString());
        console.log('Fetched and cached new skills data');
        
        return skills;
      } catch (error) {
        console.warn("Failed to fetch GitHub skills, using fallback data:", error);
        
        // If we have old cached data, use it even if expired
        if (cached) {
          console.log('Using expired skills cache as fallback');
          return JSON.parse(cached);
        }
        
        return FALLBACK_SKILLS;
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchInterval: false, // Don't auto-refetch to avoid rate limits
    retry: false, // Don't retry failed requests
  });
}

export function useGitHubProfile() {
  return useQuery({
    queryKey: ["github-profile"],
    queryFn: async () => {
      // Try to load from localStorage first
      const cached = localStorage.getItem('github-profile-cache');
      const cacheTime = localStorage.getItem('github-profile-cache-time');
      
      // Use cached data if it's less than 24 hours old
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        const maxAge = 1000 * 60 * 60 * 24; // 24 hours
        if (age < maxAge) {
          console.log('Using cached profile data');
          return JSON.parse(cached);
        }
      }
      
      try {
        const profile = await fetchGitHubProfile();
        
        // Cache the successful response
        localStorage.setItem('github-profile-cache', JSON.stringify(profile));
        localStorage.setItem('github-profile-cache-time', Date.now().toString());
        console.log('Fetched and cached new profile data');
        
        return profile;
      } catch (error) {
        console.warn("Failed to fetch GitHub profile, using fallback data:", error);
        
        // If we have old cached data, use it even if expired
        if (cached) {
          console.log('Using expired profile cache as fallback');
          return JSON.parse(cached);
        }
        
        return FALLBACK_PROFILE;
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchInterval: false, // Don't auto-refetch to avoid rate limits
    retry: false, // Don't retry failed requests
  });
}

export function useTimeline() {
  return {
    data: timelineData,
    isLoading: false,
    error: null
  };
}

// Alias for backward compatibility
export function useExperience() {
  return useTimeline();
}

export function useCertifications() {
  return {
    data: certificationsData,
    isLoading: false,
    error: null
  };
}

export function getPersonalInfo() {
  return PERSONAL_INFO;
}

// LinkedIn Posts and Articles
export interface LinkedInPost {
  id: number;
  title: string;
  excerpt: string;
  type: 'post' | 'article';
  imageUrl?: string;
  link: string;
  date: string;
  likes?: number;
  comments?: number;
}

const linkedInContent: LinkedInPost[] = [
  // Add your LinkedIn posts here manually
  // Example:
  // {
  //   id: 1,
  //   title: "My Journey into Web Development",
  //   excerpt: "Sharing my experience learning React and building projects...",
  //   type: "post",
  //   link: "https://linkedin.com/posts/...",
  //   date: "2026-01-15",
  //   likes: 45,
  //   comments: 12
  // }
];

export function useLinkedInContent() {
  return {
    data: linkedInContent,
    isLoading: false,
    error: null
  };
}

// Contact Form - Static implementation (logs to console per PRD)
export function useContactMutation() {
  return {
    mutate: (data: any) => {
      console.log("Contact form submission (static mode):", data);
      // In a real implementation, this would send an email or store the message
      // For now, just log it as per PRD (no backend)
    },
    isPending: false,
    isSuccess: false,
    isError: false
  };
}
