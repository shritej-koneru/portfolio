import * as React from "react";

import { SECTIONS } from "@/data/sections";

/** How close the panel is allowed to get to any edge of the window. */
const GUTTER = 8;

/**
 * The list, on right-click.
 *
 * The browser's own context menu is suppressed across the home page and this
 * takes its place: wherever the pointer is, the eight scenes open as an index,
 * and choosing one moves the page to it. The rows are plain `#hash` anchors, so
 * a click lands exactly where a click on the footer's site index lands — the
 * router leaves in-page anchors to the browser (see `onClick` in
 * `@/lib/router`), which is what gives them the site's smooth scroll.
 *
 * It is mounted beside the footer rather than inside `<main>` for two reasons:
 * the index is page furniture rather than page content, and scenes 05–08 run
 * `perspective` and `transform` on their own subtrees, which would turn any
 * ancestor of a `position: fixed` panel into its containing block.
 */
export function SectionMenu() {
  /** Where the menu was asked for, or `null` while it is shut. */
  const [point, setPoint] = React.useState<{ x: number; y: number } | null>(null);
  /** Where it actually sits, once it has been measured and pushed on screen. */
  const [placed, setPlaced] = React.useState({ x: GUTTER, y: GUTTER });

  const panelRef = React.useRef<HTMLDivElement>(null);
  /** What had focus when the menu opened, for Escape to hand it back to. */
  const returnFocusRef = React.useRef<Element | null>(null);

  const close = React.useCallback(() => setPoint(null), []);

  // Open. Registered on every right-click in the page, including the ones that
  // land on a scene that swallows clicks of its own — nothing here is opt-in.
  React.useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      if (event.defaultPrevented) return;

      // The browser's menu never appears on this page, the panel's own rows
      // included; a right-click there simply leaves the panel where it is.
      event.preventDefault();

      const panel = panelRef.current;
      if (panel && event.target instanceof Node && panel.contains(event.target)) {
        return;
      }

      const focused = document.activeElement;

      // A context menu asked for with the keyboard — the Menu key, Shift+F10,
      // the accessibility menu — arrives as 0,0 rather than at a pointer. Put
      // it against whatever has focus instead.
      const rect =
        event.clientX === 0 && event.clientY === 0 && focused instanceof Element
          ? focused.getBoundingClientRect()
          : null;

      returnFocusRef.current = focused;
      setPoint({
        x: rect ? rect.left : event.clientX,
        y: rect ? rect.bottom : event.clientY,
      });
    };

    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, []);

  // Place, then hand the menu the keyboard. A layout effect, so the panel is
  // measured and moved before it is ever painted at the pointer — no flash of
  // it hanging off the bottom edge on a short window.
  React.useLayoutEffect(() => {
    if (!point) return;
    const panel = panelRef.current;
    if (!panel) return;

    const { width, height } = panel.getBoundingClientRect();
    setPlaced({
      x: Math.max(GUTTER, Math.min(point.x, window.innerWidth - width - GUTTER)),
      y: Math.max(GUTTER, Math.min(point.y, window.innerHeight - height - GUTTER)),
    });

    // Focus the first row so Escape and the arrow keys work without a click.
    // `preventScroll` keeps the page from jumping to the panel.
    panel
      .querySelector<HTMLElement>('[role="menuitem"]')
      ?.focus({ preventScroll: true });
  }, [point]);

  // Dismiss. Each of these answers a different way of leaving: a click or a tap
  // anywhere else, the page moving under the panel, the window resizing, or the
  // window itself losing focus.
  React.useEffect(() => {
    if (!point) return;

    const onPointerDown = (event: PointerEvent) => {
      const panel = panelRef.current;
      if (panel && event.target instanceof Node && panel.contains(event.target)) {
        return;
      }
      setPoint(null);
    };
    const dismiss = () => setPoint(null);

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", dismiss, { capture: true, passive: true });
    window.addEventListener("resize", dismiss);
    window.addEventListener("blur", dismiss);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", dismiss, { capture: true });
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("blur", dismiss);
    };
  }, [point]);

  /**
   * The keyboard the panel promises by being a `role="menu"`: arrows walk the
   * rows, Home and End go to the ends, Escape closes and hands focus back, and
   * Tab leaves — this is a menu, not a modal.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      const back = returnFocusRef.current;
      setPoint(null);
      if (back instanceof HTMLElement && back.isConnected) {
        back.focus({ preventScroll: true });
      }
      return;
    }

    if (event.key === "Tab") {
      setPoint(null);
      return;
    }

    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    if (items.length === 0) return;

    const current = items.indexOf(document.activeElement as HTMLElement);
    const last = items.length - 1;

    // An anchor answers Enter on its own, but not the space bar.
    if (event.key === " " || event.key === "Spacebar") {
      if (current >= 0) {
        event.preventDefault();
        items[current].click();
      }
      return;
    }

    let next: number;
    switch (event.key) {
      case "ArrowDown":
        next = current < 0 || current === last ? 0 : current + 1;
        break;
      case "ArrowUp":
        next = current <= 0 ? last : current - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }

    event.preventDefault();
    items[next].focus({ preventScroll: true });
  };

  if (!point) return null;

  return (
    <div
      ref={panelRef}
      role="menu"
      aria-label="Site index"
      onKeyDown={onKeyDown}
      style={{ left: placed.x, top: placed.y }}
      className="fixed z-50 w-64 max-h-[calc(100dvh-1rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-xl border border-ink/12 bg-background shadow-[0_18px_40px_-18px_rgba(17,19,24,0.5)]"
    >
      {/* Outside the accessibility tree on purpose: a `role="menu"` should hold
          menu items and nothing else, and the `aria-label` above already gives
          the panel its name. */}
      <p
        aria-hidden="true"
        className="border-b border-ink/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60"
      >
        Site index
      </p>

      {SECTIONS.map(({ number, label, href }) => (
        <a
          key={number}
          href={href}
          role="menuitem"
          onClick={close}
          className="flex min-h-[44px] items-center gap-3 border-b border-ink/10 px-4 font-display text-base text-ink transition-colors last:border-b-0 hover:bg-ink/[0.03] focus-visible:bg-ink/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blueprint"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
            {number}
          </span>
          {label}
        </a>
      ))}
    </div>
  );
}
