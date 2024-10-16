"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";

export default function MainPage() {
  const models = useQuery(api.models.getActiveModels);
  const startNewGame = useMutation(api.games.startNewGame);
  const [model, setModel] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    if (models !== undefined && models.length !== 0) {
      setModel(models[0].slug);
    }
  }, [models]);

  const handleClick = async () => {
    await startNewGame({
      modelId: model,
    }).then((gameId) => {
      router.push(`/games/${gameId}`);
    });
  };

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center pt-12 gap-8">
      <h1 className="text-4xl font-bold mb-8">Zombie Map Simulator</h1>

      <div className="flex justify-center gap-4">
        <Select value={model} onValueChange={(value) => setModel(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models !== undefined &&
              models.map((model) => (
                <SelectItem key={model._id} value={model.slug}>
                  {model.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button onClick={handleClick}>Test Model</Button>
      </div>
    </div>
  );
}
