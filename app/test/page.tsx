"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { ModelSelector } from "@/components/ModelSelector";
import { Page, PageTitle } from "@/components/Page";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

export default function TestPage() {
  const testModel = useMutation(api.games.testModel);
  const [model, setModel] = React.useState("");
  const router = useRouter();

  const handleClick = async () => {
    await testModel({
      modelId: model,
    }).then((gameId) => {
      router.push(`/games/${gameId}`);
    });
  };

  return (
    <Page className="flex flex-col items-center gap-8">
      <PageTitle>Zombie Map Simulator</PageTitle>

      <div className="flex justify-center gap-4">
        <ModelSelector onChange={setModel} value={model} />
        <Button onClick={handleClick}>Test Model</Button>
      </div>
    </Page>
  );
}
