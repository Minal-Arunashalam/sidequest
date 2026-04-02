import Anthropic from '@anthropic-ai/sdk';

type QuestCategory = 'exploration' | 'social' | 'creative' | 'physical';

interface POI {
  name: string;
  type: string;
}

interface GeneratedQuest {
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: 1 | 2 | 3;
  xpReward: number;
  isMystery?: boolean;
  clues?: string[];
}

interface RequestBody {
  lat: number;
  lng: number;
  locationLabel: string;
  featured: POI | null;
  pois: POI[];
  category: QuestCategory;
  previousQuestTitles: string[];
  vibeContext?: { mood: string; time: string; goal?: string };
  mystery?: boolean;
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
  }

  const {
    lat,
    lng,
    locationLabel,
    featured,
    pois,
    category,
    previousQuestTitles = [],
    vibeContext,
    mystery,
  }: RequestBody = req.body;

  const client = new Anthropic({ apiKey });

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
    ? `\nDestination (the stage): ${featured.name} (${featured.type}). Send the user here. Name it in the quest. The quest is about what they do or notice when they arrive — not a claim about what makes this place special.`
    : '';

  const allPoisSection =
    pois.length > 1
      ? `\nOther real nearby places you can use as the stage instead:\n${pois.slice(1).map((p: POI) => `- ${p.name} (${p.type})`).join('\n')}`
      : '';

  const avoidSection =
    previousQuestTitles.length > 0
      ? `\nDo NOT generate a quest with a title or premise similar to any of these previous quests: ${previousQuestTitles.slice(-5).join('; ')}. The new quest must have a meaningfully different structure and hook.`
      : '';

  const prompt = mystery
    ? `Generate ONE mystery micro-adventure for someone currently at ${locationLabel} (coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}).${vibeSection}${featuredSection}${allPoisSection}

The quest must:
- Be completable within walking distance in ${timeConstraint}
- Be safe and legal
- Have a photo-worthy completion condition that is always achievable regardless of what the place is like that day${avoidSection}

This is a MYSTERY QUEST delivered as 3 progressive clues. The clues lead to a real nearby place. The place is the stage — the mystery unfolds in what the user does or notices when they arrive, not in a secret fact about the place.

- Clue 1: cryptic and poetic — evokes a feeling or sensation, reveals nothing about the location
- Clue 2: narrows to a type of place or general area, still no name
- Clue 3: names the destination clearly, then gives a specific action or observation that is ALWAYS true regardless of the day, time, or what's on offer — something the user will experience internally (a choice, a thing to notice, something to create or leave behind)

NEVER write clues that claim something specific exists at the place (a hidden item, a secret menu, a specific person). The payoff is the user's own experience.

Respond ONLY with valid JSON matching this schema:
{
  "title": "short punchy mystery title (max 8 words)",
  "clues": ["clue 1 text", "clue 2 text", "clue 3 text"],
  "category": "${category}",
  "difficulty": 2 | 3,
  "xpReward": number between 150 and 250
}`
    : `Generate ONE micro-adventure for someone currently at ${locationLabel} (coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}).${vibeSection}${featuredSection}${allPoisSection}

The quest is a FRAME, not a fact. A nearby place is the stage — the destination that gives the quest its shape. The interesting thing is always what the user does or notices there, never a claim about what makes the place special.

The quest must:
- Be completable within walking distance in ${timeConstraint}
- Name a real nearby place as the destination, but never claim something about it that might not be true
- Feel like something the world already set up — the user just has to show up
- Be safe and legal
- Have a concrete completion condition that can be photographed

The interesting thing is ALWAYS internal to the user's experience. Good mechanics: order whatever looks least familiar and eat it without your phone; sit somewhere and count something most people walk past; make a decision on the spot with no research; leave something small behind; notice one thing that contradicts your first impression; start a conversation with one stranger.

NEVER write: "This place has X", "Ask for the Y", "They make a Z". ALWAYS write: "Go to [place]. Do this. Notice that."${avoidSection}

Respond ONLY with valid JSON matching this schema:
{
  "title": "short punchy quest title (max 8 words)",
  "description": "full quest instructions (2-3 sentences, direct and specific)",
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

  const mysterySystemSection = mystery
    ? ' This is a mystery quest — generate exactly 3 progressive clues in the "clues" array. Do NOT include a "description" field.'
    : '';

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      temperature: 1,
      system: `You are a micro-adventure quest generator. The quest is a frame, not a fact. Nearby places are stages — destinations that give the quest its shape. The interesting thing is always what the user does or notices there, never a claim about the place itself. You MUST set the "category" field to exactly "${category}" — never any other value. This is a hard requirement.${vibeSystemSection}${mysterySystemSection}`,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (message.content[0] as { type: 'text'; text: string }).text.trim();
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(clean) as GeneratedQuest;
    parsed.category = category;
    if (mystery) {
      parsed.isMystery = true;
      parsed.description = parsed.description ?? '';
    }

    return res.status(200).json({ quest: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Quest generation failed';
    return res.status(500).json({ error: message });
  }
}
