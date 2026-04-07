import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { uploadQuestPhoto } from '../lib/storage';
import type { Quest } from '../types';

function toRow(quest: Quest, userId: string) {
  return {
    id: quest.id,
    user_id: userId,
    title: quest.title,
    description: quest.description ?? '',
    category: quest.category,
    xp_reward: quest.xpReward,
    difficulty: quest.difficulty,
    lat: quest.location?.lat ?? null,
    lng: quest.location?.lng ?? null,
    location_label: quest.locationLabel ?? null,
    status: quest.status,
    generated_at: quest.generatedAt,
    completed_at: quest.completedAt ?? null,
    photo_url: quest.photoDataUrl ?? null,
    is_mystery: quest.isMystery ?? false,
    clues: quest.clues ?? null,
    revealed_clue_count: quest.revealedClueCount ?? null,
  };
}

function fromRow(row: Record<string, any>): Quest {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    xpReward: row.xp_reward,
    difficulty: row.difficulty,
    location: { lat: row.lat, lng: row.lng },
    locationLabel: row.location_label ?? undefined,
    status: row.status,
    generatedAt: row.generated_at,
    completedAt: row.completed_at ?? undefined,
    photoDataUrl: row.photo_url ?? undefined,
    isMystery: row.is_mystery ?? undefined,
    clues: row.clues ?? undefined,
    revealedClueCount: row.revealed_clue_count ?? undefined,
  };
}

export function useQuests(userId: string | null) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  useEffect(() => {
    if (!userId) return;

    supabase
      .from('quests')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .then(async ({ data }) => {
        if (data && data.length > 0) {
          setQuests(data.map(fromRow));
        } else {
          // One-time migration from localStorage
          const raw = localStorage.getItem('sidequest_quests');
          if (raw) {
            try {
              const local = JSON.parse(raw) as Quest[];
              if (local.length > 0) {
                await supabase.from('quests').insert(local.map((q) => toRow(q, userId)));
                setQuests(local);
                localStorage.removeItem('sidequest_quests');
                localStorage.removeItem('sidequest_active');
              }
            } catch {
              // Migration failed — start fresh
            }
          }
        }
        setQuestsLoading(false);
      });
  }, [userId]);

  const addQuest = (quest: Quest) => {
    setQuests((prev) => [quest, ...prev]);
    if (userIdRef.current) {
      supabase.from('quests').insert(toRow(quest, userIdRef.current));
    }
  };

  const updateQuest = (id: string, updates: Partial<Quest>) => {
    setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
    if (userIdRef.current) {
      const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
      if (updates.photoDataUrl !== undefined) dbUpdates.photo_url = updates.photoDataUrl;
      if (updates.revealedClueCount !== undefined) dbUpdates.revealed_clue_count = updates.revealedClueCount;
      if (updates.locationLabel !== undefined) dbUpdates.location_label = updates.locationLabel;
      supabase.from('quests').update(dbUpdates).eq('id', id);
    }
  };

  const completeQuest = async (
    id: string,
    photoDataUrl: string,
    xpReward: number,
    onXP: (xp: number) => void,
    onIncrement: () => void
  ) => {
    const completedAt = Date.now();
    let photoUrl = photoDataUrl;

    // Upload photo to Supabase Storage if we have a userId
    if (userIdRef.current) {
      try {
        photoUrl = await uploadQuestPhoto(userIdRef.current, id, photoDataUrl);
      } catch {
        // Upload failed — fall back to storing nothing (photo won't persist)
        photoUrl = '';
      }
    }

    updateQuest(id, { status: 'completed', completedAt, photoDataUrl: photoUrl });
    onXP(xpReward);
    onIncrement();
  };

  const abandonQuest = (id: string) => {
    updateQuest(id, { status: 'skipped' });
  };

  const clearActiveQuest = () => {
    // No-op: active quest is derived from status, not a separate field
  };

  // Active quest is derived — the most recently generated pending/active quest
  const activeQuestId =
    quests.find((q) => q.status === 'pending' || q.status === 'active')?.id ?? null;
  const activeQuest = quests.find((q) => q.id === activeQuestId) ?? null;
  const completedQuests = quests.filter((q) => q.status === 'completed');
  const recentTitles = completedQuests.slice(0, 5).map((q) => q.title);
  const recentCategories = completedQuests.slice(0, 5).map((q) => q.category);

  const weeklyQuests = completedQuests.filter((q) => {
    if (!q.completedAt) return false;
    return q.completedAt >= Date.now() - 7 * 24 * 60 * 60 * 1000;
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
    setActiveQuestId: () => {}, // derived — kept for API compatibility
    questsLoading,
  };
}
