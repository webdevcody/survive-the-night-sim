"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  ChevronDownIcon,
  GitHubLogoIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
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

const links = [
  { href: "/", label: "Watch" },
  { href: "/play", label: "Play" },
  { href: "/playground", label: "Playground" },
];

export default function Header() {
  const { signOut } = useAuthActions();
  const flags = useQuery(api.flags.getFlags);
  const isAdminQuery = useQuery(api.users.isAdmin);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="flex items-center justify-between border-b px-6 py-4 shadow-sm">
      <Link href="/" className="flex items-center" passHref>
        <Image src="/logo.png" alt="Logo" width={32} height={32} priority />
        <span className="text-md ml-2 text-xs font-bold md:text-xl lg:text-xl">
          SurviveTheNight
        </span>
      </Link>

      <nav className="hidden items-center gap-2 md:flex xl:gap-4">
        {links.map((link) => (
          <Button key={link.href} variant="ghost" asChild>
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}

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
          className="hidden items-center gap-2 text-sm md:flex"
          passHref
        >
          <span className="hidden lg:block">Synced using Convex</span>
          <Image src="/convex.svg" alt="Convex" width={24} height={24} />
        </Link>
        <Button
          className="flex items-center justify-center"
          asChild
          variant="outline"
          size="icon"
          type="button"
        >
          <Link
            href="https://github.com/webdevcody/survive-the-night-sim"
            rel="noopener noreferrer"
            target="_blank"
            passHref
            aria-label="Link to GitHub repo of the project"
          >
            <GitHubLogoIcon className="h-4 w-4" />
          </Link>
        </Button>
        <Unauthenticated>
          <Link href="/auth">
            <Button variant="outline" type="button">
              Sign In
            </Button>
          </Link>
        </Unauthenticated>
        <Authenticated>
          <Button className="hidden md:block" onClick={() => void signOut()}>
            Sign Out
          </Button>
        </Authenticated>
        <Button
          className="md:hidden"
          variant="ghost"
          onClick={toggleMobileMenu}
        >
          <HamburgerMenuIcon className="h-4 w-4" />
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute left-0 top-16 w-full border-b bg-white shadow-md dark:bg-slate-950 md:hidden">
          <nav className="flex flex-col items-start space-y-2 p-4">
            {links.map((link) => (
              <Button key={link.href} variant="ghost" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}

            {isAdminQuery && (
              <>
                <div className="my-2 w-full border-t border-gray-200 dark:border-gray-700"></div>
                <Button variant="ghost" asChild>
                  <Link href="/prompts">Review Prompts</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/admin/review">Review Maps</Link>
                </Button>
                {flags?.showTestPage && (
                  <Button variant="ghost" asChild>
                    <Link href="/test">Test</Link>
                  </Button>
                )}
              </>
            )}
            <Authenticated>
              <div className="my-2 w-full border-t border-gray-200 dark:border-gray-700"></div>
              <Button variant="ghost" onClick={() => void signOut()}>
                Sign Out
              </Button>
            </Authenticated>
          </nav>
        </div>
      )}
    </header>
  );
}
