import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects, useSkills, useTimeline, PERSONAL_INFO, CURRENT_STATUS } from "@/hooks/use-portfolio";
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
    { cmd: "whoami", desc: "Quick identity summary" },
    { cmd: "projects", desc: "List featured projects (with repo links)" },
    { cmd: "skills", desc: "Show technical skills by category" },
    { cmd: "timeline", desc: "View education & work timeline" },
    { cmd: "status", desc: "Show current status and roles" },
    { cmd: "exploring", desc: "Areas I'm actively learning" },
    { cmd: "contact", desc: "Display contact information" },
    { cmd: "clear", desc: "Clear terminal output" },
    { cmd: "gui", desc: "Switch to GUI mode" },
    { cmd: "help", desc: "Show this help message (try 'help <command>')" },
  ];

  return (
    <div>
      <p className="text-[var(--term-cyan)] mb-3">Available commands:</p>
      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-1.5 mt-2 pl-2">
      {commands.map((c) => (
        <div key={c.cmd} className="contents">
          <span className="text-[var(--term-cyan)]">{c.cmd}</span>
          <span className="text-[var(--term-fg)] opacity-80">{c.desc}</span>
        </div>
      ))}
      </div>
      <p className="text-xs opacity-60 mt-4">Tip: Use arrow keys to navigate command history</p>
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
  const { data: timeline } = useTimeline();

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

    // Parse command and arguments
    const [mainCmd, ...args] = trimmed.split(' ');

    // Process command
    let response: ReactNode = null;
    let isError = false;

    // Detailed help for specific commands
    const commandHelp: Record<string, { desc: string; usage?: string; examples?: string[] }> = {
      about: {
        desc: "Display biographical information including background, interests, and location.",
        usage: "about",
      },
      whoami: {
        desc: "Show a quick identity summary - name and current focus.",
        usage: "whoami",
      },
      projects: {
        desc: "List all featured projects with descriptions, tech stack, and repository links.",
        usage: "projects",
        examples: ["projects"],
      },
      skills: {
        desc: "Display technical skills organized by category (Languages & Frameworks, Tools).",
        usage: "skills",
      },
      timeline: {
        desc: "View chronological timeline of education, work experience, and key milestones.",
        usage: "timeline",
      },
      status: {
        desc: "Show current status including active roles, education, and core skills.",
        usage: "status",
      },
      exploring: {
        desc: "View areas of active learning and exploration, including platform choices and reasoning.",
        usage: "exploring",
      },
      contact: {
        desc: "Display contact information including email, GitHub, and LinkedIn profiles.",
        usage: "contact",
      },
      clear: {
        desc: "Clear all terminal output and start fresh.",
        usage: "clear",
      },
      gui: {
        desc: "Exit terminal mode and switch to the graphical user interface.",
        usage: "gui",
      },
      help: {
        desc: "Show list of available commands or detailed help for a specific command.",
        usage: "help [command]",
        examples: ["help", "help projects", "help skills"],
      },
    };

    switch (mainCmd) {
      case "help":
        if (args.length > 0) {
          const cmdName = args[0];
          const helpInfo = commandHelp[cmdName];
          if (helpInfo) {
            response = (
              <div className="mt-2">
                <p className="text-[var(--term-cyan)] font-bold mb-2">{cmdName}</p>
                <p className="mb-2">{helpInfo.desc}</p>
                <div className="pl-4 space-y-1">
                  <p><span className="text-[var(--term-green)]">Usage:</span> {helpInfo.usage}</p>
                  {helpInfo.examples && (
                    <div>
                      <span className="text-[var(--term-green)]">Examples:</span>
                      {helpInfo.examples.map((ex, i) => (
                        <div key={i} className="pl-4 text-[var(--term-cyan)]">{ex}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          } else {
            response = `Unknown command: ${cmdName}. Type 'help' to see all commands.`;
            isError = true;
          }
        } else {
          response = <HelpTable />;
        }
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
              I am <span className="text-[var(--term-green)]">{PERSONAL_INFO.name}</span>, a {PERSONAL_INFO.title} pursuing my degree in Computer Science Engineering.
            </p>
            <p className="mt-2">
              Currently exploring software development through practical projects, including web applications, APIs, and system-oriented tools.
            </p>
            <p className="mt-2">
              Based in <span className="text-[var(--term-cyan)]">{PERSONAL_INFO.location}</span>.
            </p>
          </div>
        );
        break;

      case "whoami":
        response = (
          <div className="mt-2">
            <p className="text-[var(--term-green)] font-bold">{PERSONAL_INFO.name}</p>
            <p className="opacity-80">CSE Student | Exploring Software Development</p>
          </div>
        );
        break;

      case "contact":
        response = (
          <div className="mt-2">
            <p>You can reach me at:</p>
            <div className="grid grid-cols-[100px_1fr] gap-2 mt-2">
              <span className="text-[var(--term-blue)]">Email:</span>
              <a href={`mailto:${PERSONAL_INFO.email}`} className="hover:underline">{PERSONAL_INFO.email}</a>
              
              <span className="text-[var(--term-blue)]">GitHub:</span>
              <a href={PERSONAL_INFO.github} target="_blank" className="hover:underline">{PERSONAL_INFO.github.replace('https://', '')}</a>
              
              <span className="text-[var(--term-blue)]">LinkedIn:</span>
              <a href={PERSONAL_INFO.linkedin} target="_blank" className="hover:underline">LinkedIn Profile</a>
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
            <div className="flex flex-col gap-8 mt-2">
              {projects.map((p: any) => (
                <div key={p.id} className="border-l-2 border-[var(--term-blue)] pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[var(--term-green)] font-bold text-lg">➜ {p.title}</span>
                  </div>
                  <p className="text-[var(--term-fg)] opacity-90 mb-2">{p.description}</p>
                  <p className="text-xs text-[var(--term-purple)] font-semibold mb-1">Stack: {p.techStack.join(", ")}</p>
                  {p.githubUrl && (
                    <p className="text-xs text-[var(--term-blue)] opacity-80">
                      Repo: <a href={p.githubUrl} target="_blank" className="hover:underline">{p.githubUrl.replace('https://github.com/', '')}</a>
                    </p>
                  )}
                  {p.liveUrl && (
                    <p className="text-xs text-[var(--term-cyan)] opacity-80">
                      Live: <a href={p.liveUrl} target="_blank" className="hover:underline">{p.liveUrl}</a>
                    </p>
                  )}
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
          const categoryMap: Record<string, string> = {
            'Frontend': 'LANGUAGES & FRAMEWORKS',
            'Backend': 'LANGUAGES & FRAMEWORKS',
            'Tools': 'TOOLS'
          };
          
          const remappedSkills = skills.reduce((acc: any, s: any) => {
            const newCat = categoryMap[s.category] || s.category;
            if (!acc[newCat]) acc[newCat] = [];
            acc[newCat].push(s);
            return acc;
          }, {});
          
          const orderedCategories = ['LANGUAGES & FRAMEWORKS', 'TOOLS'];
          
          response = (
            <div className="mt-2 space-y-4">
              {orderedCategories.map((cat: any) => remappedSkills[cat] && (
                <div key={cat}>
                  <h3 className="text-[var(--term-red)] font-bold uppercase mb-1">{cat}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pl-4">
                    {remappedSkills[cat].map((s: any) => (
                      <span key={s.id}>• {s.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        break;
      
      case "timeline":
      case "experience":
        if (!timeline) {
          response = "Loading timeline data...";
        } else {
          response = (
            <div className="mt-2 border-l border-[var(--term-fg)]/20 pl-4 space-y-6">
              {timeline.map((item: any) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--term-blue)]"></div>
                  <div className="text-[var(--term-cyan)] text-sm">{item.duration}</div>
                  <div className="text-[var(--term-green)] font-bold">{item.position} @ {item.company}</div>
                  <div className="opacity-80 mt-1 max-w-xl">{item.description}</div>
                </div>
              ))}
            </div>
          );
        }
        break;

      case "status":
        response = (
          <div className="mt-2 space-y-4">
            <div>
              <h3 className="text-[var(--term-green)] font-bold mb-2">💼 CURRENT ROLES</h3>
              <div className="pl-4 space-y-2">
                {CURRENT_STATUS.work.map((work, idx) => (
                  <div key={idx}>
                    <div className="text-[var(--term-cyan)]">{work.title}</div>
                    <div className="opacity-80">{work.organization} · {work.type}</div>
                    <div className="text-sm text-[var(--term-green)]">[{work.status}]</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-[var(--term-green)] font-bold mb-2">🎓 EDUCATION</h3>
              <div className="pl-4">
                <div className="text-[var(--term-cyan)]">{CURRENT_STATUS.education.degree}</div>
                <div className="opacity-80">{CURRENT_STATUS.education.institution}</div>
                <div className="text-sm opacity-60">{CURRENT_STATUS.education.year} · {CURRENT_STATUS.education.location}</div>
              </div>
            </div>

            <div>
              <h3 className="text-[var(--term-green)] font-bold mb-2">🛠️ CORE SKILLS</h3>
              <div className="pl-4">
                <div className="opacity-80">{CURRENT_STATUS.skills.join(" · ")}</div>
              </div>
            </div>
          </div>
        );
        break;

      case "exploring":
        response = (
          <div className="mt-2 space-y-3">
            <p className="text-[var(--term-cyan)]">Areas I'm actively exploring:</p>
            <div className="pl-4 space-y-2">
              <div>
                <span className="text-[var(--term-green)]">• Mobile Application Fundamentals</span>
                <p className="pl-4 text-sm opacity-80">Understanding mobile development patterns and platform-specific considerations</p>
              </div>
              <div>
                <span className="text-[var(--term-green)]">• Backend Systems & APIs</span>
                <p className="pl-4 text-sm opacity-80">Building scalable server-side architectures and designing effective API interfaces</p>
              </div>
              <div>
                <span className="text-[var(--term-green)]">• Platform Selection Strategy</span>
                <p className="pl-4 text-sm opacity-80">Choosing appropriate technologies based on problem constraints and iteration needs</p>
              </div>
            </div>
            <p className="text-xs opacity-60 mt-4">
              I often choose web platforms for faster iteration and simpler deployment.
              My interest is in problem-solving and systems, not a single platform.
            </p>
          </div>
        );
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
    if (e.key === "Enter") {
      // Allow default behavior for form submission
      return;
    }
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
    }
  };

  const onSubmit = (data: { command: string }) => {
    const cmd = data.command?.trim();
    if (cmd) {
      executeCommand(cmd);
    }
    reset({ command: "" });
    // Force focus back after reset
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const { ref: registerRef, ...commandRegister } = register("command");

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
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }} 
            className="flex items-center mt-2"
          >
            <Prompt />
            <input
              {...commandRegister}
              ref={(e) => {
                registerRef(e);
                (inputRef as any).current = e;
              }}
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
