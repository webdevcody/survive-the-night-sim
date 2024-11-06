import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { type Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Footer from "./footer";
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

function BreakpointIndicator() {
  return (
    <div className="fixed bottom-0 right-0 z-50 m-2 rounded bg-black p-1 text-xs font-bold text-white opacity-75">
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="hidden 2xl:block">2xl</div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      {process.env.NEXT_PUBLIC_ENABLE_UNAMI === "true" && (
        <Script
          defer
          src="/umami.js"
          data-website-id="9591881c-31c9-4fea-9c33-cf8272fa2b4e"
        />
      )}
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            <Header />
            <main className="mb-12 flex-grow">{children}</main>
            <Footer />
            <BreakpointIndicator />
          </Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
