import * as React from "react";
import gsap from "gsap";

import {
  CRACK_BRANCHES,
  CRACK_SIGNALS,
  CRACK_VIEWBOX,
} from "@/components/ui/impact-cracks";
import { RESUME_FILENAME, RESUME_FILE } from "@/data/resume";

/**
 * Scene 08 — the resume, dropped onto the drawing.
 *
 * The scene rests as a dark plate with one button on it and nothing else: no
 * floor, no document, no decoration. Pressing the button stages the floor,
 * drops a resume page onto it, cracks the ground at the point of impact, holds
 * on the result for two seconds, hands the real PDF to the browser, and then
 * takes the whole scene back down so it can be run again.
 *
 * ## Why this is not WebGL
 *
 * The brief allowed Three.js or React Three Fiber "if the existing project
 * supports it". It does not — the project carries `gsap` and `motion` and no 3D
 * runtime at all — and adding one would put roughly 150 KB over the wire,
 * gzipped, on a bundle that already warns at the 500 KB mark, for a scene whose
 * 3D content is a single flat page and a floor. CSS 3D does the whole job: the
 * page falls under a `perspective` parent with `preserve-3d`, and the floor is
 * a flattened ellipse in the same projection. The shadows, the tilt and the
 * landing are real projection, not an imitation of it.
 *
 * ## One plane
 *
 * The floor, the crack field, the light the break gives off and the ring it
 * pushes outward are all children of the same layer, and that layer is the one
 * carrying the vertical squash that stands in for the floor's foreshortening. So
 * they lean together and stay registered to one another, and the floor, the
 * field, the ring and the bloom can never drift apart.
 *
 * ## The state machine
 *
 * `phase` is the scene's state and changes four times per run; GSAP owns every
 * frame in between. Nothing here re-renders on an animation frame — the motion
 * is written straight to the DOM by the timeline, and React only hears about
 * the five moments that change what the scene *is*: it starts falling, it has
 * landed, it is holding, it is fading, and it is idle again.
 *
 * `runningRef` is the duplicate guard, and it is a ref rather than state on
 * purpose: a second click in the same frame must see the first one's write.
 *
 * ## The download
 *
 * `@/data/resume` owns the path and the filename; the timeline only calls
 * `handOver()`. The file is checked with a `HEAD` when the fall begins, so by
 * the time the hold is over the answer is in hand. The check reads the
 * *content type*, not the status: `vercel.json` rewrites every unmatched path
 * to `index.html`, so a missing PDF answers `200` with a page of HTML.
 */

type Phase = "idle" | "falling" | "impact" | "holding" | "fading";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** What the plate says when nothing is happening. Verified against the file. */
const RESTING_LABEL = "PDF · Two pages";

const FALL_SECONDS = 1;
const FALL_START = 0.26;
const IMPACT = FALL_START + FALL_SECONDS;
/** Cracks finish drawing about here, so this is when the scene can start holding. */
const HOLD_AT = IMPACT + 0.82;
const HOLD_SECONDS = 2;

/** The document's resting height above the bottom of the stage. */
const LANDING_CLASS = "bottom-[86px] sm:bottom-[112px]";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

/** One restrained rule of "type" on the illustrated page. Decoration only. */
function PageLine({
  width,
  tone = 0.16,
  height = 3,
}: {
  width: string;
  tone?: number;
  height?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className="block rounded-full"
      style={{
        width,
        height: `${height}px`,
        backgroundColor: `rgba(17,19,24,${tone})`,
      }}
    />
  );
}

/**
 * The illustrated page. It is a layout, not a resume: no name, no claims, no
 * qualifications. The lines stand in for text and nothing on it is readable, so
 * no part of this can be mistaken for the real document's contents.
 */
function DocumentPage() {
  return (
    <div className="relative w-full overflow-hidden rounded-[2px] bg-[#F7F5EF] shadow-[0_22px_44px_-16px_rgba(0,0,0,0.7)]">
      <div className="flex aspect-[10/13] w-full flex-col p-[9%]">
        <PageLine width="56%" tone={0.8} height={8} />
        <div className="mt-[5%] flex items-center gap-[6%]">
          <PageLine width="30%" tone={0.32} />
          <PageLine width="20%" tone={0.18} />
        </div>

        <span
          aria-hidden="true"
          className="mt-[7%] block h-px w-full"
          style={{ backgroundColor: "rgba(17,19,24,0.14)" }}
        />

        <div className="mt-[7%] flex flex-1 gap-[9%]">
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex flex-col gap-[7px]">
              <PageLine width="42%" tone={0.52} height={4} />
              <PageLine width="100%" />
              <PageLine width="92%" />
              <PageLine width="97%" />
              <PageLine width="70%" />
            </div>
            <div className="flex flex-col gap-[7px]">
              <PageLine width="48%" tone={0.52} height={4} />
              <PageLine width="96%" />
              <PageLine width="88%" />
              <PageLine width="94%" />
              <PageLine width="58%" />
            </div>
          </div>

          <div className="flex w-[30%] flex-col justify-between">
            <div className="flex flex-col gap-[7px]">
              <PageLine width="64%" tone={0.52} height={4} />
              <PageLine width="100%" />
              <PageLine width="82%" />
              <PageLine width="92%" />
            </div>
            <div className="flex flex-col gap-[7px]">
              <PageLine width="70%" tone={0.52} height={4} />
              <PageLine width="90%" />
              <PageLine width="100%" />
              <PageLine width="74%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResumeImpact() {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [label, setLabel] = React.useState(RESTING_LABEL);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const impactRef = React.useRef<HTMLDivElement>(null);
  const bloomRef = React.useRef<HTMLDivElement>(null);
  const rippleRef = React.useRef<HTMLSpanElement>(null);
  const flashRef = React.useRef<HTMLDivElement>(null);
  const shadowRef = React.useRef<HTMLDivElement>(null);
  const docRef = React.useRef<HTMLDivElement>(null);
  const controlRef = React.useRef<HTMLDivElement>(null);

  const runningRef = React.useRef(false);
  const contextRef = React.useRef<gsap.Context | null>(null);
  const timerRef = React.useRef<number | null>(null);
  const fileRef = React.useRef<"unknown" | "present" | "missing">("unknown");

  React.useEffect(
    () => () => {
      contextRef.current?.revert();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  /** The one place the scene talks to the browser about the file. */
  const handOver = React.useCallback(() => {
    if (fileRef.current === "missing") {
      setLabel("Resume unavailable");
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = RESUME_FILE;
    anchor.download = RESUME_FILENAME;
    anchor.rel = "noopener";
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    // "Initiated" is the honest word: the browser does not tell a page whether
    // a download was accepted, saved or cancelled.
    setLabel("Download initiated");
  }, []);

  const checkFile = React.useCallback(async () => {
    try {
      const response = await fetch(RESUME_FILE, { method: "HEAD" });
      const type = response.headers.get("content-type") ?? "";
      fileRef.current =
        response.ok && type.includes("pdf") ? "present" : "missing";
    } catch {
      fileRef.current = "missing";
    }
  }, []);

  const play = React.useCallback(() => {
    const stage = stageRef.current;
    const doc = docRef.current;
    const control = controlRef.current;
    const impact = impactRef.current;
    const bloom = bloomRef.current;
    const ripple = rippleRef.current;
    const flash = flashRef.current;
    const shadow = shadowRef.current;
    const scene = sceneRef.current;

    if (!stage || !doc || !control || runningRef.current) return;

    // Reduced motion gets the document, not the theatre: a quiet label, the
    // real download, and the plate back the way it was.
    if (
      prefersReducedMotion() ||
      !impact ||
      !bloom ||
      !ripple ||
      !flash ||
      !shadow ||
      !scene
    ) {
      runningRef.current = true;
      setPhase("holding");
      void checkFile();
      handOver();
      timerRef.current = window.setTimeout(() => {
        runningRef.current = false;
        setPhase("idle");
        setLabel(RESTING_LABEL);
      }, 1800);
      return;
    }

    runningRef.current = true;
    setPhase("falling");
    setLabel(RESTING_LABEL);
    void checkFile();

    const branches = gsap.utils.toArray<SVGPathElement>("[data-crack]", stage);
    const signals = gsap.utils.toArray<SVGCircleElement>("[data-signal]", stage);
    const allDust = gsap.utils.toArray<HTMLElement>("[data-dust]", stage);
    const dustCount =
      stage.clientWidth < 480 ? 6 : stage.clientWidth < 768 ? 9 : allDust.length;
    const dust = allDust.slice(0, dustCount);

    // Far enough above the stage that the page is out of sight at the start,
    // and no further: an over-long drop spends most of the fall off-stage and
    // the landing arrives before the eye has followed it down.
    const drop = doc.offsetHeight + 96;

    contextRef.current = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      /* --- A — the stage arrives, the control steps back ---------------- */
      tl.set(doc, {
        xPercent: -50,
        transformPerspective: 900,
        y: -drop,
        rotateX: -26,
        rotateZ: 8,
        opacity: 0,
      })
        .set(impact, { opacity: 0 })
        .set(shadow, { opacity: 0, scale: 0.55 })
        // The floor arrives before the page does, so there is something under it
        // to fall toward.
        .to(impact, { opacity: 1, duration: 0.46 }, 0)
        .to(control, { opacity: 0, duration: 0.2, ease: "power1.in" }, 0.06);

      /* --- B — the fall ------------------------------------------------- */
      // `power2.in` is the acceleration; the rotation settles on a slower,
      // steadier curve so the page lands flat rather than snapping to flat.
      tl.to(doc, { opacity: 1, duration: 0.16, ease: "none" }, FALL_START)
        .to(doc, { y: 0, duration: FALL_SECONDS, ease: "power2.in" }, FALL_START)
        .to(
          doc,
          { rotateX: 0, rotateZ: 0, duration: FALL_SECONDS, ease: "power1.inOut" },
          FALL_START,
        )
        .to(
          shadow,
          { opacity: 0.5, scale: 1, duration: FALL_SECONDS, ease: "power2.in" },
          FALL_START,
        );

      /* --- C — the impact ---------------------------------------------- */
      tl.call(() => setPhase("impact"), undefined, IMPACT)
        // The page compresses on contact and settles back.
        .to(doc, { scaleY: 0.94, duration: 0.08, ease: "power2.out" }, IMPACT)
        .to(doc, { scaleY: 1, duration: 0.36, ease: "power3.out" }, IMPACT + 0.08)
        .to(doc, { y: -7, duration: 0.12, ease: "power1.out" }, IMPACT)
        .to(doc, { y: 0, duration: 0.3, ease: "power2.inOut" }, IMPACT + 0.12)
        // One pulse of light, and the ring the floor pushes outward from it.
        .fromTo(
          flash,
          { opacity: 0 },
          { keyframes: { opacity: [0, 0.42, 0] }, duration: 0.38, ease: "power1.out" },
          IMPACT,
        )
        .fromTo(
          ripple,
          { scale: 0.08, opacity: 0.5 },
          { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out" },
          IMPACT,
        )
        // The break keeps glowing after the pulse: this is the light the
        // completed scene holds on, not another flash.
        .fromTo(
          bloom,
          { opacity: 0, scale: 0.7 },
          { opacity: 0.34, scale: 1, duration: 0.5, ease: "power2.out" },
          IMPACT + 0.04,
        )
        .fromTo(
          scene,
          { x: 0, y: 0 },
          {
            keyframes: {
              x: [0, -6, 5, -3, 2, 0],
              y: [0, 4, -3, 2, -1, 0],
            },
            duration: 0.34,
            ease: "power2.out",
          },
          IMPACT,
        )
        // Cracks draw outward from the landing point. The field is sorted
        // nearest-first, so one uniform stagger still runs outward in time.
        .to(
          branches,
          { strokeDashoffset: 0, duration: 0.3, stagger: 0.0035, ease: "power1.out" },
          IMPACT + 0.02,
        )
        .to(signals, { opacity: 0.85, duration: 0.3, stagger: 0.06 }, IMPACT + 0.3)
        .fromTo(
          dust,
          { opacity: 0.5, scale: 1 },
          {
            opacity: 0,
            scale: 0.3,
            x: (i: number) =>
              Math.cos((i / dust.length) * Math.PI * 2) * (30 + (i % 5) * 10),
            y: (i: number) =>
              Math.sin((i / dust.length) * Math.PI * 2) * (14 + (i % 4) * 7),
            duration: 0.62,
            stagger: 0.012,
            ease: "power2.out",
          },
          IMPACT,
        );

      /* --- D — hold, then hand the file over ---------------------------- */
      tl.call(() => setPhase("holding"), undefined, HOLD_AT)
        .to({}, { duration: HOLD_SECONDS }, HOLD_AT)
        .call(handOver);

      /* --- E — take it all back down ------------------------------------ */
      const fadeAt = HOLD_AT + HOLD_SECONDS;
      tl.call(() => setPhase("fading"), undefined, fadeAt)
        .to(doc, { opacity: 0, y: -18, duration: 0.5, ease: "power2.in" }, fadeAt)
        .to(bloom, { opacity: 0, scale: 0.8, duration: 0.45, ease: "power1.in" }, fadeAt)
        .to(
          branches,
          {
            strokeDashoffset: (i: number) => CRACK_BRANCHES[i]?.length ?? 0,
            duration: 0.32,
            stagger: 0.003,
            ease: "power1.in",
          },
          fadeAt,
        )
        .to(signals, { opacity: 0, duration: 0.3 }, fadeAt)
        .to(
          [impact, shadow],
          { opacity: 0, duration: 0.5, ease: "power1.in" },
          fadeAt + 0.08,
        )
        .to(control, { opacity: 1, duration: 0.4, ease: "power2.out" }, fadeAt + 0.46)
        // Back to the resting state, so a second press starts from the same
        // frame the first one did.
        .set(doc, { y: -drop, rotateX: -26, rotateZ: 8, scaleY: 1, opacity: 0 })
        .set(shadow, { opacity: 0, scale: 0.55 })
        .to({}, { duration: 0.16 })
        .call(() => {
          runningRef.current = false;
          setPhase("idle");
          setLabel(RESTING_LABEL);
        });
    }, stage);
  }, [checkFile, handOver]);

  const busy = phase !== "idle";

  return (
    <section
      id="resume"
      aria-labelledby="resume-heading"
      className="relative isolate scroll-mt-24 overflow-hidden border-t border-ink/10 bg-ink py-20 text-paper sm:py-28"
    >
      {/* The same 48px engineering module Scenes 02, 04, 05 and 07 sit on,
          inverted for ink. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(242,240,233,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(242,240,233,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6">
        <h2
          id="resume-heading"
          className="text-center font-mono text-[10px] uppercase tracking-[0.32em] text-paper/60"
        >
          08 / Resume
        </h2>

        <div
          ref={stageRef}
          className="relative mt-8 h-[340px] w-full overflow-hidden sm:h-[420px] lg:h-[460px]"
          style={{ perspective: "900px", perspectiveOrigin: "50% 34%" }}
        >
          {/* Everything the impact throws around lives in here, so the shake
              can move the scene without touching the control. */}
          <div ref={sceneRef} aria-hidden="true" className="absolute inset-0">
            {/* The impact plane. Squashed vertically so everything on it reads
                as lying on the floor rather than standing on the page. GSAP
                never writes a transform to this element, so the squash is safe
                to keep in the style attribute, and the floor, the light and the
                ring are all children of it — which is what keeps them
                registered to one another. The `opacity-0` is load-bearing: the
                timeline also sets this layer to zero, but that only happens on
                the first press, so without the class the floor would be on
                screen before anything had been clicked. */}
            <div
              ref={impactRef}
              className={`pointer-events-none absolute left-1/2 aspect-square w-[min(118vw,640px)] opacity-0 ${LANDING_CLASS}`}
              style={{ transform: "translateX(-50%) translateY(50%) scaleY(0.62)" }}
            >
              {/* The floor itself: a pool of the same ink the section sits on,
                  lifted rather than recoloured, on the same 48px module as every
                  other scene. Rendered as an ellipse and masked back to nothing
                  at its own edge, so it has no horizon line and no sides to give
                  itself away as a rectangle. The blueprint only tints the far
                  side, which is where a surface would catch the light. */}
              <div
                aria-hidden="true"
                className="absolute inset-[-9%] rounded-[50%]"
                style={{
                  backgroundImage: [
                    "radial-gradient(66% 48% at 50% 26%, rgba(89,119,232,0.14), transparent 72%)",
                    "radial-gradient(78% 62% at 50% 42%, rgba(242,240,233,0.12), rgba(242,240,233,0.045) 56%, transparent 90%)",
                    "repeating-linear-gradient(to right, rgba(242,240,233,0.065) 0 1px, transparent 1px 34px)",
                    "repeating-linear-gradient(to bottom, rgba(242,240,233,0.065) 0 1px, transparent 1px 34px)",
                  ].join(", "),
                  maskImage:
                    "radial-gradient(closest-side, #000 4%, rgba(0,0,0,0.42) 58%, transparent 92%)",
                  WebkitMaskImage:
                    "radial-gradient(closest-side, #000 4%, rgba(0,0,0,0.42) 58%, transparent 92%)",
                }}
              />

              {/* The light the break gives off. */}
              <div
                ref={bloomRef}
                className="absolute inset-[-16%] rounded-[50%] opacity-0"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(89,119,232,0.3), rgba(89,119,232,0.07) 54%, transparent 78%)",
                }}
              />

              {/* The pulse at the moment of contact. */}
              <div
                ref={flashRef}
                className="absolute inset-[-34%] rounded-[50%] opacity-0"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(112,140,240,0.6), transparent 72%)",
                }}
              />

              {/* The ring the floor pushes out from the landing point. */}
              <span className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[68%] -translate-x-1/2 -translate-y-1/2">
                <span
                  ref={rippleRef}
                  className="block h-full w-full rounded-[50%] border border-blueprint/55 opacity-0"
                />
              </span>

              <svg
                viewBox={CRACK_VIEWBOX}
                className="absolute inset-0 h-full w-full"
                fill="none"
                aria-hidden="true"
              >
                {CRACK_BRANCHES.map((branch, index) => (
                  <path
                    key={`branch-${index}`}
                    data-crack
                    d={branch.d}
                    stroke="#5977E8"
                    strokeWidth={branch.width}
                    strokeOpacity={branch.opacity}
                    // Round *joins*, square *ends* — deliberately. A round cap
                    // renders a dot at a dash boundary even when the dash is
                    // fully offset, so while the field was still undrawn every
                    // branch would sprinkle a mote of blue over the floor.
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: branch.length,
                      strokeDashoffset: branch.length,
                    }}
                  />
                ))}
                {CRACK_SIGNALS.map((signal, index) => (
                  <circle
                    key={`signal-${index}`}
                    data-signal
                    cx={signal.cx}
                    cy={signal.cy}
                    r={signal.r}
                    fill="#C4F06A"
                    style={{ opacity: 0 }}
                  />
                ))}
              </svg>
            </div>

            {/* The shadow under the page: scale and weight both grow as the
                page closes on the floor, which is what reads as sharpening. */}
            <div
              className={`pointer-events-none absolute left-1/2 -translate-x-1/2 translate-y-1/2 ${LANDING_CLASS}`}
            >
              <div
                ref={shadowRef}
                className="h-[30px] w-[190px] rounded-[50%] opacity-0 sm:w-[220px]"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(0,0,0,0.85), transparent 74%)",
                }}
              />
            </div>

            {/* Dust: a few motes thrown out and gone. */}
            <div
              className={`pointer-events-none absolute left-1/2 ${LANDING_CLASS}`}
              style={{ transform: "translateX(-50%)" }}
            >
              {Array.from({ length: 14 }, (_, index) => (
                <span
                  key={`dust-${index}`}
                  data-dust
                  className="absolute left-0 top-0 block size-[3px] rounded-full bg-paper/45 opacity-0"
                />
              ))}
            </div>

            {/* The page. GSAP owns this transform completely — no Tailwind
                transform classes, or the two would overwrite each other. */}
            <div
              ref={docRef}
              className={`absolute left-1/2 w-[184px] opacity-0 sm:w-[228px] ${LANDING_CLASS}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <DocumentPage />
            </div>
          </div>

          {/* The control. The only interactive thing in the scene, and the only
              thing visible while the scene is idle. */}
          <div
            ref={controlRef}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={play}
              disabled={busy}
              className="inline-flex min-h-[44px] items-center gap-2.5 rounded-full border border-paper/25 bg-paper/[0.06] px-7 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-paper transition-colors hover:border-paper/60 hover:bg-paper/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                aria-hidden="true"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z" />
                <path d="M14 3v4h4M9 13h6M9 17h4" />
              </svg>
              View Resume
            </button>

            <p
              aria-live="polite"
              className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/50"
            >
              {label}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResumeImpact;
