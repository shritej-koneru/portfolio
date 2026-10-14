import { usePageTitle } from "@/lib/router";

/**
 * An address that matches nothing.
 *
 * There is no pretending this page exists: it says what was asked for and offers
 * the two ways back — the home page, and the index of the work.
 */
export function NotFoundPage({ path }: { path: string }) {
  usePageTitle("Not found · Shritej Koneru");

  return (
    <main className="relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blueprint">
        404
      </p>
      <h1 className="mt-4 max-w-2xl text-pretty font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
        Nothing is drawn at this address.
      </h1>
      <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-ink/70">
        No page is published at{" "}
        <span className="font-mono text-[15px] text-ink/60">{path}</span>.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-7 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-paper transition-colors hover:bg-blueprint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Home
        </a>
        <a
          href="/#work"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/25 px-7 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ink/80 transition-colors hover:border-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          All work
        </a>
      </div>
    </main>
  );
}

export default NotFoundPage;
