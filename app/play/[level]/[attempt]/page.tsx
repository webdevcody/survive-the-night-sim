"use client";

import * as React from "react";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Page, PageTitle } from "@/components/Page";
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

  const attempt = useQuery(api.attempts.getUserAttempt, {
    level,
    attempt: attemptNum,
  });

  if (attempt === undefined) {
    return (
      <Page className="flex flex-col items-center gap-8">
        <div className="flex w-full items-center justify-between">
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href={`/play/${level}`} passHref>
              <ChevronLeftIcon /> Back To Night #{level}
            </Link>
          </Button>
        </div>
        <PageTitle>Night #{level}</PageTitle>
        <h2 className="mb-4 text-xl font-semibold">Attempt #{attemptNum}</h2>
        Loading...
      </Page>
    );
  } else if (attempt === null) {
    return (
      <div className="flex min-h-screen justify-center pt-5 text-2xl text-red-500">
        Attempt Not Found
      </div>
    );
  }

  return (
    <Page className="flex flex-col items-center gap-8">
      <div className="flex w-full items-center justify-between">
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link href={`/play/${level}`} passHref>
            <ChevronLeftIcon /> Back To Night #{level}
          </Link>
        </Button>
      </div>
      <PageTitle>Night #{level}</PageTitle>
      <h2 className="mb-4 text-xl font-semibold">Attempt #{attemptNum}</h2>

      <div className="flex flex-col items-center gap-y-2">
        <Visualizer autoReplay autoStart controls={false} map={attempt.grid} />
        <div
          className={`mt-4 text-xl font-semibold ${
            attempt.didWin ? "text-green-500" : "text-red-500"
          }`}
        >
          {attempt.didWin ? "You Survived!" : "You Died!"}
        </div>
      </div>
    </Page>
  );
}
