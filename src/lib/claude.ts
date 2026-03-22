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

// Vibe-adjusted category weights: [social, creative, exploration, physical]
const VIBE_WEIGHTS: Record<string, Record<string, number[]>> = {
  'burnt-out': {
    decompress: [0.25, 0.45, 0.25, 0.05],
    creative:   [0.15, 0.60, 0.20, 0.05],
    default:    [0.30, 0.40, 0.25, 0.05],
  },
  anxious: {
    decompress: [0.10, 0.55, 0.25, 0.10],
    creative:   [0.10, 0.65, 0.20, 0.05],
    default:    [0.15, 0.50, 0.25, 0.10],
  },
  energized: {
    move:       [0.15, 0.15, 0.30, 0.40],
    explore:    [0.15, 0.20, 0.50, 0.15],
    socialize:  [0.50, 0.20, 0.20, 0.10],
    default:    [0.25, 0.25, 0.30, 0.20],
  },
  bored: {
    default:    [0.25, 0.30, 0.30, 0.15],
  },
};

function pickCategory(
  previousCategories: string[],
  lastRolledCategory: string | null,
  vibeContext?: { mood: string; time: string; goal?: string }
): QuestCategory {
  const cats: QuestCategory[] = ['social', 'creative', 'exploration', 'physical'];

  // Pick weights based on vibe, fall back to static defaults
  let weights = WEIGHTS.map(w => w.weight);
  if (vibeContext?.mood) {
    const moodWeights = VIBE_WEIGHTS[vibeContext.mood];
    if (moodWeights) {
      const goalKey = vibeContext.goal && moodWeights[vibeContext.goal] ? vibeContext.goal : 'default';
      weights = moodWeights[goalKey] ?? weights;
    }
  }

  const draw = (): QuestCategory => {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < cats.length; i++) {
      cumulative += weights[i];
      if (r < cumulative) return cats[i];
    }
    return cats[0];
  };

  const picked = draw();
  if (picked === lastRolledCategory) return draw();
  const last2 = previousCategories.slice(0, 2);
  if (last2.length === 2 && last2.every((c) => c === picked)) return draw();
  return picked;
}

const MOOD_LABELS: Record<string, string> = {
  energized: 'energized and ready to go',
  meh: 'feeling meh / neutral',
  'burnt-out': 'burnt out and low on energy',
  anxious: 'a bit anxious',
  bored: 'bored and restless',
};

const TIME_LABELS: Record<string, string> = {
  '30min': '30 minutes',
  '1hour': '1 hour',
  '2hours': '2 hours',
  '3plus': '3 or more hours',
};

const GOAL_LABELS: Record<string, string> = {
  socialize: 'connect with people',
  decompress: 'decompress and recharge',
  creative: 'do something creative',
  move: 'get moving and physical',
  explore: 'discover something new',
};

const MOOD_TONE: Record<string, string> = {
  energized: 'Make it ambitious and exciting — push them a bit.',
  meh: 'Make it easy to start but engaging once they get going.',
  'burnt-out': 'Keep it gentle and restorative — a "reset quest". Low stakes, calming, solo-friendly.',
  anxious: 'Keep it grounding and focused. Small scope, clear steps, no social pressure.',
  bored: 'Make it novel and a little weird — something that gets them out the door immediately.',
};

export async function generateQuest(
  lat: number,
  lng: number,
  locationLabel: string,
  previousQuestTitles: string[] = [],
  previousCategories: string[] = [],
  lastRolledCategory: string | null = null,
  vibeContext?: { mood: string; time: string; goal?: string }
): Promise<GeneratedQuest> {
  const category = pickCategory(previousCategories, lastRolledCategory, vibeContext);

  // Fetch real nearby places from OpenStreetMap (best-effort — fails silently)
  const { featured, all: pois } = await fetchNearbyPOIs(lat, lng);

  const vibeSection = vibeContext
    ? (() => {
        const moodLabel = MOOD_LABELS[vibeContext.mood] ?? vibeContext.mood;
        const timeLabel = TIME_LABELS[vibeContext.time] ?? vibeContext.time;
        const goalLabel = vibeContext.goal ? GOAL_LABELS[vibeContext.goal] ?? vibeContext.goal : null;
        const tone = MOOD_TONE[vibeContext.mood] ?? '';
        return `\nUser vibe:\n- Feeling: ${moodLabel}\n- Available time: ${timeLabel}${goalLabel ? `\n- Goal: ${goalLabel}` : ''}\n${tone}`;
      })()
    : '';

  const timeConstraint = vibeContext
    ? TIME_LABELS[vibeContext.time] ?? '30-60 minutes'
    : '30-60 minutes';

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

  const prompt = `Generate ONE creative micro-adventure for someone currently at ${locationLabel} (coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}).${vibeSection}${featuredSection}${allPoisSection}

The quest must:
- Be completable within walking distance in ${timeConstraint}
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

  const vibeSystemSection = vibeContext
    ? (() => {
        const moodLabel = MOOD_LABELS[vibeContext.mood] ?? vibeContext.mood;
        const goalLabel = vibeContext.goal ? GOAL_LABELS[vibeContext.goal] ?? vibeContext.goal : null;
        const tone = MOOD_TONE[vibeContext.mood] ?? '';
        return ` The user is ${moodLabel}${goalLabel ? ` and wants to ${goalLabel}` : ''}. ${tone}`;
      })()
    : '';

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 350,
    temperature: 1,
    system: `You are a micro-adventure quest generator. You MUST set the "category" field to exactly "${category}" — never any other value. This is a hard requirement.${vibeSystemSection}`,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = (message.content[0] as { type: 'text'; text: string }).text.trim();
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = JSON.parse(clean) as GeneratedQuest;
  parsed.category = category; // enforce our pre-selected category regardless of Claude's output
  return parsed;
}
