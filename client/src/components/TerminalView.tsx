import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects, useSkills, useExperience } from "@/hooks/use-portfolio";
import { useForm } from "react-hook-form";

// --- Types ---
type LineType = {
  id: string;
  type: "command" | "output" | "error";
  content: ReactNode;
};

// --- Helper Components ---
function AsciiArt() {
  return (
    <pre className="text-[10px] sm:text-xs leading-none text-[var(--term-blue)] font-bold select-none mb-6">
{`
 ____            _     __       _ _       
|  _ \\ ___  _ __| |_  / _| ___ | (_) ___  
| |_) / _ \\| '__| __|| |_ / _ \\| | |/ _ \\ 
|  __/ (_) | |  | |_ |  _| (_) | | | (_) |
|_|   \\___/|_|   \\__||_|  \\___/|_|_|\\___/ 
                                          
`}
    </pre>
  );
}

function Prompt() {
  return (
    <span className="mr-2 select-none">
      <span className="text-[var(--term-purple)]">guest</span>
      <span className="text-[var(--term-fg)]">@</span>
      <span className="text-[var(--term-green)]">portfolio</span>
      <span className="text-[var(--term-fg)]">:</span>
      <span className="text-[var(--term-blue)]">~</span>
      <span className="text-[var(--term-fg)]">$</span>
    </span>
  );
}

function HelpTable() {
  const commands = [
    { cmd: "about", desc: "Display biographical information" },
    { cmd: "projects", desc: "List featured projects" },
    { cmd: "skills", desc: "Show technical skills" },
    { cmd: "experience", desc: "View work history" },
    { cmd: "contact", desc: "Display contact information" },
    { cmd: "clear", desc: "Clear terminal output" },
    { cmd: "gui", desc: "Switch to GUI mode" },
    { cmd: "help", desc: "Show this help message" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-x-4 gap-y-1 mt-2">
      {commands.map((c) => (
        <div key={c.cmd} className="contents">
          <span className="text-[var(--term-cyan)]">{c.cmd}</span>
          <span className="text-[var(--term-fg)] opacity-80">{c.desc}</span>
        </div>
      ))}
    </div>
  );
}

// --- Main Terminal Logic ---

export function TerminalView({ onExit }: { onExit: () => void }) {
  const [lines, setLines] = useState<LineType[]>([
    {
      id: "init",
      type: "output",
      content: (
        <div>
          <AsciiArt />
          <p>Welcome to the interactive terminal portfolio.</p>
          <p>Type <span className="text-[var(--term-cyan)]">'help'</span> to see available commands.</p>
        </div>
      ),
    },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Data hooks (pre-fetched or cached)
  const { data: projects } = useProjects();
  const { data: skills } = useSkills();
  const { data: experience } = useExperience();

  const { register, handleSubmit, reset, setValue, watch } = useForm<{ command: string }>();

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on click anywhere
  useEffect(() => {
    inputRef.current?.focus();
    const handleClick = () => inputRef.current?.focus();
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    // Add to command history
    setLines((prev) => [
      ...prev,
      { id: Date.now().toString() + "-cmd", type: "command", content: trimmed },
    ]);
    setHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);

    // Process command
    let response: ReactNode = null;
    let isError = false;

    switch (trimmed) {
      case "help":
        response = <HelpTable />;
        break;
      
      case "clear":
        setLines([]);
        return; // Early return to avoid adding empty output

      case "gui":
      case "exit":
        onExit();
        return;

      case "about":
        response = (
          <div className="max-w-2xl mt-2 leading-relaxed">
            <p>
              I am a <span className="text-[var(--term-green)]">Full Stack Engineer</span> passionate about building accessible, performant web applications. 
              I specialize in React, Node.js, and modern frontend architecture.
            </p>
            <p className="mt-2">
              Based in the cloud, working worldwide.
            </p>
          </div>
        );
        break;

      case "contact":
        response = (
          <div className="mt-2">
            <p>You can reach me at:</p>
            <div className="grid grid-cols-[100px_1fr] gap-2 mt-2">
              <span className="text-[var(--term-blue)]">Email:</span>
              <a href="mailto:hello@example.com" className="hover:underline">hello@example.com</a>
              
              <span className="text-[var(--term-blue)]">GitHub:</span>
              <a href="https://github.com" target="_blank" className="hover:underline">github.com/developer</a>
            </div>
            <p className="mt-4 text-[var(--term-fg)] opacity-60">
              (Or use the Contact form in <span className="text-[var(--term-cyan)]" onClick={onExit} role="button">GUI mode</span>)
            </p>
          </div>
        );
        break;

      case "projects":
        if (!projects) {
          response = "Loading projects data...";
        } else {
          response = (
            <div className="flex flex-col gap-6 mt-2">
              {projects.map((p: any) => (
                <div key={p.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--term-green)] font-bold text-lg">➜ {p.title}</span>
                    <div className="flex gap-2 text-xs">
                      {p.repoUrl && <a href={p.repoUrl} target="_blank" className="text-[var(--term-blue)] hover:underline">[repo]</a>}
                      {p.demoUrl && <a href={p.demoUrl} target="_blank" className="text-[var(--term-cyan)] hover:underline">[demo]</a>}
                    </div>
                  </div>
                  <p className="text-[var(--term-fg)] opacity-90 pl-5 mb-1">{p.description}</p>
                  <p className="pl-5 text-xs text-[var(--term-purple)]">Stack: {p.techStack.join(", ")}</p>
                </div>
              ))}
            </div>
          );
        }
        break;

      case "skills":
        if (!skills) {
          response = "Loading skills data...";
        } else {
          const categories = Array.from(new Set(skills.map((s: any) => s.category)));
          response = (
            <div className="mt-2 space-y-4">
              {categories.map((cat: any) => (
                <div key={cat}>
                  <h3 className="text-[var(--term-red)] font-bold uppercase mb-1">{cat}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pl-4">
                    {skills.filter((s: any) => s.category === cat).map((s: any) => (
                      <span key={s.id}>• {s.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        break;
      
      case "experience":
        if (!experience) {
          response = "Loading experience data...";
        } else {
          response = (
            <div className="mt-2 border-l border-[var(--term-fg)]/20 pl-4 space-y-6">
              {experience.sort((a: any, b: any) => a.order - b.order).map((job: any) => (
                <div key={job.id} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--term-blue)]"></div>
                  <div className="text-[var(--term-cyan)] text-sm">{job.duration}</div>
                  <div className="text-[var(--term-green)] font-bold">{job.role} @ {job.company}</div>
                  <div className="opacity-80 mt-1 max-w-xl">{job.description}</div>
                </div>
              ))}
            </div>
          );
        }
        break;

      default:
        response = `Command not found: ${trimmed}. Type 'help' for available commands.`;
        isError = true;
    }

    setLines((prev) => [
      ...prev,
      { id: Date.now().toString(), type: isError ? "error" : "output", content: response },
    ]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setValue("command", history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setValue("command", history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setValue("command", "");
      }
    } else if (e.key === "Tab") {
        e.preventDefault();
        // Simple tab completion could go here
    }
  };

  const onSubmit = (data: { command: string }) => {
    if (data && data.command) {
      executeCommand(data.command);
    }
    reset();
  };

  return (
    <div className="fixed inset-0 bg-[var(--term-bg)] text-[var(--term-fg)] font-mono p-4 sm:p-8 overflow-hidden z-40 crt flex flex-col">
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto terminal-scroll mb-4"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="max-w-4xl mx-auto min-h-full pb-12">
          {lines.map((line) => (
            <div key={line.id} className="mb-2 break-words">
              {line.type === "command" ? (
                <div>
                  <Prompt />
                  <span className="text-[var(--term-fg)]">{line.content}</span>
                </div>
              ) : (
                <div className={line.type === "error" ? "text-[var(--term-red)]" : ""}>
                  {line.content}
                </div>
              )}
            </div>
          ))}
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-center mt-2">
            <Prompt />
            <input
              {...register("command")}
              ref={inputRef}
              autoComplete="off"
              onKeyDown={onKeyDown}
              className="flex-grow bg-transparent border-none outline-none text-[var(--term-fg)] caret-[var(--term-cyan)]"
              autoFocus
            />
          </form>
        </div>
      </div>
      
      <div className="text-center text-xs opacity-40 select-none pb-2">
        Terminal Mode v1.0.0 • Type 'help' for commands • Press 'gui' or toggle to exit
      </div>
    </div>
  );
}
