"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { SiGoogle } from "@icons-pack/react-simple-icons";

const AuthPage = () => {
  const { signIn } = useAuthActions();

  return (
    <div className="container mx-auto min-h-screen py-12 pb-24 gap-8">
      <h1 className="text-center text-3xl font-semibold mb-6">
        Select How To Sign In
      </h1>

      <div className="w-full gap-8 flex justify-center">
        <Button
          className="gap-1 flex"
          onClick={() => void signIn("google", { redirectTo: "/" })}
        >
          <SiGoogle className="w-4 h-4" /> Google
        </Button>
        <Button
          className="gap-1 flex"
          onClick={() => void signIn("github", { redirectTo: "/" })}
        >
          <GitHubLogoIcon className="w-4 h-4" /> GitHub
        </Button>
      </div>
    </div>
  );
};

export default AuthPage;
