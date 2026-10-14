import type { CaseStudyVisual } from "@/data/case-studies";
import { cn } from "@/lib/utils";

import { Crosshair } from "./blueprint-backdrop";
import { useInView } from "./use-in-view";

/**
 * A real screenshot of the running project — no mockups, no redrawn UI.
 *
 * The reveal is a `clip-path` wipe from the bottom edge, which uncovers the
 * screenshot the way a plate is pulled back on a drafting sheet. It runs when
 * the figure enters the viewport, so a card further down the page still gets its
 * reveal at the right moment.
 *
 * The intrinsic width and height are always set, so the box reserves its space
 * and the image cannot shift the layout as it loads. Under reduced motion the
 * clip is removed altogether and the screenshot is simply visible.
 */
export function ScreenshotFigure({
  visual,
  tone = "paper",
  className,
}: {
  visual: CaseStudyVisual;
  tone?: "paper" | "ink";
  className?: string;
}) {
  const { ref, inView, reduced } = useInView<HTMLElement>({ threshold: 0.1 });
  // Reduced motion shows it immediately; otherwise it wipes in once.
  const show = reduced || inView;
  const ink = tone === "ink";

  return (
    <figure ref={ref} className={cn("min-w-0", className)}>
      <div className="relative">
        {/* Technical-blue stroke on the binding edge of the plate. */}
        <span
          aria-hidden="true"
          className="absolute -left-1.5 top-0 h-full w-px bg-blueprint/70 sm:-left-2"
        />
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border",
            ink ? "border-paper/20 bg-paper/5" : "border-ink/15 bg-ink/5",
          )}
        >
          <img
            src={visual.src}
            alt={visual.alt}
            width={1440}
            height={900}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="block aspect-[16/10] w-full object-cover object-top"
            style={{
              clipPath: show ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
              transform: show ? "scale(1)" : "scale(1.02)",
              transition: reduced
                ? "none"
                : "clip-path 1100ms cubic-bezier(0.22,0.61,0.36,1), transform 1200ms cubic-bezier(0.22,0.61,0.36,1)",
            }}
          />
        </div>

        {/* Construction marks sitting on the corners of the plate. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0",
            ink ? "text-paper/50" : "text-ink/40",
          )}
        >
          <Crosshair stroke="currentColor" className="absolute -left-2 -top-2" />
          <Crosshair stroke="currentColor" className="absolute -right-2 -top-2" />
          <Crosshair stroke="currentColor" className="absolute -bottom-2 -left-2" />
          <Crosshair stroke="currentColor" className="absolute -bottom-2 -right-2" />
        </span>
      </div>

      <figcaption
        className={cn(
          "mt-4 max-w-3xl text-pretty text-[13px] leading-relaxed",
          ink ? "text-paper/60" : "text-ink/60",
        )}
      >
        {visual.caption}
      </figcaption>
    </figure>
  );
}
