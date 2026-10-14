import { useState } from "react";
import InkReveal from "@/components/ui/ink-reveal";

/**
 * Opening screen — the ink mask hides a photograph of Shritej and is carved
 * away as the pointer moves over the canvas. A small labelled control doubles
 * as the keyboard/touch affordance so the image is never permanently hidden.
 */
export default function App() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-background">
      <section
        aria-label="Opening"
        className="relative h-full w-full"
        onMouseMove={() => setHasInteracted(true)}
        onTouchStart={() => setHasInteracted(true)}
      >
        <img
          src="/images/campus-park-intro.jpg"
          alt="Shritej Koneru standing in a campus park"
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
        />

        <InkReveal
          maskColor={[242, 240, 233]}
          brushSize={150}
          cleared={revealed}
        />

        <div
          className={`pointer-events-none absolute inset-x-0 bottom-10 z-30 flex justify-center transition-opacity duration-700 ${
            hasInteracted || revealed ? "opacity-0" : "opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="pointer-events-auto rounded-full border border-ink/20 bg-paper/70 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ink/70 backdrop-blur-sm transition-colors hover:border-ink/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Move to uncover
          </button>
        </div>
      </section>
    </main>
  );
}
