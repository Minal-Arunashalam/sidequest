import Anthropic from '@anthropic-ai/sdk';
import type { QuestCategory } from '../types';
import { fetchNearbyPOIs } from './places';

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

const WEIGHTS: { category: QuestCategory; weight: number }[] = [
  { category: 'social',      weight: 0.30 },
  { category: 'creative',    weight: 0.30 },
  { category: 'exploration', weight: 0.25 },
  { category: 'physical',    weight: 0.15 },
];

function pickCategory(previousCategories: string[], lastRolledCategory: string | null): QuestCategory {
  const draw = (): QuestCategory => {
    const r = Math.random();
    let cumulative = 0;
    for (const { category, weight } of WEIGHTS) {
      cumulative += weight;
      if (r < cumulative) return category;
    }
    return 'social';
  };

  const picked = draw();

  // Don't repeat the last rolled category (covers rerolls, not just completions)
  if (picked === lastRolledCategory) return draw();

  // Also don't repeat if the last 2 completed quests were both this category
  const last2 = previousCategories.slice(0, 2);
  if (last2.length === 2 && last2.every((c) => c === picked)) return draw();

  return picked;
}

export async function generateQuest(
  lat: number,
  lng: number,
  locationLabel: string,
  previousQuestTitles: string[] = [],
  previousCategories: string[] = [],
  lastRolledCategory: string | null = null
): Promise<GeneratedQuest> {
  const category = pickCategory(previousCategories, lastRolledCategory);

  // Fetch real nearby places from OpenStreetMap (best-effort — fails silently)
  const { featured, all: pois } = await fetchNearbyPOIs(lat, lng);

  const featuredSection = featured
    ? `\nThis quest MUST be built around this specific real place: ${featured.name} (${featured.type}). Use its exact name in the title or description.`
    : '';

  const allPoisSection =
    pois.length > 1
      ? `\nOther real places nearby for flavor/context:\n${pois.slice(1).map(p => `- ${p.name} (${p.type})`).join('\n')}`
      : '';

  const avoidSection =
    previousQuestTitles.length > 0
      ? `\nDo NOT generate a quest with a title or premise similar to any of these previous quests: ${previousQuestTitles.slice(-5).join('; ')}. The new quest must have a meaningfully different structure and hook.`
      : '';

  const prompt = `Generate ONE creative micro-adventure for someone currently at ${locationLabel} (coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}).${featuredSection}${allPoisSection}

The quest must:
- Be completable within walking distance in 30-60 minutes
- Be genuinely fun, slightly unexpected, and grounded in this specific place
- Be safe and legal
- Have a concrete completion condition that can be photographed
- Use a varied mechanic — not always "find X and photograph it". Consider: timed challenges, counting things, starting a conversation, creating something, leaving something behind, documenting a before/after, or solving a mini-mystery${avoidSection}

Respond ONLY with valid JSON matching this schema:
{
  "title": "short punchy quest title (max 8 words)",
  "description": "full quest instructions (2-3 sentences, specific and exciting)",
  "category": "${category}",
  "difficulty": 1 | 2 | 3,
  "xpReward": number between 50 and 200
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 350,
    temperature: 1,
    system: `You are a micro-adventure quest generator. You MUST set the "category" field to exactly "${category}" — never any other value. This is a hard requirement.`,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = (message.content[0] as { type: 'text'; text: string }).text.trim();
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = JSON.parse(clean) as GeneratedQuest;
  parsed.category = category; // enforce our pre-selected category regardless of Claude's output
  return parsed;
}
