import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getLevel, getXPProgress, getXPToNextLevel, getLevelTitle } from '../lib/xp';
import type { GameState } from '../types';
import { INITIAL_GAME_STATE } from '../types';

export function useGameState(userId: string | null) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [gameStateLoading, setGameStateLoading] = useState(true);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  useEffect(() => {
    if (!userId) return;

    supabase
      .from('game_states')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .then(async ({ data }) => {
        if (data) {
          setGameState({
            totalXP: data.total_xp,
            questsCompleted: data.quests_completed,
            currentStreak: data.current_streak,
            lastCompletedDate: data.last_completed_date,
          });
        } else {
          // One-time migration from localStorage
          const raw = localStorage.getItem('sidequest_game');
          if (raw) {
            try {
              const local = JSON.parse(raw) as GameState;
              await supabase.from('game_states').insert({
                user_id: userId,
                total_xp: local.totalXP,
                quests_completed: local.questsCompleted,
                current_streak: local.currentStreak,
                last_completed_date: local.lastCompletedDate,
              });
              setGameState(local);
              localStorage.removeItem('sidequest_game');
            } catch {
              // Migration failed — start fresh
            }
          }
        }
        setGameStateLoading(false);
      });
  }, [userId]);

  const addXP = (amount: number) => {
    setGameState((prev) => {
      const next = { ...prev, totalXP: prev.totalXP + amount };
      if (userIdRef.current) {
        supabase.from('game_states').upsert({
          user_id: userIdRef.current,
          total_xp: next.totalXP,
          quests_completed: next.questsCompleted,
          current_streak: next.currentStreak,
          last_completed_date: next.lastCompletedDate,
          updated_at: new Date().toISOString(),
        });
      }
      return next;
    });
  };

  const incrementQuestsCompleted = () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    setGameState((prev) => {
      const last = prev.lastCompletedDate;
      const newStreak =
        last === today ? prev.currentStreak :
        last === yesterday ? prev.currentStreak + 1 : 1;
      const next = {
        ...prev,
        questsCompleted: prev.questsCompleted + 1,
        currentStreak: newStreak,
        lastCompletedDate: today,
      };
      if (userIdRef.current) {
        supabase.from('game_states').upsert({
          user_id: userIdRef.current,
          total_xp: next.totalXP,
          quests_completed: next.questsCompleted,
          current_streak: next.currentStreak,
          last_completed_date: next.lastCompletedDate,
          updated_at: new Date().toISOString(),
        });
      }
      return next;
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
    gameStateLoading,
  };
}
