"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider } from "next-themes";
import PlausibleProvider from "next-plausible";
import { Toaster } from "@/components/ui/toaster";
import VisualizerProvider from "@/components/VisualizerProvider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlausibleProvider
      selfHosted
      customDomain="https://plausible-analytics-ce-production-e655.up.railway.app"
      domain="survive-the-night-sim-production.up.railway.app"
    >
      <ThemeProvider attribute="class">
        <ConvexAuthNextjsProvider client={convex}>
          <VisualizerProvider>
            {children}
            <Toaster />
          </VisualizerProvider>
        </ConvexAuthNextjsProvider>
      </ThemeProvider>
    </PlausibleProvider>
  );
}
