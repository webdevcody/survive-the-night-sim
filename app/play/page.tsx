"use client";

import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Map as GameMap } from "@/components/Map";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function PlayPage() {
  const maps = useQuery(api.maps.getMaps, {});
  const userMapResults = useQuery(api.playerresults.getUserMapStatus);
  const mapCountResults = useQuery(api.playerresults.getMapsWins);

  const [resMap, setResMap] = useState(new Map());
  const [countMap, setCountMap] = useState(new Map());
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (userMapResults && mapCountResults) {
      const res = new Map<string, boolean>();
      const ctr = new Map<string, number>();

      for (const result of userMapResults as {
        mapId: string;
        hasWon: boolean;
      }[]) {
        res.set(result.mapId, result.hasWon);
      }

      for (const result of mapCountResults as {
        mapId: string;
        count: number;
      }[]) {
        ctr.set(result.mapId, result.count);
      }

      setResMap(res);
      setCountMap(ctr);
    }
  }, [userMapResults, mapCountResults]);

  const filteredMaps = maps?.filter((map) => {
    if (filter === "all") return true;
    if (filter === "beaten") return resMap.get(map._id);
    if (filter === "unbeaten") return !resMap.get(map._id);
    return true;
  });

  if (!filteredMaps) {
    return (
      <div className="container mx-auto min-h-screen py-12 pb-24 gap-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Choose a Night</h1>

        <Authenticated>
          <ToggleGroup
            defaultValue="all"
            type="single"
            variant="outline"
            className="w-max pb-4"
            onValueChange={(value) => setFilter(value)}
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="beaten">Beaten</ToggleGroupItem>
            <ToggleGroupItem value="unbeaten">Unbeaten</ToggleGroupItem>
          </ToggleGroup>
        </Authenticated>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen py-12 pb-24 gap-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose a Night</h1>

      <Authenticated>
        <ToggleGroup
          defaultValue="all"
          type="single"
          variant="outline"
          className="w-max pb-4"
          onValueChange={(value) => setFilter(value)}
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="beaten">Beaten</ToggleGroupItem>
          <ToggleGroupItem value="unbeaten">Unbeaten</ToggleGroupItem>
        </ToggleGroup>
      </Authenticated>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMaps.map((map) => (
          <Card key={map._id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-center">
                Night #{map.level}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <GameMap map={map.grid} size={52} />
            </CardContent>
            <CardFooter className="flex justify-around px-3">
              <Link href={`/play/${map.level}`} passHref>
                <Button>Play</Button>
              </Link>

              <Authenticated>
                <div className="flex flex-col items-center gap-y-2">
                  {resMap.has(map._id) ? (
                    <div className="ml-4">
                      {resMap.get(map._id) ? "Beaten" : "Unbeaten"}
                    </div>
                  ) : (
                    <div className="ml-4">Unplayed</div>
                  )}
                  <div>
                    Won by {countMap.has(map._id) ? countMap.get(map._id) : 0}{" "}
                    Player{countMap.get(map._id) !== 1 ? "s" : ""}
                  </div>
                </div>
              </Authenticated>

              <Unauthenticated>
                <div>
                  Won by {countMap.has(map._id) ? countMap.get(map._id) : 0}{" "}
                  Player{countMap.get(map._id) !== 1 ? "s" : ""}
                </div>
              </Unauthenticated>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
