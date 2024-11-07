export const AI_MODELS = {
  "gpt-4o": {
    slug: "gpt-4o",
    name: "OpenAI - GPT-4o",
  },
  "claude-3.5-sonnet": {
    slug: "claude-3.5-sonnet",
    name: "Anthropic - Claude 3.5 Sonnet",
  },
  "perplexity-llama-3.1": {
    slug: "perplexity-llama-3.1",
    name: "Perplexity - Llama 3.1",
  },
  "mistral-large-2": {
    slug: "mistral-large-2",
    name: "Mistral - Large 2",
  },
  "gemini-1.5-pro": {
    slug: "gemini-1.5-pro",
    name: "Google - Gemini 1.5 Pro",
  },
} as const;

export enum ActionType {
  PlayerShoot = "player-shoot",
  PlayerWalk = "player-walk",
  ZombieSpawn = "zombie-spawn",
  ZombieStep = "zombie-step",
}

export type ModelSlug = (typeof AI_MODELS)[keyof typeof AI_MODELS]["slug"];

export const AI_MODEL_SLUGS = Object.keys(AI_MODELS) as ModelSlug[];

// how long between each level when the AI models start playing.
// spacing out the levels to make it easier to watch in the games list and reduce ai token usage.
export const PLAY_DELAY = process.env.PLAY_DELAY
  ? parseInt(process.env.PLAY_DELAY)
  : 0;

export const CRON_INTERVAL = process.env.CRON_INTERVAL
  ? parseInt(process.env.CRON_INTERVAL)
  : 60;
