import { useRouter } from "@/lib/router";
import { HomePage } from "@/pages/home";
import { NotFoundPage } from "@/pages/not-found";
import { ProjectPage } from "@/pages/project";

/**
 * The shell — it owns the address and nothing else.
 *
 * `/` is the home page: the opening ink reveal, the blueprint hero, the works
 * wheel, the contribution skyline and the About anchor. `/work/<slug>` is one
 * project on its own page, which is where a project opens to when it is clicked
 * in the wheel or in the cards beneath it.
 *
 * Each page renders its own `<main>`, so there is exactly one on every address.
 */
export default function App() {
  const route = useRouter();

  if (route.name === "project") {
    // Keyed by slug so turning to another project starts that page afresh.
    return <ProjectPage key={route.slug} slug={route.slug} />;
  }

  if (route.name === "not-found") return <NotFoundPage path={route.path} />;

  return <HomePage />;
}
