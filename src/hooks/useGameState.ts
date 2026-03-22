import { useLocalStorage } from './useLocalStorage';
import { getLevel, getXPProgress, getXPToNextLevel, getLevelTitle } from '../lib/xp';
import type { GameState } from '../types';
import { INITIAL_GAME_STATE } from '../types';

export function useGameState() {
  const [gameState, setGameState] = useLocalStorage<GameState>('sidequest_game', INITIAL_GAME_STATE);

  const addXP = (amount: number) => {
    setGameState((prev) => ({
      ...prev,
      totalXP: prev.totalXP + amount,
    }));
  };

  const incrementQuestsCompleted = () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    setGameState((prev) => {
      const last = prev.lastCompletedDate;
      const newStreak =
        last === today ? prev.currentStreak :
        last === yesterday ? prev.currentStreak + 1 : 1;
      return {
        ...prev,
        questsCompleted: prev.questsCompleted + 1,
        currentStreak: newStreak,
        lastCompletedDate: today,
      };
    });
  };

  const level = getLevel(gameState.totalXP);
  const xpProgress = getXPProgress(gameState.totalXP);
  const xpToNextLevel = getXPToNextLevel(gameState.totalXP);
  const levelTitle = getLevelTitle(level);

  return {
    gameState,
    level,
    xpProgress,
    xpToNextLevel,
    levelTitle,
    addXP,
    incrementQuestsCompleted,
  };
}
