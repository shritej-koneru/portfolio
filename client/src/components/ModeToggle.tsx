import { Terminal, Monitor, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ModeToggleProps {
  mode: "gui" | "terminal";
  setMode: (mode: "gui" | "terminal") => void;
}

export function ModeToggle({ mode, setMode }: ModeToggleProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setMode(mode === "gui" ? "terminal" : "gui")}
      className={`
        fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl backdrop-blur-md border border-white/10
        flex items-center gap-2 transition-all duration-300
        ${mode === "gui" 
          ? "bg-black text-white hover:bg-zinc-800" 
          : "bg-[#7dcfff] text-[#1a1b26] hover:bg-[#7dcfff]/90 shadow-[#7dcfff]/20"
        }
      `}
    >
      {mode === "gui" ? (
        <>
          <Terminal size={20} />
          <span className="font-semibold text-sm hidden sm:inline">Terminal Mode</span>
        </>
      ) : (
        <>
          <Monitor size={20} />
          <span className="font-mono font-bold text-sm hidden sm:inline">GUI Mode</span>
        </>
      )}
    </motion.button>
  );
}
