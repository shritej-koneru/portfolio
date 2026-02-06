import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useEffect } from "react";
import { useGitHubProfile } from "@/hooks/use-portfolio";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function FaviconUpdater() {
  const { data: profile } = useGitHubProfile();

  useEffect(() => {
    if (profile?.avatar_url) {
      // Update all favicon links
      const links = document.querySelectorAll("link[rel*='icon']");
      links.forEach(link => link.remove());

      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.type = 'image/png';
      newLink.href = profile.avatar_url;
      document.head.appendChild(newLink);

      // Also update apple-touch-icon
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = profile.avatar_url;
      document.head.appendChild(appleLink);
    }
  }, [profile?.avatar_url]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FaviconUpdater />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
