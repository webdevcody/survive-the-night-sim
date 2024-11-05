"use client";

import { useQuery } from "convex/react";
import { Page, PageTitle } from "@/components/Page";
import { Visualizer } from "@/components/Visualizer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function MultiplayerPage({
  params,
}: {
  params: { multiplayerGameId: Id<"multiplayerGames"> };
}) {
  const multiplayerGame = useQuery(api.multiplayerGames.getMultiplayerGame, {
    multiplayerGameId: params.multiplayerGameId,
  });

  if (multiplayerGame === undefined) {
    return <div>Loading...</div>;
  }

  if (multiplayerGame === null) {
    return <div>Game not found.</div>;
  }

  return (
    <Page>
      <PageTitle>Multiplayer</PageTitle>
      <div className="flex justify-center">
        <Visualizer
          controls={false}
          map={multiplayerGame.boardState}
          simulatorOptions={{ multiplayer: true }}
        />
      </div>
    </Page>
  );
}
