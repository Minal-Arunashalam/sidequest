import type { Quest } from '../types';
import { CATEGORY_EMOJI, CATEGORY_COLOR } from '../types';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function QuestLogItem({ quest }: { quest: Quest }) {
  const catColor = CATEGORY_COLOR[quest.category] ?? '#9b5de5';

  return (
    <div style={{
      background: '#13131f',
      border: '2px solid #2a2a3f',
      boxShadow: '4px 4px 0px #000000',
      overflow: 'hidden',
    }}>
      {quest.photoDataUrl && (
        <div style={{ position: 'relative', width: '100%', paddingTop: '50%' }}>
          <img src={quest.photoDataUrl} alt="Quest proof"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(10,10,15,0.9)',
            border: '1px solid #f5ff00',
            padding: '4px 10px',
          }}>
            <span style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#f5ff00' }}>+{quest.xpReward} XP</span>
          </div>
        </div>
      )}

      {/* Left color bar */}
      <div style={{ display: 'flex' }}>
        <div style={{ width: '3px', background: catColor, flexShrink: 0 }} />
        <div style={{ padding: '14px 16px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 8px', border: `1px solid ${catColor}`,
              fontSize: '7px', fontFamily: '"Press Start 2P", monospace', color: catColor,
            }}>
              {CATEGORY_EMOJI[quest.category]} {quest.category.toUpperCase()}
            </span>
            {!quest.photoDataUrl && (
              <span style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#f5ff00' }}>+{quest.xpReward} XP</span>
            )}
          </div>

          <h3 style={{ fontSize: '11px', fontFamily: '"Press Start 2P", monospace', color: '#e8e8f0', lineHeight: 1.8, marginBottom: '10px' }}>
            {quest.title}
          </h3>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {quest.completedAt && (
              <span style={{ fontSize: '10px', fontFamily: '"Inter", sans-serif', color: '#3a3a5f' }}>
                {formatDate(quest.completedAt)}
              </span>
            )}
            {quest.locationLabel && (
              <span style={{ fontSize: '10px', fontFamily: '"Inter", sans-serif', color: '#3a3a5f' }}>
                ◎ {quest.locationLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
