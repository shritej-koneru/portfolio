import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { projects, skills, experience } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Projects ===
  app.get(api.projects.list.path, async (req, res) => {
    const data = await storage.getProjects();
    res.json(data);
  });

  app.get(api.projects.get.path, async (req, res) => {
    const data = await storage.getProject(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Project not found" });
    res.json(data);
  });

  // === Skills ===
  app.get(api.skills.list.path, async (req, res) => {
    const data = await storage.getSkills();
    res.json(data);
  });

  // === Experience ===
  app.get(api.experience.list.path, async (req, res) => {
    const data = await storage.getExperience();
    res.json(data);
  });

  // === Contact ===
  app.post(api.contact.create.path, async (req, res) => {
    try {
      const input = api.contact.create.input.parse(req.body);
      await storage.createMessage(input);
      res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === Seed Data ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingProjects = await storage.getProjects();
  if (existingProjects.length === 0) {
    console.log("Seeding database...");
    
    // Seed Projects
    await db.insert(projects).values([
      {
        title: "Hybrid Portfolio",
        description: "A dual-interface portfolio website featuring a clean GUI for recruiters and an interactive terminal for developers. Built with React and Express.",
        techStack: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
        repoUrl: "https://github.com/user/portfolio",
        demoUrl: "https://portfolio.demo",
        featured: true
      },
      {
        title: "E-Commerce Dashboard",
        description: "Real-time analytics dashboard for online retailers. Features sales tracking, inventory management, and customer insights.",
        techStack: ["Next.js", "Drizzle ORM", "PostgreSQL", "Recharts"],
        repoUrl: "https://github.com/user/dashboard",
        featured: true
      },
      {
        title: "DevTools CLI",
        description: "A command-line interface tool to scaffold modern web projects with best practices built-in.",
        techStack: ["Rust", "Clap", "Tokio"],
        repoUrl: "https://github.com/user/cli-tool",
        featured: false
      }
    ]);

    // Seed Skills
    await db.insert(skills).values([
      { category: "Frontend", name: "React", proficiency: 5 },
      { category: "Frontend", name: "TypeScript", proficiency: 5 },
      { category: "Frontend", name: "Tailwind CSS", proficiency: 4 },
      { category: "Backend", name: "Node.js", proficiency: 4 },
      { category: "Backend", name: "PostgreSQL", proficiency: 3 },
      { category: "Backend", name: "Go", proficiency: 3 },
      { category: "Tools", name: "Git", proficiency: 5 },
      { category: "Tools", name: "Docker", proficiency: 4 },
      { category: "Tools", name: "Linux", proficiency: 4 }
    ]);

    // Seed Experience
    await db.insert(experience).values([
      {
        role: "Senior Frontend Engineer",
        company: "TechCorp Inc.",
        duration: "2021 - Present",
        description: "Leading the frontend team in rebuilding the core product dashboard. Improved load times by 40%."
      },
      {
        role: "Software Developer",
        company: "StartUp Lab",
        duration: "2019 - 2021",
        description: "Full-stack development using MERN stack. Built and deployed 3 major client applications."
      },
      {
        role: "Junior Developer",
        company: "WebSolutions",
        duration: "2018 - 2019",
        description: "Assisted in developing responsive websites and maintaining legacy codebases."
      }
    ]);
    
    console.log("Seeding complete.");
  }
}
