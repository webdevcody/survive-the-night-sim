"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { TableHeader } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Result from "./result";

export default function GamePage() {
  const results = useQuery(api.results.getLastCompletedResults);
  const globalRanking = useQuery(api.leaderboard.getGlobalRankings);

  if (results === undefined) {
    return (
      <div className="min-h-screen container mx-auto pt-12 pb-24 space-y-8">
        <h1 className="text-2xl font-bold">Recent Games</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen container mx-auto pt-12 pb-24 space-y-8">
        <h1 className="text-2xl font-bold">Recent Games</h1>
        <p>No results yet</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto pt-12 pb-24 flex gap-12">
      <div className="space-y-8 flex-grow">
        <h1 className="text-2xl font-bold">Recent Games</h1>
        <div className="h-[80vh] overflow-y-auto flex flex-col gap-4">
          {results.map((result) => (
            <Result key={result._id} result={result} />
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">LLM Leaderboard</h2>
          <Button asChild>
            <Link href="/leaderboard">View Full Leaderboard</Link>
          </Button>
        </div>
        <Table className="w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Model ID</TableHead>
              <TableHead className="text-right">Wins</TableHead>
              <TableHead className="text-right">Losses</TableHead>
              <TableHead className="text-right">Total Games</TableHead>
              <TableHead className="text-right">Win Ratio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {globalRanking?.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.modelId}</TableCell>
                <TableCell className="text-right">{item.wins}</TableCell>
                <TableCell className="text-right">{item.losses}</TableCell>
                <TableCell className="text-right">
                  {item.wins + item.losses}
                </TableCell>
                <TableCell className="text-right">
                  {((item.wins / (item.wins + item.losses)) * 100).toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
