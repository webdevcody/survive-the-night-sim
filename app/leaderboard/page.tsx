"use client";

import { useQuery } from "convex/react";
import { Page, PageTitle } from "@/components/Page";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";

// Define the types for the data
interface Ranking {
  _id: string;
  modelId: string;
  level?: string;
  wins: number;
  losses: number;
}

interface Stats {
  wins: number;
  losses: number;
  total: number;
  ratio: number;
}

const LeaderBoard = () => {
  const globalRanking = useQuery(api.leaderboard.getGlobalRankings) as
    | Ranking[]
    | undefined;
  const levelRanking = useQuery(api.leaderboard.getAllLevelRankings) as
    | Ranking[]
    | undefined;

  // Transform the levelRanking data into a pivot table structure
  const pivotLevelData = (levelRanking: Ranking[] | undefined) => {
    const levels: Record<string, Record<string, Stats>> = {};

    levelRanking?.forEach((item) => {
      if (!levels[item.level!]) {
        levels[item.level!] = {};
      }

      levels[item.level!][item.modelId] = {
        wins: item.wins,
        losses: item.losses,
        total: item.wins + item.losses,
        ratio: item.wins / (item.wins + item.losses),
      };
    });

    return levels;
  };

  const pivotedLevelData = pivotLevelData(levelRanking);

  // Get all unique model IDs to dynamically create columns
  const allModels = Array.from(
    new Set(levelRanking?.map((item) => item.modelId)),
  );

  return (
    <Page>
      <PageTitle>Leaderboard</PageTitle>

      <Tabs defaultValue="global">
        <TabsList>
          <TabsTrigger value="global">Global Rankings</TabsTrigger>
          <TabsTrigger value="level">Map based Rankings</TabsTrigger>
        </TabsList>
        <TabsContent value="global" className="p-4">
          {/* Global Rankings Table */}
          <Table>
            <TableCaption>The global model realtime tally.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Model ID</TableHead>
                <TableHead>Number of Wins</TableHead>
                <TableHead>Number of Losses</TableHead>
                <TableHead>Total Games</TableHead>
                <TableHead className="text-right">Ratio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {globalRanking?.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.modelId}</TableCell>
                  <TableCell>{item.wins}</TableCell>
                  <TableCell>{item.losses}</TableCell>
                  <TableCell>{item.wins + item.losses}</TableCell>
                  <TableCell className="text-right">
                    {(item.wins / (item.wins + item.losses)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="level" className="p-4">
          {/* Map-based Rankings Pivoted Table */}
          <Table>
            <TableCaption>The models map-based tally per level.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                {/* Dynamically render column headers for each model */}
                {allModels.map((modelId) => (
                  <TableHead key={modelId}>{modelId}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Render rows for each level */}
              {Object.entries(pivotedLevelData).map(([level, models]) => (
                <TableRow key={level}>
                  <TableCell>{level}</TableCell>
                  {/* Render stats for each model in the columns */}
                  {allModels.map((modelId) => {
                    const stats = models[modelId] || {
                      wins: 0,
                      losses: 0,
                      total: 0,
                      ratio: 0,
                    };
                    return (
                      <TableCell key={modelId}>
                        Wins: {stats.wins}, Losses: {stats.losses}, Games:{" "}
                        {stats.total}, Ratio: {stats.ratio.toFixed(2)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </Page>
  );
};

export default LeaderBoard;
