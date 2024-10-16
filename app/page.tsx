"use client";

import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_MODELS } from "@/convex/constants";
import { useRouter } from "next/navigation";

export default function MainPage() {
  const startNewGame = useMutation(api.games.startNewGame);
  const [model, setModel] = useState(AI_MODELS[0].model);
  const router = useRouter();

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
            {AI_MODELS.map((model) => (
              <SelectItem key={model.model} value={model.model}>
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
