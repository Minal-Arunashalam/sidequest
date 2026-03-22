import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fetchNearbyBroadcasts, type Broadcast } from '../lib/broadcasts';
import { CATEGORY_COLOR, CATEGORY_EMOJI } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DIFF_LABEL: Record<number, string> = { 1: 'EASY', 2: 'MED', 3: 'HARD' };

function distanceLabel(km: number) {
  if (km < 0.1) return '< 100m';
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export default function Nearby() {
  const navigate = useNavigate();
  const { getLocation, location, locationLabel } = useApp();
  const [broadcasts, setBroadcasts] = useState<(Broadcast & { distanceKm: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const geo = location ? { location, locationLabel } : await getLocation();
      const results = await fetchNearbyBroadcasts(geo.location.lat, geo.location.lng);
      setBroadcasts(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load nearby quests.');
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  function handleJoin(b: Broadcast) {
    const params = new URLSearchParams({
      sq_title: b.title,
      sq_desc: b.description ?? '',
      sq_cat: b.category,
      sq_diff: String(b.difficulty),
      sq_xp: String(b.xp_reward),
      ...(b.is_mystery && b.clues ? { sq_mystery: 'true', sq_clues: JSON.stringify(b.clues) } : {}),
    });
    navigate(`/quest?${params.toString()}`);
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '28px 20px 20px', gap: '20px', background: '#0a0a0f' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '14px', fontFamily: '"Press Start 2P", monospace', color: '#f72585', letterSpacing: '0.04em', lineHeight: 1.4, textShadow: '0 0 16px rgba(247,37,133,0.4)' }}>
          NEARBY
        </h1>
        <button
          onClick={load}
          style={{ background: 'none', border: '1px solid #2a2a3f', padding: '6px 10px', fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', cursor: 'pointer', letterSpacing: '0.04em' }}
        >
          ↻ REFRESH
        </button>
      </div>
      <p style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', lineHeight: 2, marginTop: '-10px' }}>
        QUESTS HAPPENING NEAR YOU
      </p>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '36px 20px' }}>
          <p style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#f72585', lineHeight: 2 }}>{error}</p>
        </div>
      ) : broadcasts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 20px', border: '2px dashed #2a2a3f', background: '#13131f' }}>
          <p style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', lineHeight: 2 }}>
            NO QUESTS NEARBY
          </p>
          <p style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#2a2a3f', lineHeight: 2, marginTop: '8px' }}>
            BE THE FIRST — ROLL A QUEST
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {broadcasts.map((b) => {
            const col = CATEGORY_COLOR[b.category] ?? '#9b5de5';
            return (
              <button
                key={b.id}
                onClick={() => handleJoin(b)}
                style={{ background: '#13131f', border: `2px solid ${col}40`, padding: '16px', boxShadow: '4px 4px 0px #000', textAlign: 'left', cursor: 'pointer', width: '100%' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '7px', fontFamily: '"Press Start 2P", monospace', color: col, padding: '3px 8px', border: `1px solid ${col}`, background: `${col}18` }}>
                      {CATEGORY_EMOJI[b.category]} {b.category.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '7px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', padding: '3px 8px', border: '1px solid #2a2a3f' }}>
                      {DIFF_LABEL[b.difficulty]}
                    </span>
                    {b.is_mystery && (
                      <span style={{ fontSize: '7px', fontFamily: '"Press Start 2P", monospace', color: '#9b5de5', padding: '3px 8px', border: '1px solid #9b5de5' }}>
                        🔍 MYSTERY
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#f5ff00', flexShrink: 0, marginLeft: '8px' }}>
                    +{b.xp_reward} XP
                  </span>
                </div>
                <p style={{ fontSize: '10px', fontFamily: '"Press Start 2P", monospace', color: '#e8e8f0', lineHeight: 1.8, marginBottom: '10px' }}>
                  {b.title}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '7px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f' }}>
                    ◎ {distanceLabel(b.distanceKm)} AWAY
                  </span>
                  <span style={{ fontSize: '7px', fontFamily: '"Press Start 2P", monospace', color: '#f72585' }}>
                    JOIN ▶
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
