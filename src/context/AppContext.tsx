import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGameState } from '../hooks/useGameState';
import { useQuests } from '../hooks/useQuests';
import { useGeolocation } from '../hooks/useGeolocation';
import { useQuestGeneration } from '../hooks/useQuestGeneration';
import LoadingSpinner from '../components/ui/LoadingSpinner';

type AppContextValue = ReturnType<typeof useGameState> &
  ReturnType<typeof useQuests> &
  ReturnType<typeof useGeolocation> &
  ReturnType<typeof useQuestGeneration> & {
    loading: boolean;
  };

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { userId, authLoading } = useAuth();
  const gameState = useGameState(userId);
  const quests = useQuests(userId);
  const geolocation = useGeolocation();
  const questGeneration = useQuestGeneration();

  const loading = authLoading || gameState.gameStateLoading || quests.questsLoading;

  const value: AppContextValue = {
    ...gameState,
    ...quests,
    ...geolocation,
    ...questGeneration,
    loading,
  };

  return (
    <AppContext.Provider value={value}>
      {loading ? <LoadingSpinner /> : children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
