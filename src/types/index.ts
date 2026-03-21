export type QuestStatus = 'pending' | 'active' | 'completed' | 'skipped';
export type QuestCategory = 'exploration' | 'social' | 'creative' | 'physical';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  xpReward: number;
  difficulty: 1 | 2 | 3;
  location: GeoLocation;
  locationLabel?: string;
  status: QuestStatus;
  generatedAt: number;
  completedAt?: number;
  photoDataUrl?: string;
}

export interface GameState {
  totalXP: number;
  questsCompleted: number;
}

export const INITIAL_GAME_STATE: GameState = {
  totalXP: 0,
  questsCompleted: 0,
};

export const CATEGORY_EMOJI: Record<QuestCategory, string> = {
  exploration: '🗺️',
  social: '🤝',
  creative: '🎨',
  physical: '⚡',
};

export const CATEGORY_COLOR: Record<QuestCategory, string> = {
  exploration: '#00f5ff',
  social: '#f72585',
  creative: '#9b5de5',
  physical: '#f5ff00',
};
