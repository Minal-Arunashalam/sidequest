import { supabase } from './supabase';
import type { Quest, QuestCategory } from '../types';

export interface Broadcast {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: 1 | 2 | 3;
  xp_reward: number;
  is_mystery: boolean;
  clues: string[] | null;
  lat: number;
  lng: number;
  created_at: string;
  expires_at: string;
}

function roundCoord(n: number) {
  return Math.round(n * 1000) / 1000; // ~100m precision
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function postBroadcast(quest: Quest, lat: number, lng: number): Promise<string | null> {
  const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('broadcasts')
    .insert({
      title: quest.title,
      description: quest.description ?? '',
      category: quest.category,
      difficulty: quest.difficulty,
      xp_reward: quest.xpReward,
      is_mystery: quest.isMystery ?? false,
      clues: quest.clues ?? null,
      lat: roundCoord(lat),
      lng: roundCoord(lng),
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (error) { console.error('postBroadcast:', error); return null; }
  return data.id;
}

export async function deleteBroadcast(id: string): Promise<void> {
  await supabase.from('broadcasts').delete().eq('id', id);
}

export async function fetchNearbyBroadcasts(
  lat: number,
  lng: number,
  radiusKm = 2
): Promise<(Broadcast & { distanceKm: number })[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('broadcasts')
    .select('*')
    .gt('expires_at', now)
    .order('created_at', { ascending: false });

  if (error) { console.error('fetchNearbyBroadcasts:', error); return []; }

  return (data as Broadcast[])
    .map((b) => ({ ...b, distanceKm: haversineKm(lat, lng, b.lat, b.lng) }))
    .filter((b) => b.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
