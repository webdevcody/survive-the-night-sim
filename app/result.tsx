"use client";

import { format } from "date-fns";
import Link from "next/link";
import { MapStatus } from "@/components/MapStatus";
import { Visualizer } from "@/components/Visualizer";
import { Card } from "@/components/ui/card";
import { type ResultWithGame } from "@/convex/results";

export default function Result({ result }: { result: ResultWithGame }) {
  return (
    <Card className="flex flex-col gap-8 rounded-xl border p-4 sm:flex-row">
      {result.status === "completed" && (
        <Visualizer
          cellSize="32"
          autoReplay
          autoStart
          controls={false}
          map={result.map}
        />
      )}

      {result.status === "failed" && (
        <div className="max-w-[200px] text-red-500">
          Game failed: {result.error}
        </div>
      )}
      {result.status === "inProgress" && (
        <div className="flex items-center">
          <p className="mr-2">Game is playing...</p>
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-300"></div>
        </div>
      )}

      {result.game !== null && (
        <div className="mt-4 flex flex-col gap-2 md:mt-0">
          <div className="flex h-full flex-col justify-center gap-2">
            <Link
              href={`/play/${result.level}`}
              className="cursor-pointer whitespace-nowrap text-xl underline"
            >
              Night #{result.level}
            </Link>{" "}
            <Link
              href={`/games/${result.game._id}`}
              className="cursor-pointer whitespace-nowrap underline"
            >
              Game {result.game._id.substring(0, 8)}...
            </Link>
            <div className="text-wrap">
              The <span className="font-bold">{result.game.modelId}</span> model{" "}
              {result.status === "inProgress" ? (
                "Started"
              ) : (
                <MapStatus map={result.map} />
              )}{" "}
              at {format(new Date(result._creationTime), "h:mma")}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
