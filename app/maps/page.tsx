"use client";

import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AddMapPage() {
  const [height, setHeight] = useState(1);
  const [width, setWidth] = useState(1);
  const [map, setMap] = useState<string[][]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isZombie, setIsZombie] = useState(false);
  const createMap = useMutation(api.maps.addMap);
  useEffect(() => {
    generateMap();
  }, [height, width]);

  const generateMap = () => {
    const newMap = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => " "),
    );
    newMap.forEach((row, y) => {
      row.forEach((cell, x) => {
        newMap[y][x] = " ";
      });
    });
    setMap(newMap);
  };
  const checkValidMap = () => {
    var flag = false;
    map.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (map[y][x] === " ") {
          flag = true;
        }
      });
    });
    if (!flag) {
      alert("No place left to place the player!");
    } else {
      createMap({ grid: map });
      alert("Map saved");
    }
  };
  const setCell = (y: number, x: number, z: boolean) => {
    var cell = " ";
    if (z === true) {
      if (map[y][x] === "Z") {
        cell = " ";
      } else {
        cell = "Z";
      }
    } else {
      if (map[y][x] === "B") {
        cell = " ";
      } else {
        cell = "R";
      }
    }
    const newMap = map.map((row) => [...row]);
    newMap[y][x] = cell;
    setMap(newMap);
  };
  return (
    <div className="container mx-auto min-h-screen py-12 pb-24 gap-8">
      <h1 className="text-center text-3xl font-semibold mb-6">Submit Map</h1>

      {isSubmitted ? (
        <div>
          <div className="flex justify-center m-5">
            <Button
              className="mx-2"
              variant={isZombie ? "default" : "outline"}
              onClick={() => setIsZombie(true)}
            >
              Place Zombie
            </Button>
            <Button
              className="mx-2"
              variant={isZombie ? "outline" : "default"}
              onClick={() => setIsZombie(false)}
            >
              Place Rock
            </Button>
          </div>
          <div className="justify-center m-5">
            {map.map((row, y) => (
              <div key={y} className="flex justify-center">
                {row.map((cell, x) => (
                  <div
                    key={x}
                    className={`size-8 border flex items-center justify-center text-2xl p-5`}
                  >
                    <Button
                      className="m-5"
                      variant="outline"
                      onClick={() => {
                        setCell(y, x, isZombie);
                      }}
                    >
                      {map[y][x]}
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h1>Enter the height of the map: </h1>
          <Input
            type="number"
            value={height}
            onChange={(e) => {
              setHeight(+e.target.value);
            }}
          />
          <h1>Enter the width of the map: </h1>
          <Input
            type="number"
            value={width}
            onChange={(e) => {
              setWidth(+e.target.value);
            }}
          />
          <div className="justify-center m-5">
            {map.map((row, y) => (
              <div key={y} className="flex justify-center">
                {row.map((cell, x) => (
                  <div
                    key={x}
                    className={`size-8 border flex items-center justify-center text-2xl`}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-center m-5">
        {isSubmitted ? (
          <div>
            <Button className="mx-2" type="submit" onClick={checkValidMap}>
              Save map
            </Button>
            <Button
              className="mx-2"
              variant="destructive"
              onClick={() => {
                setIsSubmitted(false);
                map.fill([]);
                generateMap();
              }}
            >
              Reset
            </Button>
          </div>
        ) : (
          <Button type="submit" onClick={() => setIsSubmitted(true)}>
            Confirm grid
          </Button>
        )}
      </div>
    </div>
  );
}
