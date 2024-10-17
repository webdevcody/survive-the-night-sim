import axios from 'axios';
import { z } from 'zod';
import { ModelHandler } from './index';

const PerplexityResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  object: z.string(),
  created: z.number(),
  choices: z.array(
    z.object({
      index: z.number(),
      finish_reason: z.string(),
      message: z.object({
        role: z.string(),
        content: z.string(),
      }),
      delta: z.object({
        role: z.string(),
        content: z.string(),
      }),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

const GameResponseSchema = z.object({
  reasoning: z.string(),
  playerCoordinates: z.array(z.number()),
  boxCoordinates: z.array(z.array(z.number())),
});

export const perplexityModel: ModelHandler = async (prompt: string, map: string[][]) => {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not set in the environment variables');
  }

  const messages = [
    { role: 'system', content: 'Be precise and concise.' },
    { role: 'user', content: prompt },
    { role: 'user', content: JSON.stringify(map) },
  ];

  const data = {
    model: 'llama-3.1-sonar-large-128k-online',
    messages,
    temperature: 0.2,
    top_p: 0.9,
    return_citations: true,
    search_domain_filter: ['perplexity.ai'],
    return_images: false,
    return_related_questions: false,
    search_recency_filter: 'month',
    top_k: 0,
    stream: false,
    presence_penalty: 0,
    frequency_penalty: 1,
  };

  try {
    const response = await axios.post('https://api.perplexity.ai/chat/completions', data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const validatedResponse = PerplexityResponseSchema.parse(response.data);
    const content = validatedResponse.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    const gameResponse = GameResponseSchema.parse(parsedContent);

    return {
      boxCoordinates: gameResponse.boxCoordinates,
      playerCoordinates: gameResponse.playerCoordinates,
      reasoning: gameResponse.reasoning,
    };
  } catch (error) {
    console.error('Failed to run Perplexity model Error:', error);
    throw new Error('Failed to run Perplexity model');
  }
};
