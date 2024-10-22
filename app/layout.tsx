import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { type Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./header";
import { Providers } from "./provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Survive The Night - Zombie Survival Simulation Game",
  description:
    "Watch to see if AI models can survive the night.  Also challenge yourself to many levels of our puzzle game",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <script defer src="https://umami-production-101d.up.railway.app/script.js"
        data-website-id="6e6265bb-25ed-4f8b-819b-44a27434ed51"
      ></script>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            <Header />
            {children}
          </Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
