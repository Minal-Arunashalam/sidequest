import { createContext, useContext, type ReactNode } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useQuests } from '../hooks/useQuests';
import { useGeolocation } from '../hooks/useGeolocation';
import { useQuestGeneration } from '../hooks/useQuestGeneration';

type AppContextValue = ReturnType<typeof useGameState> &
  ReturnType<typeof useQuests> &
  ReturnType<typeof useGeolocation> &
  ReturnType<typeof useQuestGeneration>;

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const gameState = useGameState();
  const quests = useQuests();
  const geolocation = useGeolocation();
  const questGeneration = useQuestGeneration();

  const value: AppContextValue = {
    ...gameState,
    ...quests,
    ...geolocation,
    ...questGeneration,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
