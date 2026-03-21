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
    setGameState((prev) => ({
      ...prev,
      questsCompleted: prev.questsCompleted + 1,
    }));
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
