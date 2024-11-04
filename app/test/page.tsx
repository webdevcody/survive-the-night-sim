"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { ModelSelector } from "@/components/ModelSelector";
import { Page, PageTitle } from "@/components/Page";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

export default function TestPage() {
  const testModel = useMutation(api.games.testModel);
  const [model, setModel] = useState("");
  const router = useRouter();
  const activeModels = useQuery(api.models.getActiveModels);

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

      <div className="flex flex-col gap-4">
        <Button
          variant="secondary"
          onClick={async () => {
            if (!activeModels) return;

            await Promise.all(
              activeModels.map((model) => {
                return testModel({ modelId: model.slug });
              }),
            );

            router.push("/");
          }}
        >
          Test All Models
        </Button>
      </div>
    </Page>
  );
}
