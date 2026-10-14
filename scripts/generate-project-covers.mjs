// Generates temporary Digital Blueprint cover plates for the project wheel.
//
// These are placeholders, not screenshots. Replace the generated file (or point
// `image` in src/data/projects.ts at a real screenshot) when you have artwork.
//
//   node scripts/generate-project-covers.mjs
//
// Output: public/images/projects/<slug>.svg
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "images", "projects");

// Keep this in sync with the slugs in src/data/projects.ts.
const projects = [
  { slug: "equialert", title: "EquiAlert" },
  { slug: "stocks-api", title: "Stocks API" },
  { slug: "floatchat-sahe", title: "FloatChat SAHE" },
  { slug: "friday", title: "FRIDAY" },
  { slug: "projectnova", title: "ProjectNOVA" },
  { slug: "multi-file-conversion", title: "Multi-File Conversion" },
  { slug: "ai-study-assistant", title: "AI Study Assistant" },
  { slug: "retroos", title: "RetroOS" },
  { slug: "event-management-hub", title: "Event Management Hub" },
  { slug: "expense-tracker", title: "Expense Tracker" },
  { slug: "lgc-official-website", title: "LGC Official Website" },
  { slug: "qr-display-hologram", title: "QR Display Hologram" },
  { slug: "uppalapati-farms-ghee", title: "Uppalapati Farms Ghee" },
  { slug: "awssahe", title: "AWS SAHE" },
  { slug: "portfolio", title: "Portfolio" },
];

const PAPER = "#F2F0E9";
const INK = "#111318";
const BLUE = "#5977E8";
const LIME = "#C4F06A";

const W = 1450;
const H = 1000;

const initials = (title) =>
  title
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const cover = ({ slug, title }, i) => {
  const accent = i % 2 === 0 ? BLUE : INK;
  const monogram = initials(title);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(title)} (temporary cover)">
  <defs>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M50 0H0V50" fill="none" stroke="${INK}" stroke-opacity="0.07" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect x="26.5" y="26.5" width="${W - 53}" height="${H - 53}" fill="none" stroke="${INK}" stroke-opacity="0.22" stroke-width="1"/>
  <g stroke="${INK}" stroke-opacity="0.5" stroke-width="1">
    <path d="M26 12v28M12 26h28"/>
    <path d="M${W - 26} 12v28M${W - 40} 26h28"/>
    <path d="M26 ${H - 40}v28M12 ${H - 26}h28"/>
    <path d="M${W - 26} ${H - 40}v28M${W - 40} ${H - 26}h28"/>
  </g>
  <rect x="26.5" y="26.5" width="10" height="${H - 53}" fill="${accent}"/>
  <text x="96" y="${H * 0.62}" font-family="ui-monospace, 'Cascadia Mono', Consolas, monospace" font-size="440" font-weight="700" fill="${INK}" fill-opacity="0.88" letter-spacing="-8">${esc(monogram)}</text>
  <line x1="96" y1="${H - 168}" x2="${W - 96}" y2="${H - 168}" stroke="${accent}" stroke-width="6"/>
  <text x="96" y="${H - 104}" font-family="ui-monospace, 'Cascadia Mono', Consolas, monospace" font-size="42" fill="${INK}" fill-opacity="0.85" letter-spacing="6">${esc(title.toUpperCase())}</text>
  <text x="96" y="${H - 56}" font-family="ui-monospace, 'Cascadia Mono', Consolas, monospace" font-size="24" fill="${INK}" fill-opacity="0.45" letter-spacing="4">${esc(slug)}</text>
  <text x="${W - 96}" y="76" text-anchor="end" font-family="ui-monospace, 'Cascadia Mono', Consolas, monospace" font-size="24" fill="${accent}" letter-spacing="6">TEMPORARY COVER</text>
  <circle cx="${W - 84}" cy="${H - 76}" r="7" fill="${LIME}"/>
</svg>
`;
};

mkdirSync(outDir, { recursive: true });
projects.forEach((p, i) => {
  const file = join(outDir, `${p.slug}.svg`);
  writeFileSync(file, cover(p, i), "utf8");
  console.log("wrote", file);
});
