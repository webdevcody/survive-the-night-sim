export const AI_MODELS = [
  {
    model: "gemini-1.5-pro",
    name: "Gemini - 1.5 Pro",
  },
  {
    model: "gpt-4o",
    name: "OpenAI - 4o Mini",
  },
];

export const AI_MODEL_IDS = AI_MODELS.map((model) => model.model);

// how long between each level when the AI models start playing.
// spacing out the levels to make it easier to watch in the games list and reduce ai token usage.
export const PLAY_DELAY = process.env.PLAY_DELAY
  ? parseInt(process.env.PLAY_DELAY)
  : 0;

export const CRON_INTERVAL = process.env.CRON_INTERVAL
  ? parseInt(process.env.CRON_INTERVAL)
  : 60;
