"use client";

import React from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Page, PageTitle } from "@/components/Page";
import { Button } from "@/components/ui/button";

const AuthPage = () => {
  const { signIn } = useAuthActions();

  return (
    <Page>
      <PageTitle>Select How To Sign In</PageTitle>

      <div className="flex w-full justify-center gap-8">
        <Button
          className="flex gap-1"
          onClick={() => void signIn("google", { redirectTo: "/" })}
        >
          <SiGoogle className="h-4 w-4" /> Google
        </Button>
        <Button
          className="flex gap-1"
          onClick={() => void signIn("github", { redirectTo: "/" })}
        >
          <GitHubLogoIcon className="h-4 w-4" /> GitHub
        </Button>
      </div>
    </Page>
  );
};

export default AuthPage;
