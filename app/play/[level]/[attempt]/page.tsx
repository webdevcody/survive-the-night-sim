"use client";

import React from "react";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Authenticated, useQuery } from "convex/react";
import Link from "next/link";
import { Visualizer } from "@/components/Visualizer";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

export default function PlayLevelAttemptPage({
  params,
}: {
  params: { level: string; attempt: string };
}) {
  const level = Number.parseInt(params.level, 10);
  const attemptNum = Number.parseInt(params.attempt, 10);

  const attempt = useQuery(api.playerresults.getUserAttempt, {
    level,
    attempt: attemptNum,
  });

  if (attempt === undefined) {
    return <p>Loading...</p>;
  } else if (attempt === null) {
    return <p className="text-red-500">Attempt Not Found</p>;
  }

  return (
    <Authenticated>
      <div className="container mx-auto flex min-h-screen flex-col items-center gap-8 py-12 pb-24">
        <div className="flex w-full items-center justify-between">
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href={`/play/${level}`}>
              <ChevronLeftIcon /> Back To Night #{level}
            </Link>
          </Button>
        </div>
        <h1 className="text-center text-3xl font-bold">Night #{level}</h1>
        <h2 className="mb-4 text-xl font-semibold">Attempt #{attemptNum}</h2>

        <div className="flex flex-col items-center gap-y-2">
          <Visualizer
            autoReplay
            autoStart
            controls={false}
            map={attempt.grid}
          />
          <div
            className={`mt-4 text-xl font-semibold ${
              attempt.didWin ? "text-green-500" : "text-red-500"
            }`}
          >
            {attempt.didWin ? "You Survived!" : "You Died!"}
          </div>
        </div>
      </div>
    </Authenticated>
  );
}
