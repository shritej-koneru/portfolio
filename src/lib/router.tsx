import * as React from "react";

/**
 * The site's addresses.
 *
 * There are exactly two shapes: the home page at `/`, and one page per project
 * at `/work/<slug>`. That is small enough to route without a dependency — the
 * History API plus `useSyncExternalStore` — which keeps the bundle the size it
 * was. `vercel.json` already rewrites every path to `index.html`, so a deep link
 * lands on the same page a click would.
 *
 * Anything that points at another page writes an ordinary root-relative
 * `<a href>`. `useRouter` installs one delegated click listener that upgrades
 * those links to client-side navigation, which means links inside components
 * that know nothing about routing — the wheel's cards, for instance — work too.
 * External links, new tabs, downloads and modified clicks are left to the
 * browser, and `#section` links stay native so in-page anchors are untouched.
 */

/** A project's address. One page per project, keyed by its canonical slug. */
export function projectPath(slug: string): string {
  return `/work/${encodeURIComponent(slug)}`;
}

export type Route =
  | { name: "home" }
  | { name: "project"; slug: string }
  /** An address that matches nothing — rendered honestly, never a blank page. */
  | { name: "not-found"; path: string };

/** `/work/equialert/` and `/work/equialert` are the same address. */
function normalize(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** Resolves an address to the page that renders it. */
export function matchRoute(pathname: string): Route {
  const path = normalize(pathname);
  // `/work` on its own is the index of the work, which is the home page.
  if (path === "/" || path === "/work") return { name: "home" };

  const project = /^\/work\/([^/]+)$/.exec(path);
  if (project) return { name: "project", slug: decodeURIComponent(project[1]) };

  return { name: "not-found", path };
}

/** Address identity, used to remember where the reader had got to. */
const addressKey = (location: Location) =>
  normalize(location.pathname) + location.search;

const listeners = new Set<() => void>();
const scrollMemory = new Map<string, number>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Moves the page without the scroll animation `html { scroll-behavior: smooth }`
 * would add — a new page should simply be there, not glide into place. The
 * stylesheet rule is restored on the next frame, so every other scroll on the
 * site still behaves as before.
 */
function jumpTo(top: number): void {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, top);
  requestAnimationFrame(() => {
    root.style.scrollBehavior = previous;
  });
}

/**
 * Lands on the address's anchor if it names one, otherwise at `top`. The target
 * may belong to a page that has not rendered yet, so the lookup is retried over
 * a handful of frames before falling back to the plain position.
 */
function settleAt(hash: string, top: number, attempt = 0): void {
  requestAnimationFrame(() => {
    if (hash) {
      let target: Element | null = null;
      try {
        target = document.querySelector(hash);
      } catch {
        // A hash that isn't a valid selector is simply not an anchor.
        target = null;
      }
      if (target) {
        jumpTo(target.getBoundingClientRect().top + window.scrollY);
        return;
      }
      if (attempt < 30) {
        settleAt(hash, top, attempt + 1);
        return;
      }
    }
    jumpTo(top);
  });
}

/** Where the reader was on the page they are leaving. */
export function navigate(to: string): void {
  const url = new URL(to, window.location.origin);
  if (url.origin !== window.location.origin) {
    window.location.assign(url.href);
    return;
  }

  const destination = url.pathname + url.search + url.hash;
  const current =
    window.location.pathname + window.location.search + window.location.hash;

  // Re-clicking the page you are on should still take you to its anchor.
  if (destination === current) {
    settleAt(url.hash, 0);
    return;
  }

  scrollMemory.set(addressKey(window.location), window.scrollY);
  window.history.pushState(null, "", destination);
  emit();
  settleAt(url.hash, 0);
}

/** The anchor a click landed on, if that click landed on one at all. */
function anchorFrom(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest("a[href]");
}

/**
 * Reads the current address and keeps it in sync with the browser. It also owns
 * the two behaviours that make those addresses feel like pages: a new page
 * starts at its top (or its own anchor), and the back button returns the reader
 * to where they were rather than to the top of whatever came before.
 *
 * Called once, from the app shell.
 */
export function useRouter(): Route {
  React.useEffect(() => {
    // The router places the page itself, so the browser must not try to.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = anchorFrom(event.target);
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href") ?? "";
      // Root-relative paths are ours. `#section` is not, so in-page anchors
      // keep their native behaviour.
      if (!href.startsWith("/") || href.startsWith("//")) return;

      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      event.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };

    const onPopState = () => {
      const remembered = scrollMemory.get(addressKey(window.location));
      emit();
      settleAt(window.location.hash, remembered ?? 0);
    };

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const pathname = React.useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => "/",
  );

  return React.useMemo(() => matchRoute(pathname), [pathname]);
}

/** Keeps the browser tab in step with the page being read. */
export function usePageTitle(title: string): void {
  React.useEffect(() => {
    document.title = title;
  }, [title]);
}
