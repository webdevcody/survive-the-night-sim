"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Visualizer } from "./visualizer";

export const Result = ({ result }: { result: Doc<"results"> }) => {
  const map = useQuery(api.maps.getMapByLevel, {
    level: result.level,
  });

  if (!map) {
    return <div>Map was not found</div>;
  }

  if (result.status === "inProgress") {
    return <div>Game in progress...</div>;
  }

  if (result.status === "failed") {
    return <div className="text-red-500">{result.error}</div>;
  }

  return (
    <div className="flex items-center gap-8">
      <div className="whitespace-nowrap">Level {map.level}</div>
      <Visualizer map={result.map} />
      <div className="flex flex-col">
        <div
          className={`font-bold ${result.isWin ? "text-green-500" : "text-red-500"}`}
        >
          {result.isWin ? "Won" : "Lost"}
        </div>
        {result.reasoning !== "" && <p>{result.reasoning}</p>}
      </div>
    </div>
  );
};
