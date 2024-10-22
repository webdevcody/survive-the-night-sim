"use client";

import { useEffect, useState } from "react";
import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import { TrashIcon } from "lucide-react";
import Link from "next/link";
import { Map as GameMap } from "@/components/Map";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export default function PlayPage() {
  const isAdmin = useQuery(api.users.isAdmin);
  const maps = useQuery(api.maps.getMaps, {});
  const userMapResults = useQuery(api.playerresults.getUserMapStatus);
  const mapCountResults = useQuery(api.playerresults.getMapsWins);
  const adminDeleteMapMutation = useMutation(api.maps.deleteMap);
  const { isAuthenticated } = useConvexAuth();

  const [resMap, setResMap] = useState(new Map());
  const [countMap, setCountMap] = useState(new Map());
  const [filter, setFilter] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mapFilter") || "all";
    }
    return "all";
  });

  useEffect(() => {
    localStorage.setItem("mapFilter", filter);
  }, [filter]);

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
    if (!isAuthenticated) return true;
    if (filter === "all") return true;
    if (filter === "beaten") return resMap.get(map._id);
    if (filter === "unbeaten") return !resMap.get(map._id);
    return true;
  });

  if (filteredMaps === undefined) {
    return (
      <div className="container mx-auto min-h-screen gap-8 py-12 pb-24">
        <h1 className="mb-6 text-center text-3xl font-bold">Choose a Night</h1>

        <Authenticated>
          <ToggleGroup
            defaultValue="all"
            type="single"
            variant="outline"
            className="w-max pb-4"
            value={filter}
            onValueChange={(value) => setFilter(value)}
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="beaten">Beaten</ToggleGroupItem>
            <ToggleGroupItem value="unbeaten">Unbeaten</ToggleGroupItem>
          </ToggleGroup>
        </Authenticated>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen gap-8 py-12 pb-24">
      <h1 className="mb-6 text-center text-3xl font-bold">Choose a Night</h1>

      <Authenticated>
        <ToggleGroup
          defaultValue="all"
          type="single"
          variant="outline"
          className="w-max pb-4"
          value={filter}
          onValueChange={(value) => setFilter(value)}
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="beaten">Beaten</ToggleGroupItem>
          <ToggleGroupItem value="unbeaten">Unbeaten</ToggleGroupItem>
        </ToggleGroup>
      </Authenticated>

      {filteredMaps.length === 0 && (
        <div className="py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-xl/snug text-white">Congratulations!</h2>
              <p className="text-base/snug text-white">
                You completed all maps, consider creating and publishing your
                own map.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/playground">Create Map</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredMaps.map((map) => (
          <Card
            key={map._id}
            className={cn(
              "relative flex h-full flex-col",
              resMap.get(map._id)
                ? "border-green-500"
                : resMap.has(map._id)
                  ? "border-red-500"
                  : "",
            )}
          >
            <CardHeader>
              <div
                className={`flex ${isAdmin ? "justify-between" : "justify-center"}`}
              >
                <CardTitle className="text-center text-xl font-semibold">
                  Night #{map.level}
                </CardTitle>
                {isAdmin && (
                  <Button
                    onClick={async () => {
                      await adminDeleteMapMutation({ mapId: map._id });
                    }}
                    size="icon"
                    variant="destructive"
                  >
                    <TrashIcon size={16} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-grow items-center justify-center">
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
