import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Home, RefreshCw, Swords } from "lucide-react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="felt-surface gold-frame felt-sheen p-8 text-center">
          <p className="font-display text-[88px] font-bold leading-none text-primary engravure-text animate-gold-pulse">
            404
          </p>
          <p className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            House Empty
          </p>
          <h1 className="mt-4 text-2xl font-display font-bold text-foreground">
            This table doesn&apos;t exist
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you&apos;re looking for folded, moved, or never made it to
            the floor.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-[#aa8524] px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
            >
              <Home className="size-4 mr-2" />
              Back to the floor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="felt-surface gold-frame p-8 text-center">
          <Swords className="mx-auto mb-4 size-14 text-danger" />
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
            The dealer slipped
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong on our end. Shuffle again by retrying or
            heading back home.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-[#aa8524] px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
            >
              <RefreshCw className="size-4 mr-2" />
              Try again
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-border bg-elevated px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="size-4 mr-2" />
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "ZeniPesa — Classic Crash Casino" },
        {
          name: "description",
          content:
            "ZeniPesa is a classic crash casino with instant M-Pesa deposits and withdrawals in Kenya. Ride the multiplier, cash out before the crash.",
        },
        { name: "author", content: "ZeniPesa" },
        { property: "og:title", content: "ZeniPesa — Classic Crash Casino" },
        {
          property: "og:description",
          content:
            "ZeniPesa is a classic crash casino with instant M-Pesa deposits and withdrawals in Kenya.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "theme-color", content: "#D4AF37" },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap",
        },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
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
      <Toaster position="top-center" theme="dark" richColors />
    </QueryClientProvider>
  );
}
