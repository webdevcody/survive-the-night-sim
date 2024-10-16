"use client";

import { ResultStatus } from "./result-status";
import { type ResultWithGame } from "@/convex/results";
import { Visualizer } from "./visualizer";
import { format } from "date-fns";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function Result({ result }: { result: ResultWithGame }) {
  return (
    <Card className="flex border rounded-xl p-4 gap-8">
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
        <div className="text-red-500 max-w-[200px]">
          Game failed: {result.error}
        </div>
      )}
      {result.status === "inProgress" && (
        <div className="flex items-center">
          <p className="mr-2">Game is playing...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300"></div>
        </div>
      )}

      {result.game !== null && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 h-full justify-center">
            <Link
              href={`/play/${result.level}`}
              className="whitespace-nowrap hover:underline cursor-pointer text-xl"
            >
              Night #{result.level}
            </Link>{" "}
            <Link
              href={`/games/${result.game._id}`}
              className="whitespace-nowrap hover:underline cursor-pointer"
            >
              Game {result.game._id.substring(0, 8)}...
            </Link>
            <div className="flex gap-2">
              The <span className="font-bold">{result.game.modelId}</span> model
              {result.status === "inProgress" ? (
                "Started"
              ) : (
                <ResultStatus result={result} />
              )}{" "}
              at {format(new Date(result._creationTime), "h:mma")}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
