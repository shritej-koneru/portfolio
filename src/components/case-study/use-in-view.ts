import * as React from "react";

/**
 * The repository's only motion dependency is Tailwind, so reveals are plain CSS
 * transitions toggled by a single IntersectionObserver — the same pattern Scene
 * 04 uses, lifted into a hook so every block in Scene 05 can stagger itself
 * without each one re-implementing an observer.
 *
 * Reduced motion and missing observer support both resolve to "already
 * revealed": the content is present and readable, just without the transition.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export interface UseInViewOptions {
  /** Fraction of the element that must be visible. */
  threshold?: number;
  /** Pre-reveal distance, e.g. "-10% 0px" to fire slightly early. */
  rootMargin?: string;
}

export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin,
}: UseInViewOptions = {}) {
  const ref = React.useRef<T>(null);
  const [state, setState] = React.useState({ inView: false, reduced: false });

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setState({ inView: true, reduced: true });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState({ inView: true, reduced: false });
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView: state.inView, reduced: state.reduced };
}

/** `undefined` delay is dropped so the class list stays clean. */
export const Reveal = {
  /** Base transition shared by every revealed block. */
  base: "transition duration-700 ease-out motion-reduce:transition-none",
  hidden: "translate-y-4 opacity-0",
  shown: "translate-y-0 opacity-100",
};

/** Joins the reveal classes for a block, with an optional stagger delay. */
export function revealClass(
  shown: boolean,
  delayMs = 0,
  extra = "",
): { className: string; style?: React.CSSProperties } {
  return {
    className: [Reveal.base, shown ? Reveal.shown : Reveal.hidden, extra]
      .filter(Boolean)
      .join(" "),
    style: delayMs ? { transitionDelay: `${delayMs}ms` } : undefined,
  };
}
