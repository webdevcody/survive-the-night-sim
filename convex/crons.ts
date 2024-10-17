import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { CRON_INTERVAL } from "./constants";

const crons = cronJobs();

crons.interval(
  "run games for all active models",
  { minutes: CRON_INTERVAL },
  internal.models.runActiveModelsGames,
);

export default crons;
