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

  const playerLabels = multiplayerGame.playerMap.reduce(
    (acc, { playerToken, modelSlug }) => {
      acc[playerToken] = modelSlug;
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <Page>
      <PageTitle>Multiplayer</PageTitle>
      <div className="mb-4 flex justify-center">
        <span>Cost: ${multiplayerGame.cost?.toFixed(2)}</span>
      </div>
      <div className="flex justify-center">
        <Visualizer
          controls={false}
          map={multiplayerGame.boardState}
          playerLabels={playerLabels}
          simulatorOptions={{ multiplayer: true }}
        />
      </div>
    </Page>
  );
}
