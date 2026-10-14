import type { CaseStudyDiagram } from "@/data/case-studies";
import { cn } from "@/lib/utils";

import { revealClass, useInView } from "./use-in-view";

/**
 * The schematic used twice in Scene 05: once in ink for the featured project's
 * system map, once on paper for a supporting project's data-source map.
 *
 * It is deliberately a grid of hairline cells rather than boxes-and-arrows —
 * `gap-px` over a tinted parent draws every divider with a single pixel, so the
 * diagram keeps the drafting-table feel at any column count and reflows from a
 * single column on phones to a full row on desktop without special cases.
 */
export function FlowDiagram({
  diagram,
  tone = "ink",
  className,
}: {
  diagram: CaseStudyDiagram;
  tone?: "paper" | "ink";
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.12 });
  const ink = tone === "ink";
  const steps = diagram.steps;
  const columns = Math.min(steps.length, 5);

  return (
    <figure ref={ref} className={cn("min-w-0", className)}>
      <ol
        className={cn(
          "grid gap-px overflow-hidden rounded-lg",
          ink ? "bg-paper/15" : "bg-ink/15",
          COLUMNS[columns] ?? COLUMNS[5],
        )}
      >
        {steps.map((step, index) => {
          const reveal = revealClass(inView, index * 90);
          return (
            <li
              key={step.label}
              className={cn(
                "relative min-w-0 p-5",
                ink ? "bg-[#0B0E14]" : "bg-background",
              )}
            >
              {/* The tick reads as a drawing reference, not a decorative bullet. */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-0 h-full w-px",
                  index === 0 ? "bg-blueprint/70" : "bg-transparent",
                )}
              />
              {/* The reveal animates the contents, never the cell, so the
                  hairline grid stays put while the notes fade in. */}
              <div className={reveal.className} style={reveal.style}>
                <span className="block font-mono text-[10px] tracking-[0.3em] text-blueprint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "mt-3 block font-mono text-[11px] uppercase tracking-[0.18em]",
                    ink ? "text-paper" : "text-ink",
                  )}
                >
                  {step.label}
                </span>
                <span
                  className={cn(
                    "mt-2 block text-[13px] leading-relaxed",
                    ink ? "text-paper/60" : "text-ink/65",
                  )}
                >
                  {step.detail}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      <figcaption className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <span
          className={cn(
            "text-pretty text-[13px] leading-relaxed",
            ink ? "text-paper/60" : "text-ink/60",
          )}
        >
          {diagram.caption}
        </span>
        <span
          className={cn(
            "shrink-0 font-mono text-[10px] uppercase tracking-[0.22em]",
            ink ? "text-paper/35" : "text-ink/40",
          )}
        >
          {diagram.source}
        </span>
      </figcaption>
    </figure>
  );
}

/** Column count follows the number of steps, so no diagram is ever stretched. */
const COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-5",
};
