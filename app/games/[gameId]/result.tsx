"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { MapStatus } from "@/components/MapStatus";
import { Visualizer } from "@/components/Visualizer";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

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

  return (
    <div className="flex items-center gap-8">
      <Link
        href={`/play/${map.level}`}
        className="cursor-pointer whitespace-nowrap hover:underline"
      >
        Level {map.level}
      </Link>

      {result.status === "failed" ? (
        <div className="w-[200px] flex-shrink-0 text-red-500">
          {result.error}
        </div>
      ) : (
        <Visualizer map={result.map} autoStart />
      )}

      <div className="flex flex-col">
        <MapStatus map={result.map} />
        {result.reasoning !== "" && <p>{result.reasoning}</p>}
      </div>
    </div>
  );
};
