"use client";

import { useQuery } from "convex/react";
import { Page, PageTitle } from "@/components/Page";
import { ReplayVisualizer } from "@/components/ReplayVisualizer";
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
      {multiplayerGame.cost && (
        <div className="mb-4 flex justify-center">
          <span>Cost: ${multiplayerGame.cost?.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-center">
        <ReplayVisualizer
          actions={multiplayerGame.actions}
          map={multiplayerGame.map}
          playerLabels={playerLabels}
          simulatorOptions={{ multiplayer: true }}
        />
      </div>
    </Page>
  );
}
