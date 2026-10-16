import * as React from "react";

import { cn } from "@/lib/utils";

export interface ToolkitTab {
  id: string;
  label: string;
  /** Derived from the technology data — never written by hand. */
  count: number;
}

export interface ToolkitTabsProps {
  tabs: ToolkitTab[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Stable id of the region these tabs reveal. Every tab points at it. */
  panelId: string;
  /** Prefix for the tab ids, so the panel can label itself by the active tab. */
  idPrefix: string;
  label: string;
  className?: string;
}

/** The id a tab carries. Shared so the panel can point back at the right one. */
export function toolkitTabId(prefix: string, id: string): string {
  return `${prefix}-tab-${id}`;
}

/** Zero-padded counts, so the tab row never shifts as the numbers change. */
export function formatCount(count: number): string {
  return count < 10 ? `0${count}` : String(count);
}

/**
 * The ARIA tabs pattern, written out rather than pulled in.
 *
 * Everything the pattern asks for is here: one `tablist`, a roving tabindex so
 * the group is a single tab stop, and the arrow keys plus Home/End moving both
 * focus and selection — the panels are a dozen rows of markup, so automatic
 * activation is the honest choice rather than an extra Enter press.
 *
 * The pill is a single element that slides between tabs instead of each tab
 * painting its own background. It is measured from the live layout, so it stays
 * true at every breakpoint, through a font swap, and when the counts change
 * width. Selection is also the accessibility state — `aria-selected` drives it,
 * so there is no second source of truth to keep in step.
 */
export function ToolkitTabs({
  tabs,
  activeId,
  onSelect,
  panelId,
  idPrefix,
  label,
  className,
}: ToolkitTabsProps) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [pill, setPill] = React.useState<{ left: number; width: number } | null>(null);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const active = list.querySelector<HTMLElement>(
        '[data-toolkit-tab][aria-selected="true"]',
      );
      if (!active) return;

      const listRect = list.getBoundingClientRect();
      const tabRect = active.getBoundingClientRect();
      setPill({
        // Rect maths rather than `offsetLeft` so the pill lands correctly no
        // matter which box `offsetLeft` is measured against.
        left: tabRect.left - listRect.left - list.clientLeft + list.scrollLeft,
        width: tabRect.width,
      });

      // On a phone the row scrolls, so keep the selected tab in view using the
      // container's own scroll — never the page's.
      const viewLeft = list.scrollLeft;
      const viewRight = viewLeft + list.clientWidth;
      if (active.offsetLeft < viewLeft) {
        list.scrollLeft = Math.max(0, active.offsetLeft - 12);
      } else if (active.offsetLeft + active.offsetWidth > viewRight) {
        list.scrollLeft =
          active.offsetLeft + active.offsetWidth - list.clientWidth + 12;
      }
    };

    measure();

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (observer) {
      observer.observe(list);
      list.querySelectorAll("[data-toolkit-tab]").forEach((tab) => observer.observe(tab));
    }
    window.addEventListener("resize", measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [tabs, activeId]);

  const move = (step: number) => {
    const list = listRef.current;
    if (!list) return;
    const buttons = Array.from(
      list.querySelectorAll<HTMLButtonElement>("[data-toolkit-tab]"),
    );
    if (buttons.length === 0) return;

    const current = buttons.findIndex((button) => button.dataset.tabId === activeId);
    const index = ((current < 0 ? 0 : current) + step + buttons.length) % buttons.length;
    const next = buttons[index];
    if (!next) return;

    next.focus();
    const id = next.dataset.tabId;
    if (id) onSelect(id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;
      case "Home":
        event.preventDefault();
        move(-tabs.length);
        break;
      case "End":
        event.preventDefault();
        move(tabs.length);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex w-full items-center gap-1 overflow-x-auto rounded-full border border-ink/10 bg-card p-1",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <span
        aria-hidden="true"
        style={
          pill
            ? { width: `${pill.width}px`, transform: `translateX(${pill.left}px)` }
            : undefined
        }
        className={cn(
          "pointer-events-none absolute bottom-1 left-0 top-1 rounded-full bg-ink transition-[transform,width] duration-300 ease-out motion-reduce:transition-none",
          pill ? "opacity-100" : "opacity-0",
        )}
      />
      {tabs.map((tab) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            data-toolkit-tab=""
            data-tab-id={tab.id}
            id={toolkitTabId(idPrefix, tab.id)}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "relative z-10 inline-flex shrink-0 items-center gap-2 rounded-full min-h-[44px] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em]",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint motion-reduce:transition-none",
              selected ? "text-paper" : "text-ink/60 hover:text-ink",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "text-[10px] tabular-nums",
                selected ? "text-paper/70" : "text-ink/55",
              )}
            >
              {formatCount(tab.count)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
