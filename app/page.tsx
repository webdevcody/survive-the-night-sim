"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import Result from "./result";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";

export default function GamePage() {
  const results = useQuery(api.results.getLastCompletedResults);
  const globalRanking = useQuery(api.leaderboard.getGlobalRankings);

  if (results === undefined) {
    return (
      <div className="container mx-auto min-h-screen space-y-8 pb-24 pt-12">
        <h1 className="text-2xl font-bold">Recent Games</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="container mx-auto min-h-screen space-y-8 pb-24 pt-12">
        <h1 className="text-2xl font-bold">Recent Games</h1>
        <p>No results yet</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex gap-12 pt-12">
      <div className="flex-grow space-y-8">
        <h1 className="text-2xl font-bold">Recent Games</h1>
        <div className="flex h-[calc(100vh_-_185px)] flex-col gap-4 overflow-y-auto">
          {results.map((result) => (
            <Result key={result._id} result={result} />
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
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
