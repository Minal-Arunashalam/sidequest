import type { Quest } from '../types';
import { CATEGORY_EMOJI, CATEGORY_COLOR } from '../types';
import PixelButton from './ui/PixelButton';

const DIFF: Record<number, { label: string; color: string }> = {
  1: { label: 'EASY',   color: '#00f5ff' },
  2: { label: 'MEDIUM', color: '#f5ff00' },
  3: { label: 'HARD',   color: '#f72585' },
};

interface QuestCardProps {
  quest: Quest;
  onAccept: () => void;
  onReroll: () => void;
  isRerolling?: boolean;
}

export default function QuestCard({ quest, onAccept, onReroll, isRerolling }: QuestCardProps) {
  const catColor = CATEGORY_COLOR[quest.category] ?? '#9b5de5';
  const diff = DIFF[quest.difficulty];

  return (
    <div
      className="animate-slide-up"
      style={{
        background: '#13131f',
        border: '2px solid #2a2a3f',
        boxShadow: '6px 6px 0px #000000',
      }}
    >
      {/* Top color bar */}
      <div style={{ height: '4px', background: catColor }} />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Category + difficulty row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', border: `1px solid ${catColor}`,
              fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: catColor,
              background: `${catColor}18`,
            }}>
              {CATEGORY_EMOJI[quest.category]} {quest.category.toUpperCase()}
            </span>
            {diff && (
              <span style={{
                padding: '4px 10px', border: `1px solid ${diff.color}`,
                fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: diff.color,
                background: `${diff.color}18`,
              }}>
                {diff.label}
              </span>
            )}
          </div>
          <span style={{
            padding: '5px 12px',
            border: '2px solid #f5ff00',
            fontSize: '9px', fontFamily: '"Press Start 2P", monospace',
            color: '#f5ff00',
            background: 'rgba(245,255,0,0.1)',
            boxShadow: '2px 2px 0px #b8c000',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }}>
            +{quest.xpReward} XP
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '14px', fontFamily: '"Press Start 2P", monospace', color: '#e8e8f0', lineHeight: 1.8, letterSpacing: '0.02em' }}>
          {quest.title}
        </h2>

        {/* Description */}
        {quest.isMystery ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', border: '1px dashed #9b5de5', background: 'rgba(155,93,229,0.08)' }}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            <span style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#9b5de5', lineHeight: 2, letterSpacing: '0.04em' }}>
              CLUES REVEALED ONE AT A TIME
            </span>
          </div>
        ) : (
          <p style={{ fontSize: '13px', fontFamily: '"Inter", sans-serif', color: '#8888aa', lineHeight: 1.7 }}>
            {quest.description}
          </p>
        )}

        {/* Location */}
        {quest.locationLabel && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid #2a2a3f', background: '#0d0d1a', alignSelf: 'flex-start' }}>
            <span style={{ fontSize: '12px' }}>◎</span>
            <span style={{ fontSize: '10px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa' }}>{quest.locationLabel}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <PixelButton variant="ghost" size="md" onClick={onReroll} disabled={isRerolling} style={{ flex: 1 }}>
            {isRerolling ? '...' : '↺ REROLL'}
          </PixelButton>
          <PixelButton variant="primary" size="md" onClick={onAccept} style={{ flex: 2 }}>
            ACCEPT ▶
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
