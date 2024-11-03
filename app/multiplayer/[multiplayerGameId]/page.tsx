"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { Page, PageTitle } from "@/components/Page";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Renderer } from "@/renderer";
import { ZombieSurvival } from "@/simulator";

export default function Multiplayer({
  params,
}: {
  params: { multiplayerGameId: Id<"multiplayerGame"> };
}) {
  const multiplayerGame = useQuery(api.multiplayerGame.getMultiplayerGame, {
    multiplayerGameId: params.multiplayerGameId,
  });
  const renderer = useRef<Renderer | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (multiplayerGame && canvas.current !== null) {
      const map = multiplayerGame.boardState;
      renderer.current = new Renderer(
        ZombieSurvival.boardHeight(map),
        ZombieSurvival.boardWidth(map),
        canvas.current,
        Number.parseInt("64", 10),
        1000,
      );
      renderer.current.initialize().then(() => {
        setIsInitialized(true);
      });
    }
  }, [multiplayerGame]);

  useEffect(() => {
    if (renderer.current && isInitialized && multiplayerGame) {
      const simulator = new ZombieSurvival(multiplayerGame.boardState);
      renderer.current?.render(simulator.getAllEntities());
    }
  }, [isInitialized, multiplayerGame]);

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
