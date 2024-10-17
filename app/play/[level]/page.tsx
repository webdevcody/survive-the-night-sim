"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayMode from "@/components/PlayMode";
import TestMode from "@/components/TestMode";


export default function PlayLevelPage({
  params,
}: {
  params: { level: string };
}) {
  const level = parseInt(params.level, 10);
  const map = useQuery(api.maps.getMapByLevel, { level });
  const flags = useQuery(api.flags.getFlags);
  const [mode, setMode] = useState<"play" | "test">("play");

  if (!map) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center py-12 pb-24 gap-8">
      <div className="w-full flex justify-between items-center">
        <Button variant="outline" asChild className="flex gap-2 items-center">
          <Link href="/play" passHref>
            <ChevronLeftIcon /> Play Different Night
          </Link>
        </Button>
        {flags?.showTestPage && (
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "play" | "test")}
          >
            <TabsList>
              <TabsTrigger value="play">Play</TabsTrigger>
              <TabsTrigger value="test">Test AI</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      <h1 className="text-3xl font-bold text-center">Night #{level}</h1>

      {mode === "play" ? (
        <PlayMode map={map} />
      ) : (
        <TestMode map={map} level={level} />
      )}
    </div>
  );
}
