"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useConvexAuth } from "convex/react";

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
        <Image src="/convex.svg" alt="Logo" width={32} height={32} />
        <span className="ml-2 text-xl font-bold">SurviveTheNight</span>
      </Link>

      {!isAuthenticated ? (
        <SignInWithGitHub />
      ) : (
        <Button onClick={() => void signOut()}>Sign Out</Button>
      )}
    </header>
  );
}
