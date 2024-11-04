"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { Page, PageTitle } from "@/components/Page";
import { useRenderer } from "@/components/Renderer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ZombieSurvival } from "@/simulator";

export default function MultiplayerPage({
  params,
}: {
  params: { multiplayerGameId: Id<"multiplayerGames"> };
}) {
  const multiplayerGame = useQuery(api.multiplayerGames.getMultiplayerGame, {
    multiplayerGameId: params.multiplayerGameId,
  });

  const canvas = useRef<HTMLCanvasElement | null>(null);
  const renderer = useRenderer(multiplayerGame?.boardState, canvas);

  useEffect(() => {
    if (renderer !== null && multiplayerGame) {
      const simulator = new ZombieSurvival(multiplayerGame.boardState);
      renderer.render(simulator.getAllEntities());
    }
  }, [multiplayerGame, renderer]);

  if (!multiplayerGame) {
    return <div>Loading...</div>;
  }

  return (
    <Page>
      <PageTitle>Multiplayer</PageTitle>
      <div className="flex justify-center">
        <canvas ref={canvas} />
      </div>
    </Page>
  );
}
