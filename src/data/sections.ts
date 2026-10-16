/**
 * The eight scenes of the home page, in page order.
 *
 * Two things read this: the site index at the foot of the page, and the menu
 * that replaces the browser's context menu on right-click. Keeping one list
 * means the two can never disagree about what a scene is called or where it
 * lives.
 *
 * The `href` is a plain in-page anchor. The router deliberately leaves `#hash`
 * addresses to the browser (see `onClick` in `@/lib/router`), so a click lands
 * exactly where a click on the site index lands, and scrolls the same way.
 */

export const SECTIONS = [
  { number: "01", label: "Opening", href: "#opening" },
  { number: "02", label: "Introduction", href: "#hero" },
  { number: "03", label: "Work", href: "#work" },
  { number: "04", label: "Open source", href: "#open-source" },
  { number: "05", label: "Journey", href: "#about" },
  { number: "06", label: "Toolkit", href: "#toolkit" },
  { number: "07", label: "Contact", href: "#contact" },
  { number: "08", label: "Resume", href: "#resume" },
] as const;
