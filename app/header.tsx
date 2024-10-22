"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useConvexAuth, useQuery } from "convex/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";

const ThemeToggle = dynamic(
  async () => (await import("@/components/ThemeToggle")).ThemeToggle,
  {
    ssr: false,
  },
);

function SignInWithGitHub() {
  const { signIn } = useAuthActions();
  return (
    <Button
      variant="outline"
      type="button"
      onClick={() => void signIn("github", { redirectTo: "/" })}
    >
      Sign In
    </Button>
  );
}

export default function Header() {
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const flags = useQuery(api.flags.getFlags);
  const isAdminQuery = useQuery(api.users.isAdmin);

  return (
    <header className="flex items-center justify-between border-b px-6 py-4 shadow-sm">
      <Link href="/" className="flex items-center">
        <Image src="/logo.png" alt="Logo" width={32} height={32} priority />
        <span className="ml-2 text-xl font-bold">SurviveTheNight</span>
      </Link>

      <nav className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link href="/">Watch</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/play">Play</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/playground">Playground</Link>
        </Button>
        {isAdminQuery && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                Admin <ChevronDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/prompts">Review Prompts</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/review">Review Maps</Link>
              </DropdownMenuItem>
              {flags?.showTestPage && (
                <DropdownMenuItem asChild>
                  <Link href="/test">Test</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>

      <div className="flex items-center space-x-4">
        <Link
          href="https://www.convex.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm"
        >
          Synced using Convex
          <Image src="/convex.svg" alt="Convex" width={24} height={24} />
        </Link>

        <div className="">
          <ThemeToggle />
        </div>
        <Button
          className="w-9 shrink-0"
          asChild
          variant="outline"
          size="icon"
          type="button"
        >
          <Link
            href="https://github.com/webdevcody/survive-the-night-sim"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GitHubLogoIcon className="h-4 w-4" />
          </Link>
        </Button>
        {!isAuthenticated ? (
          <SignInWithGitHub />
        ) : (
          <Button onClick={() => void signOut()}>Sign Out</Button>
        )}
      </div>
    </header>
  );
}
