"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Map } from "@/app/map";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PlayPage() {
  const maps = useQuery(api.maps.getMaps);

  if (!maps) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose a Level</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {maps.map((map) => (
          <div
            key={map._id}
            className="border rounded-lg p-4 flex flex-col items-center justify-between h-full"
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Level {map.level}</h2>
              <Map map={map.grid} />
            </div>
            <Link href={`/play/${map.level}`} passHref className="mt-auto pt-4">
              <Button>Play</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
