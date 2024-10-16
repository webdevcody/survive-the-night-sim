"use client";

import { useQuery } from "convex/react";
import Result from "./result";
import { api } from "@/convex/_generated/api";

export default function GamePage() {
  const results = useQuery(api.results.getLastCompletedResults);

  if (results === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto pt-12 pb-24 space-y-8">
      <h1 className="text-2xl font-bold">Recent Games</h1>
      <div className="flex flex-wrap justify-betweengap-x-2 gap-12">
        {results.map((result) => (
          <Result key={result._id} result={result} />
        ))}
      </div>
    </div>
  );
}
