"use client";

import { CELL_SIZE, Map } from "./map";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_MODELS } from "@/app/constants";
import { Loader2 } from "lucide-react";

const hardCodedMapTemp = [
  [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", "R", " ", " "],
  ["R", "R", "R", "R", " ", " ", " ", "R", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", "R", "Z", " "],
  [" ", " ", " ", " ", " ", " ", " ", "R", " ", " "],
  [" ", "Z", " ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
];

export default function MainPage() {
  const getPlayerMap = useAction(api.openai.playMapAction);
  const [resMap, setResMap] = useState<null | string[][]>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(AI_MODELS[0].model);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await getPlayerMap({
        level: 1,
        mapId: "zombiemap",
        map: hardCodedMapTemp,
      });

      console.log(res);
      setResMap(res?.map || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const mapWidth = hardCodedMapTemp[0].length * CELL_SIZE;
  const mapHeight = hardCodedMapTemp.length * CELL_SIZE;
  console.log(mapWidth, mapHeight);

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center pt-12 gap-8">
      <h1 className="text-4xl font-bold mb-8">Zombie Map Simulator</h1>

      <div className="flex gap-8 items-start w-full">
        <div className="flex flex-col items-center flex-grow">
          <h2 className="text-2xl font-semibold mb-4">Initial Map</h2>
          <Map map={hardCodedMapTemp} />
        </div>

        <div className="flex flex-col items-center justify-between h-full pt-12">
          <div className="flex flex-col items-center gap-4">
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
            <Button onClick={handleClick} disabled={loading}>
              Run Simulation
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-grow">
          <h2 className="text-2xl font-semibold mb-4">AI Result</h2>
          {loading ? (
            <div
              style={{
                width: `${mapWidth}px`,
                height: `${mapHeight}px`,
              }}
              className={`flex items-center justify-center`}
            >
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : resMap ? (
            <Map map={resMap} />
          ) : (
            <div
              style={{
                width: `${mapWidth}px`,
                height: `${mapHeight}px`,
              }}
              className={`border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400`}
            >
              Run simulation to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
