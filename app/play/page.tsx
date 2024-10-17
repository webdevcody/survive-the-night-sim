"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Map } from "@/app/map";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PlayPage() {
  const maps = useQuery(api.maps.getMaps);

  if (!maps) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto min-h-screen py-12 pb-24 gap-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose a Night</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {maps.map((map) => (
          <Card key={map._id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-center">
                Night #{map.level}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <Map map={map.grid} />
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href={`/play/${map.level}`} passHref>
                <Button>Play</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
