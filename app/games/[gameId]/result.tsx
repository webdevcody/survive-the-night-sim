"use client";

import { Visualizer } from "./visualizer";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export const Result = ({ result }: { result: Doc<"results"> }) => {
  const map = useQuery(api.maps.getMapByLevel, {
    level: result.level,
  });

  if (!map) return null;

  if (result.status === "inProgress") {
    return <div>Game in progress...</div>;
  }

  return (
    <div className="flex items-center gap-8" key={map._id}>
      <div>Level {map.level}</div>
      <Visualizer map={result.map} />
      <div
        className={`font-bold ${result.isWin ? "text-green-500" : "text-red-500"}`}
      >
        {result.isWin ? "Won" : "Lost"}
      </div>
    </div>
  );
};
