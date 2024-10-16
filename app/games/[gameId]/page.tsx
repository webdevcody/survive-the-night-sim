"use client";

import { Map } from "@/app/map";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Result } from "./result";

export default function GamePage({ params }: { params: { gameId: string } }) {
  const game = useQuery(api.games.getGame, {
    gameId: params.gameId as Id<"games">,
  });
  const results = useQuery(api.results.getResults, {
    gameId: params.gameId as Id<"games">,
  });

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center pt-12 gap-8">
      <h1>Game {params.gameId}</h1>
      <h2>Model: {game?.modelId}</h2>

      <div className="flex flex-col gap-12">
        {results === undefined || results.length === 0 ? (
          <div className="flex flex-col justify-center items-center gap-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
            <p className="ml-4">Game starting...</p>
          </div>
        ) : (
          results.map((result) => <Result result={result} key={result._id} />)
        )}
      </div>
    </div>
  );
}
