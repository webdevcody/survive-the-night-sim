"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import PlausibleProvider from "next-plausible";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlausibleProvider
      selfHosted
      customDomain="https://plausible-analytics-ce-production-e655.up.railway.app"
      domain="survivethenightgame.com"
    >
      <ThemeProvider attribute="class">
        <ConvexAuthNextjsProvider client={convex}>
          {children}
          <Toaster />
        </ConvexAuthNextjsProvider>
      </ThemeProvider>
    </PlausibleProvider>
  );
}
