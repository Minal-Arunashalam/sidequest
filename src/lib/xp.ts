export const XP_PER_LEVEL = 500;

export function getLevel(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

export function getXPInCurrentLevel(totalXP: number): number {
  return totalXP % XP_PER_LEVEL;
}

export function getXPProgress(totalXP: number): number {
  return getXPInCurrentLevel(totalXP) / XP_PER_LEVEL;
}

export function getXPToNextLevel(totalXP: number): number {
  return XP_PER_LEVEL - getXPInCurrentLevel(totalXP);
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Wanderer',
  2: 'Scout',
  3: 'Adventurer',
  4: 'Explorer',
  5: 'Pathfinder',
  6: 'Trailblazer',
  7: 'Voyager',
  8: 'Legend',
  9: 'Mythic',
  10: 'Godlike',
};

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, 10)] ?? 'Godlike';
}
