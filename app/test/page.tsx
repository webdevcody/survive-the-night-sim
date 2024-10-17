"use client";

import React from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "@/components/ModelSelector";
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
    <div className="container mx-auto min-h-screen flex flex-col items-center pt-12 gap-8">
      <h1 className="text-4xl font-bold mb-8">Zombie Map Simulator</h1>

      <div className="flex justify-center gap-4">
        <ModelSelector onChange={setModel} value={model} />
        <Button onClick={handleClick}>Test Model</Button>
      </div>
    </div>
  );
}
