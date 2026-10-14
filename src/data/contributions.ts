import * as React from "react";

import { GITHUB_PROFILE } from "@/data/projects";

/**
 * Scene 04 data — the real GitHub contribution history.
 *
 * Where it comes from: GitHub has no unauthenticated REST or GraphQL endpoint
 * for the contribution calendar, and `github.com/users/<user>/contributions`
 * is served without CORS headers, so a static browser app cannot read the
 * graph from github.com directly. The public, key-less
 * `github-contributions-api.jogruber.de` service resolves that same public
 * graph and does allow cross-origin reads, which is what this module uses.
 *
 * Nothing here is invented and no token or secret is involved: if the request
 * fails, the scene shows a documented fallback that links to the profile
 * instead of drawing made-up activity. See README.md > "Scene 04".
 */

/** Taken from the one profile URL the rest of the site already uses. */
export const GITHUB_USERNAME =
  GITHUB_PROFILE.replace(/\/+$/, "").split("/").pop() ?? "";

export const CONTRIBUTIONS_ENDPOINT = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;

/** How long the request may take before the scene falls back. */
const REQUEST_TIMEOUT_MS = 9000;

export interface ContributionDay {
  /** `YYYY-MM-DD`, UTC. */
  date: string;
  count: number;
}

export interface ContributionHistory {
  days: ContributionDay[];
  total: number;
}

export type ContributionsState =
  | { state: "loading" }
  | { state: "ready"; history: ContributionHistory }
  | { state: "empty" }
  | { state: "unavailable" };

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Keeps only well-formed days, adds repeated dates up, sorts oldest → newest.
 * Returns null for anything that does not look like a contribution calendar,
 * so a surprise response can never render as a chart.
 */
export function readContributions(payload: unknown): ContributionHistory | null {
  if (!payload || typeof payload !== "object") return null;
  const raw = (payload as { contributions?: unknown }).contributions;
  if (!Array.isArray(raw)) return null;

  const counts = new Map<string, number>();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const { date, count } = entry as { date?: unknown; count?: unknown };
    if (typeof date !== "string" || !DATE.test(date)) continue;
    const value = Number(count);
    if (!Number.isFinite(value) || value < 0) continue;
    counts.set(date, (counts.get(date) ?? 0) + Math.floor(value));
  }
  if (counts.size === 0) return null;

  const days = [...counts.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  return { days, total: days.reduce((sum, day) => sum + day.count, 0) };
}

/**
 * Loads the history once on mount. Always resolves to a real state — never to
 * generated data — so the scene can be honest about what it is showing.
 */
export function useContributionHistory(): ContributionsState {
  const [state, setState] = React.useState<ContributionsState>({
    state: "loading",
  });

  React.useEffect(() => {
    if (!GITHUB_USERNAME || typeof fetch !== "function") {
      setState({ state: "unavailable" });
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    void (async () => {
      try {
        const response = await fetch(CONTRIBUTIONS_ENDPOINT, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const history = readContributions(await response.json());
        if (!history) throw new Error("Unrecognised contribution payload");
        if (cancelled) return;
        setState(
          history.total > 0
            ? { state: "ready", history }
            : { state: "empty" },
        );
      } catch {
        if (cancelled) return;
        setState({ state: "unavailable" });
      } finally {
        window.clearTimeout(timer);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  return state;
}
