export const AI_MODELS = [
  {
    model: "gemini-1.5-pro",
    name: "Google - Gemini 1.5 Pro",
  },
  {
    model: "gpt-4o",
    name: "OpenAI - GPT-4o",
  },
  {
    model: "claude-3.5-sonnet",
    name: "Anthropic - Claude 3.5 Sonnet",
  },
  {
    model: "perplexity-llama-3.1",
    name: "Perplexity - Llama 3.1",
  },
  {
    model: "mistral-large-2",
    name: "Mistral - Large 2",
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
