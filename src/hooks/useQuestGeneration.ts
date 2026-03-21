import { useState, useCallback } from 'react';
import { generateQuest } from '../lib/claude';
import type { Quest } from '../types';

type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

interface QuestGenerationState {
  status: GenerationStatus;
  pendingQuest: Quest | null;
  error: string | null;
}

export function useQuestGeneration() {
  const [state, setState] = useState<QuestGenerationState>({
    status: 'idle',
    pendingQuest: null,
    error: null,
  });

  const generate = useCallback(
    async (
      lat: number,
      lng: number,
      locationLabel: string,
      previousTitles: string[] = []
    ): Promise<Quest | null> => {
      setState({ status: 'loading', pendingQuest: null, error: null });

      try {
        const result = await generateQuest(lat, lng, locationLabel, previousTitles);
        const quest: Quest = {
          id: crypto.randomUUID(),
          ...result,
          location: { lat, lng },
          locationLabel,
          status: 'pending',
          generatedAt: Date.now(),
        };
        setState({ status: 'success', pendingQuest: quest, error: null });
        return quest;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to generate quest. Check your API key.';
        setState({ status: 'error', pendingQuest: null, error: message });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ status: 'idle', pendingQuest: null, error: null });
  }, []);

  return {
    ...state,
    generate,
    reset,
    isLoading: state.status === 'loading',
  };
}
