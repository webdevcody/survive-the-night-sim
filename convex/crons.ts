import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "run games for all active models",
  { minutes: 60 },
  internal.models.runActiveModelsGames,
);

export default crons;
