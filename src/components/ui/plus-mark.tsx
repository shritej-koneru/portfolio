import { PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The hairline plus that sits on a grid crossing.
 *
 * This is the one visual pattern taken from 21st.dev's "Logo Cloud 2"
 * (`@efferd/components/logo-cloud-2`) — it draws a small plus where the borders
 * of its logo cells meet. The component itself is deliberately *not* vendored:
 * it depends on Next.js and framer-motion, neither of which is in this project,
 * its licence is listed as unknown, and it renders brand logos we do not have
 * assets for. Adapting the mark — and the bordered cell grid it sits in, which
 * the toolkit builds from its own tokens — is the useful part.
 *
 * `z-10` is not decoration. The mark is centred on the corner, so half of it
 * hangs outside its own cell and would otherwise be painted over by the next
 * cell along. `pointer-events-none` keeps that overhang from extending a
 * neighbouring tile's hit area.
 */
export function PlusMark({ className }: { className?: string }) {
  return (
    <PlusIcon
      aria-hidden="true"
      strokeWidth={1}
      className={cn("pointer-events-none absolute z-10 size-5 text-ink/25", className)}
    />
  );
}
