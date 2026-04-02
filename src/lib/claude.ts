import type { QuestCategory } from '../types';
import { fetchNearbyPOIs } from './places';

export interface GeneratedQuest {
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: 1 | 2 | 3;
  xpReward: number;
  isMystery?: boolean;
  clues?: string[];
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

export async function generateQuest(
  lat: number,
  lng: number,
  locationLabel: string,
  previousQuestTitles: string[] = [],
  previousCategories: string[] = [],
  lastRolledCategory: string | null = null,
  vibeContext?: { mood: string; time: string; goal?: string },
  mystery?: boolean
): Promise<GeneratedQuest> {
  const category = pickCategory(previousCategories, lastRolledCategory, vibeContext);

  // Fetch real nearby places from OpenStreetMap (best-effort — fails silently)
  const { featured, all: pois } = await fetchNearbyPOIs(lat, lng);

  const res = await fetch('/api/generate-quest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lat,
      lng,
      locationLabel,
      featured,
      pois,
      category,
      previousQuestTitles,
      vibeContext,
      mystery,
    }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Quest generation failed' }));
    throw new Error(error ?? 'Quest generation failed');
  }

  const { quest } = await res.json();
  return quest as GeneratedQuest;
}
