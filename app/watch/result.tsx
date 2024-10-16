"use client";

import { ResultStatus } from "../result-status";
import { type ResultWithGame } from "@/convex/results";
import { Visualizer } from "../visualizer";

export default function Result({ result }: { result: ResultWithGame }) {
  return (
    <div className="flex flex-col gap-2 items-center">
      {result.game !== null && (
        <div className="flex gap-2">
          <ResultStatus result={result} />
          <p>{result.game.modelId}</p>
        </div>
      )}
      <Visualizer autoReplay autoStart controls={false} map={result.map} />
    </div>
  );
}
