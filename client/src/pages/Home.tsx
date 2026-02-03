import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GuiView } from "@/components/GuiView";
import { TerminalView } from "@/components/TerminalView";
import { ModeToggle } from "@/components/ModeToggle";

export default function Home() {
  const [mode, setMode] = useState<"gui" | "terminal">("gui");

  // Keyboard shortcut for toggling mode (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setMode((prev) => (prev === "gui" ? "terminal" : "gui"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Background color transition container */}
      <div 
        className="min-h-screen transition-colors duration-500"
        style={{ backgroundColor: mode === "gui" ? "var(--bg-gui)" : "var(--bg-term)" }}
      >
        <ModeToggle mode={mode} setMode={setMode} />
        
        <AnimatePresence mode="wait">
          {mode === "gui" ? (
            <motion.div
              key="gui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <GuiView />
            </motion.div>
          ) : (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40"
            >
              <TerminalView onExit={() => setMode("gui")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
