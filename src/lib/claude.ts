import Anthropic from '@anthropic-ai/sdk';
import type { QuestCategory } from '../types';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface GeneratedQuest {
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: 1 | 2 | 3;
  xpReward: number;
}

export async function generateQuest(
  lat: number,
  lng: number,
  locationLabel: string,
  previousQuestTitles: string[] = []
): Promise<GeneratedQuest> {
  const avoidSection =
    previousQuestTitles.length > 0
      ? `\nAvoid these quest types the user already completed recently: ${previousQuestTitles.slice(-5).join('; ')}.`
      : '';

  const prompt = `You are a spontaneous adventure generator. Generate ONE creative micro-adventure for someone currently at ${locationLabel} (coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}).

The quest must:
- Be completable within walking distance in 30-60 minutes
- Be genuinely fun, slightly unexpected, and specific to this kind of location
- Be safe and legal
- Have a concrete completion condition that can be photographed (a selfie, an object, a scene)
- Feel like a real quest from a video game — specific, immersive, memorable${avoidSection}

Examples of great quests:
- "Find the oldest tree within 3 blocks and take a selfie with it"
- "Go to the nearest coffee shop and order something you've never tried — bonus XP if it's weird"
- "Find a piece of street art within 5 minutes walk and photograph the full piece"
- "Introduce yourself to a stranger and learn one interesting fact about them — photo proof of the convo"

Respond ONLY with valid JSON (no markdown, no explanation) matching this exact schema:
{
  "title": "short punchy quest title (max 8 words)",
  "description": "full quest with specific fun instructions (2-3 sentences, keep it exciting)",
  "category": "exploration" | "social" | "creative" | "physical",
  "difficulty": 1 | 2 | 3,
  "xpReward": number between 50 and 200
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 350,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = (message.content[0] as { type: 'text'; text: string }).text.trim();

  // Strip any potential markdown code fences
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(clean) as GeneratedQuest;
}
