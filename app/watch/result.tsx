"use client";

import { ResultStatus } from "../result-status";
import { type ResultWithGame } from "@/convex/results";
import { Visualizer } from "../visualizer";
import { format } from "date-fns";

export default function Result({ result }: { result: ResultWithGame }) {
  return (
    <div className="flex gap-8 border rounded-xl p-4 bg-black">
      {result.game !== null && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <ResultStatus result={result} />
            <p>at {format(new Date(result._creationTime), "h:mma")}</p>
          </div>
          <p>Level {result.level}</p>
          <p>{result.game.modelId}</p>
        </div>
      )}
      <Visualizer autoReplay autoStart controls={false} map={result.map} />
    </div>
  );
}
