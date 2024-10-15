"use client";

import { Map } from "@/app/map";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import React, { useState } from "react";

function convertStringMapToNumberGrid(map: string[][]): number[][] {
  return map.map((row) =>
    row.map((cell) => {
      switch (cell) {
        case "P":
          return 3; // Player
        case "Z":
          return 1; // Zombie
        case "R":
          return 2; // Rocks
        case "B":
          return 4; // Block
        case " ":
          return 0; // Empty Space
        default:
          return 0; // Default to empty space
      }
    }),
  );
}

function convertNumberGridToStringMap(grid: number[][]): string[][] {
  return grid.map((row) =>
    row.map((cell) => {
      switch (cell) {
        case 3:
          return "P"; // Player
        case 1:
          return "Z"; // Zombie
        case 2:
          return "R"; // Rocks
        case 4:
          return "B"; // Block
        case 0:
          return " "; // Empty Space
        default:
          return " "; // Default to empty space
      }
    }),
  );
}

const MapTester = ({ map }: { map: string[][] }) => {
  const getPlayerMap = useAction(api.openai.playMapAction);
  const [resMap, setResMap] = useState<null | number[][]>();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await getPlayerMap({
        level: 1,
        mapId: "zombiemap",
        map: convertStringMapToNumberGrid(map),
      });

      // type safe resulting object
      console.log(res);
      setResMap(res?.map);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        Test Output
      </button>
      {loading && <p>Loading result map...</p>}
      {resMap && <Map map={convertNumberGridToStringMap(resMap)} />}
    </div>
  );
};

export default MapTester;
