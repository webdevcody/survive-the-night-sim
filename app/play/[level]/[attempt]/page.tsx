"use client";

import React from "react";
import { Authenticated, useQuery } from "convex/react";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Visualizer } from "@/components/Visualizer";
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
      <div className="container mx-auto min-h-screen flex flex-col items-center py-12 pb-24 gap-8">
        <div className="w-full flex justify-between items-center">
          <Button variant="outline" asChild className="flex gap-2 items-center">
            <Link href={`/play/${level}`}>
              <ChevronLeftIcon /> Back To Night #{level}
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-center">Night #{level}</h1>
        <h2 className="text-xl font-semibold mb-4">Attempt #{attemptNum}</h2>

        <div className="flex flex-col gap-y-2 items-center">
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
