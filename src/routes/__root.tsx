import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel-glow max-w-md p-8 text-center">
        <div className="font-display text-7xl text-glow-cyan">404</div>
        <h2 className="mt-4 font-display tracking-[0.3em] text-foreground">SIGNAL LOST</h2>
        <p className="mt-2 text-sm text-muted-foreground">The requested coordinates are outside known space.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md border border-cyan/40 bg-cyan/10 px-4 py-2 font-mono text-xs tracking-widest text-glow-cyan hover:bg-cyan/20">
          RETURN TO BASE
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel max-w-md p-8 text-center">
        <h1 className="font-display tracking-[0.3em] text-critical">SYSTEM FAULT</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message || "An unexpected error occurred."}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md border border-cyan/40 bg-cyan/10 px-4 py-2 font-mono text-xs tracking-widest text-glow-cyan hover:bg-cyan/20">
            RETRY
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ORBITRA — Project Zenith: The Celestial Eye" },
      { name: "description", content: "Discover what exists directly above any point on Earth in real time. ORBITRA is an advanced space surveillance and zenith observatory." },
      { property: "og:title", content: "ORBITRA — Project Zenith" },
      { property: "og:description", content: "Real-time celestial surveillance: ISS, satellites, planets and space weather above any point on Earth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
