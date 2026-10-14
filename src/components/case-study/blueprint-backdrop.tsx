import { cn } from "@/lib/utils";

/**
 * The blueprint field every project-page plate sits on.
 *
 * Three layers, all decorative and non-interactive: the grid itself (the 48px
 * module Scene 02 and Scene 04 use, with a heavier 192px major line over it so
 * the field reads as drafted rather than printed), corner construction
 * crosshairs, and an optional sheet ruler labelled A–C / 1–3 the way an
 * architectural drawing is referenced.
 *
 * `tone` flips every line between ink-on-paper and paper-on-ink; nothing else
 * about the field changes, so the light and dark parts of a project's page are
 * recognisably the same sheet.
 */
export function BlueprintBackdrop({
  tone = "paper",
  rulers = false,
  className,
}: {
  tone?: "paper" | "ink";
  rulers?: boolean;
  className?: string;
}) {
  const ink = tone === "ink";
  const module = ink ? "rgba(242,240,233,0.055)" : "rgba(17,19,24,0.055)";
  const sub = ink ? "rgba(242,240,233,0.022)" : "rgba(17,19,24,0.028)";
  const tick = ink ? "rgba(89,119,232,0.55)" : "rgba(89,119,232,0.5)";
  const mark = ink ? "rgba(242,240,233,0.35)" : "rgba(17,19,24,0.35)";
  const label = ink
    ? "text-paper/30"
    : "text-ink/30";

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            `linear-gradient(to right, ${module} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${module} 1px, transparent 1px)`,
            `linear-gradient(to right, ${sub} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${sub} 1px, transparent 1px)`,
          ].join(", "),
          backgroundSize: "192px 192px, 192px 192px, 48px 48px, 48px 48px",
        }}
      />

      {/* Ruler — a 48px tick strip with the reference letters of a drawing sheet. */}
      {rulers ? (
        <>
          <div
            className="absolute inset-x-0 top-0 hidden h-10 border-b sm:block"
            style={{
              borderColor: module,
              backgroundImage: `repeating-linear-gradient(to right, ${tick} 0 1px, transparent 1px 48px)`,
              backgroundSize: "48px 8px",
              backgroundPosition: "bottom left",
              backgroundRepeat: "repeat-x",
            }}
          />
          <div
            className="absolute inset-y-0 left-0 hidden w-10 border-r sm:block"
            style={{
              borderColor: module,
              backgroundImage: `repeating-linear-gradient(to bottom, ${tick} 0 1px, transparent 1px 48px)`,
              backgroundSize: "8px 48px",
              backgroundPosition: "top right",
              backgroundRepeat: "repeat-y",
            }}
          />
          <div className={cn("absolute inset-x-0 top-3 hidden justify-between px-12 font-mono text-[10px] tracking-[0.3em] sm:flex", label)}>
            <span>A</span>
            <span>B</span>
            <span>C</span>
          </div>
          <div
            className={cn(
              "absolute inset-y-0 left-3 hidden flex-col justify-between py-12 font-mono text-[10px] tracking-[0.3em] sm:flex",
              label,
            )}
          >
            <span>1</span>
            <span>2</span>
            <span>3</span>
          </div>
        </>
      ) : null}

      {/* Construction crosshairs, one per corner of the sheet. */}
      <Crosshair className="absolute left-4 top-4" stroke={mark} />
      <Crosshair className="absolute right-4 top-4" stroke={mark} />
      <Crosshair className="absolute bottom-4 left-4" stroke={mark} />
      <Crosshair className="absolute bottom-4 right-4" stroke={mark} />
    </div>
  );
}

export function Crosshair({
  className,
  stroke,
}: {
  className?: string;
  stroke: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke={stroke}
      strokeWidth="1"
      className={className}
    >
      <path d="M12 1v22M1 12h22" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

/**
 * A hairline that draws itself in when its block is revealed. Drawn with SVG so
 * the animation is a single `stroke-dashoffset` transition — no keyframes, no
 * library — and it snaps to its full length under reduced motion.
 */
export function DrawnRule({
  shown,
  tone = "paper",
  className,
  delayMs = 0,
  instant = false,
}: {
  shown: boolean;
  tone?: "paper" | "ink";
  className?: string;
  delayMs?: number;
  /** Reduced motion: no draw, the rule is simply there. */
  instant?: boolean;
}) {
  const stroke = tone === "ink" ? "rgba(242,240,233,0.35)" : "rgba(89,119,232,0.7)";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 1"
      preserveAspectRatio="none"
      className={cn("h-px w-full", className)}
    >
      <line
        x1="0"
        y1="0.5"
        x2="100"
        y2="0.5"
        stroke={stroke}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        style={{
          strokeDasharray: 100,
          strokeDashoffset: shown ? 0 : 100,
          transition: instant ? "none" : "stroke-dashoffset 900ms ease-out",
          transitionDelay: instant ? undefined : `${delayMs}ms`,
        }}
      />
    </svg>
  );
}
