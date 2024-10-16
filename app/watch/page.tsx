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
    <div className="container mx-auto min-h-screen flex flex-wrap justify-between pt-12 pb-24 gap-x-2 gap-y-8">
      {results.map((result) => (
        <Result key={result._id} result={result} />
      ))}
    </div>
  );
}
