import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LevelBadge from '../components/ui/LevelBadge';
import XPBar from '../components/ui/XPBar';
import PixelButton from '../components/ui/PixelButton';
import { CATEGORY_COLOR, CATEGORY_EMOJI } from '../types';

export default function Home() {
  const { gameState, level, xpProgress, xpToNextLevel, completedQuests } = useApp();
  const questsCompleted = gameState.questsCompleted;
  const navigate = useNavigate();
  const recentQuests = completedQuests.slice(0, 3);

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '32px 20px 20px', gap: '20px', background: '#0a0a0f' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontFamily: '"Press Start 2P", monospace', color: '#f5ff00', letterSpacing: '0.04em', lineHeight: 1.4, textShadow: '0 0 20px rgba(245,255,0,0.5)' }}>
            SIDE<br />QUEST
          </h1>
          <p style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', marginTop: '10px', letterSpacing: '0.05em', lineHeight: 1.8 }}>
            YOUR ADVENTURE AWAITS
          </p>
        </div>
        <LevelBadge level={level} size="md" />
      </div>

      {/* XP card */}
      <div style={{ background: '#13131f', border: '2px solid #2a2a3f', padding: '18px 20px', boxShadow: '4px 4px 0px #000' }}>
        <XPBar progress={xpProgress} totalXP={gameState.totalXP} xpToNext={xpToNextLevel} animated={false} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { label: 'QUESTS', value: questsCompleted,    color: '#00f5ff' },
          { label: 'TOTAL XP', value: gameState.totalXP, color: '#f5ff00' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#13131f', border: `2px solid ${color}40`, padding: '16px', boxShadow: '4px 4px 0px #000' }}>
            <p style={{ fontSize: '7px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', marginBottom: '10px', letterSpacing: '0.06em' }}>
              {label}
            </p>
            <span style={{ fontSize: '24px', fontFamily: '"Press Start 2P", monospace', color, lineHeight: 1, textShadow: `0 0 12px ${color}60` }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <PixelButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/quest')}
          style={{ fontSize: '12px', padding: '20px' }}
        >
          ▶ ROLL A QUEST
        </PixelButton>
        <p style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', textAlign: 'center', lineHeight: 2 }}>
          USES YOUR LOCATION
        </p>
      </div>

      {/* Recent adventures */}
      {recentQuests.length > 0 && (
        <div>
          <h2 style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', marginBottom: '12px', letterSpacing: '0.08em' }}>
            RECENT
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentQuests.map((q) => {
              const col = CATEGORY_COLOR[q.category] ?? '#9b5de5';
              return (
                <div key={q.id} style={{ background: '#13131f', border: '1px solid #2a2a3f', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '2px 2px 0px #000' }}>
                  {q.photoDataUrl ? (
                    <img src={q.photoDataUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', border: `1px solid ${col}`, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 40, height: 40, background: '#0d0d1a', border: `1px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>
                      {CATEGORY_EMOJI[q.category]}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#e8e8f0', lineHeight: 1.8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {q.title}
                    </p>
                  </div>
                  <span style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#f5ff00', flexShrink: 0 }}>+{q.xpReward}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recentQuests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '36px 20px', border: '2px dashed #2a2a3f', background: '#13131f' }}>
          <p style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', lineHeight: 2 }}>
            NO ADVENTURES YET
          </p>
          <p style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#2a2a3f', lineHeight: 2, marginTop: '8px' }}>
            ROLL YOUR FIRST QUEST
          </p>
        </div>
      )}
    </div>
  );
}
