"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useConvexAuth } from "convex/react";
import { ThemeToggle } from "@/components/ThemeToggle";

function SignInWithGitHub() {
  const { signIn } = useAuthActions();
  return (
    <Button
      variant="outline"
      type="button"
      onClick={() => void signIn("github", { redirectTo: "/" })}
    >
      <GitHubLogoIcon className="mr-2 h-4 w-4" /> GitHub
    </Button>
  );
}

export default function Header() {
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  return (
    <header className="flex justify-between items-center py-4 px-6 shadow-sm border-b">
      <Link href="/" className="flex items-center">
        <Image src="/logo.png" alt="Logo" width={32} height={32} />
        <span className="ml-2 text-xl font-bold">SurviveTheNight</span>
      </Link>

      <nav className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="ghost">Watch</Button>
        </Link>
        <Link href="/play">
          <Button variant="ghost">Play</Button>
        </Link>
        <Link href="/leaderboard">
          <Button variant="ghost">Leaderboard</Button>
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        <span className="mr-2 text-sm">Synced using Convex</span>
        <Link
          href="https://www.convex.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/convex.svg" alt="Convex" width={24} height={24} />
        </Link>

        <div className="flex hover:bg-slate-500 rounded-md px-1">
          <ThemeToggle />
        </div>
        {!isAuthenticated ? (
          <SignInWithGitHub />
        ) : (
          <Button onClick={() => void signOut()}>Sign Out</Button>
        )}
      </div>
    </header>
  );
}
