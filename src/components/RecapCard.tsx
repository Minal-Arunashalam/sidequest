import { forwardRef } from 'react';
import type { Quest } from '../types';
import { CATEGORY_EMOJI, CATEGORY_COLOR } from '../types';

interface RecapCardProps {
  weeklyQuests: Quest[];
  weeklyXP: number;
  totalXP: number;
  level: number;
  weekLabel: string;
}

const RecapCard = forwardRef<HTMLDivElement, RecapCardProps>(
  ({ weeklyQuests, weeklyXP, totalXP, level, weekLabel }, ref) => {
    const bestQuest = weeklyQuests.filter(q => q.photoDataUrl).sort((a, b) => b.xpReward - a.xpReward)[0];
    const catBreakdown = weeklyQuests.reduce<Record<string, number>>((acc, q) => {
      acc[q.category] = (acc[q.category] ?? 0) + 1;
      return acc;
    }, {});
    const topCat = Object.entries(catBreakdown).sort((a, b) => b[1] - a[1])[0];

    return (
      <div ref={ref} style={{
        width: '390px', height: '844px',
        background: '#0a0a0f',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        fontFamily: '"Press Start 2P", monospace', flexShrink: 0,
        border: '2px solid #2a2a3f',
      }}>
        {/* Scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        }} />

        {/* Neon top border */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #9b5de5, #f72585, #f5ff00, #00f5ff)', flexShrink: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, padding: '36px 28px 28px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '16px', color: '#f5ff00', letterSpacing: '0.05em', lineHeight: 1, textShadow: '0 0 12px rgba(245,255,0,0.6)' }}>SIDEQUEST</div>
              <div style={{ fontSize: '8px', color: '#5555aa', marginTop: '8px', letterSpacing: '0.05em' }}>{weekLabel}</div>
            </div>
            <div style={{
              width: 60, height: 60,
              background: '#13131f',
              border: '2px solid #9b5de5',
              boxShadow: '4px 4px 0px #6b3db0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: -2, left: -2, width: 5, height: 5, background: '#f5ff00' }} />
              <div style={{ position: 'absolute', top: -2, right: -2, width: 5, height: 5, background: '#f5ff00' }} />
              <div style={{ position: 'absolute', bottom: -2, left: -2, width: 5, height: 5, background: '#f5ff00' }} />
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 5, height: 5, background: '#f5ff00' }} />
              <span style={{ fontSize: '18px', color: '#f5ff00', lineHeight: 1 }}>{level}</span>
              <span style={{ fontSize: '7px', color: '#9b5de5' }}>LVL</span>
            </div>
          </div>

          {/* Headline */}
          <div style={{ fontSize: '13px', color: '#e8e8f0', lineHeight: 2, letterSpacing: '0.02em', marginBottom: '20px' }}>
            {weeklyQuests.length} QUEST{weeklyQuests.length !== 1 ? 'S' : ''} THIS WEEK
          </div>

          {/* Best photo */}
          {bestQuest?.photoDataUrl ? (
            <div style={{ width: '100%', height: '200px', border: '2px solid #2a2a3f', overflow: 'hidden', marginBottom: '18px', position: 'relative', boxShadow: '4px 4px 0px #000' }}>
              <img src={bestQuest.photoDataUrl} alt="Best quest" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 14px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
                <div style={{ fontSize: '7px', color: '#f5ff00', marginBottom: '4px', letterSpacing: '0.06em' }}>TOP QUEST</div>
                <div style={{ fontSize: '9px', color: '#e8e8f0', lineHeight: 1.6 }}>{bestQuest.title}</div>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '140px', border: '2px solid #2a2a3f', background: '#13131f', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '8px', color: '#3a3a5f' }}>NO PHOTOS YET</span>
            </div>
          )}

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'QUESTS',    value: String(weeklyQuests.length), color: '#00f5ff' },
              { label: 'XP EARNED', value: `+${weeklyXP}`,             color: '#f5ff00' },
              { label: 'TOTAL XP',  value: totalXP.toLocaleString(),   color: '#9b5de5' },
              { label: 'TOP TYPE',  value: topCat ? `${CATEGORY_EMOJI[topCat[0] as keyof typeof CATEGORY_EMOJI]} ${topCat[0].toUpperCase()}` : '—', color: topCat ? CATEGORY_COLOR[topCat[0] as keyof typeof CATEGORY_COLOR] : '#5555aa' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#13131f', border: `1px solid ${color}40`, padding: '12px', boxShadow: '2px 2px 0px #000' }}>
                <div style={{ fontSize: '7px', color: '#5555aa', marginBottom: '6px', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: '13px', color, letterSpacing: '0.02em', lineHeight: 1.4 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Category tags */}
          {Object.keys(catBreakdown).length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.entries(catBreakdown).map(([cat, count]) => {
                const col = CATEGORY_COLOR[cat as keyof typeof CATEGORY_COLOR] ?? '#9b5de5';
                return (
                  <span key={cat} style={{ padding: '4px 10px', border: `1px solid ${col}`, fontSize: '7px', color: col, letterSpacing: '0.03em' }}>
                    {CATEGORY_EMOJI[cat as keyof typeof CATEGORY_EMOJI]} ×{count}
                  </span>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a3f' }}>
            <span style={{ fontSize: '7px', color: '#3a3a5f' }}>SIDEQUEST.APP</span>
            <span style={{ fontSize: '7px', color: '#3a3a5f' }}>LIVE THE QUEST</span>
          </div>
        </div>
      </div>
    );
  }
);
RecapCard.displayName = 'RecapCard';
export default RecapCard;
