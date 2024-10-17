"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ResultStatus } from "@/app/result-status";
import { Visualizer } from "../../visualizer";
import Link from "next/link";

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
        className="whitespace-nowrap hover:underline cursor-pointer"
      >
        Level {map.level}
      </Link>

      {result.status === "failed" ? (
        <div className="text-red-500 w-[200px] flex-shrink-0">
          {result.error}
        </div>
      ) : (
        <Visualizer map={result.map} autoStart={true} />
      )}

      <div className="flex flex-col">
        <ResultStatus result={result} />
        {result.reasoning !== "" && <p>{result.reasoning}</p>}
      </div>
    </div>
  );
};
