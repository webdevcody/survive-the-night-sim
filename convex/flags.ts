import { query } from "./_generated/server";

export const getFlags = query({
  args: {},
  handler: async () => {
    return {
      showTestPage: process.env.FLAG_TEST_PAGE === "true",
      enableCronJobs: process.env.FLAG_CRON_JOBS === "true",
    };
  },
});
