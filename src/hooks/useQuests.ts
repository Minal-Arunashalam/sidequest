import { useLocalStorage } from './useLocalStorage';
import type { Quest } from '../types';

export function useQuests() {
  const [quests, setQuests] = useLocalStorage<Quest[]>('sidequest_quests', []);
  const [activeQuestId, setActiveQuestId] = useLocalStorage<string | null>('sidequest_active', null);

  const addQuest = (quest: Quest) => {
    setQuests((prev) => [quest, ...prev]);
    setActiveQuestId(quest.id);
  };

  const updateQuest = (id: string, updates: Partial<Quest>) => {
    setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const completeQuest = (id: string, photoDataUrl: string, xpReward: number, onXP: (xp: number) => void, onIncrement: () => void) => {
    updateQuest(id, {
      status: 'completed',
      completedAt: Date.now(),
      photoDataUrl,
    });
    setActiveQuestId(null);
    onXP(xpReward);
    onIncrement();
  };

  const abandonQuest = (id: string) => {
    updateQuest(id, { status: 'skipped' });
    setActiveQuestId(null);
  };

  const clearActiveQuest = () => {
    setActiveQuestId(null);
  };

  const activeQuest = quests.find((q) => q.id === activeQuestId) ?? null;
  const completedQuests = quests.filter((q) => q.status === 'completed');
  const recentTitles = completedQuests.slice(0, 5).map((q) => q.title);
  const recentCategories = completedQuests.slice(0, 5).map((q) => q.category);

  const weeklyQuests = completedQuests.filter((q) => {
    if (!q.completedAt) return false;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return q.completedAt >= sevenDaysAgo;
  });

  return {
    quests,
    activeQuest,
    activeQuestId,
    completedQuests,
    weeklyQuests,
    recentTitles,
    recentCategories,
    addQuest,
    updateQuest,
    completeQuest,
    abandonQuest,
    clearActiveQuest,
    setActiveQuestId,
  };
}
