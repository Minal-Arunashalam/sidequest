import { getLevelTitle } from '../../lib/xp';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const title = getLevelTitle(level);
  const sizes = {
    sm: { outer: 52, numSize: '14px', titleSize: '6px' },
    md: { outer: 68, numSize: '20px', titleSize: '7px' },
    lg: { outer: 84, numSize: '26px', titleSize: '8px' },
  };
  const s = sizes[size];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div
        style={{
          width: s.outer,
          height: s.outer,
          background: '#13131f',
          border: '2px solid #9b5de5',
          boxShadow: '4px 4px 0px #6b3db0, 0 0 20px rgba(155,93,229,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          position: 'relative',
        }}
      >
        {/* Corner pixel decorations */}
        <div style={{ position: 'absolute', top: -2, left: -2, width: 6, height: 6, background: '#f5ff00' }} />
        <div style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, background: '#f5ff00' }} />
        <div style={{ position: 'absolute', bottom: -2, left: -2, width: 6, height: 6, background: '#f5ff00' }} />
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 6, height: 6, background: '#f5ff00' }} />
        <span style={{ fontSize: s.numSize, fontFamily: '"Press Start 2P", monospace', color: '#f5ff00', lineHeight: 1 }}>
          {level}
        </span>
        <span style={{ fontSize: '6px', fontFamily: '"Press Start 2P", monospace', color: '#9b5de5', letterSpacing: '0.05em' }}>
          LVL
        </span>
      </div>
      <span style={{
        fontSize: s.titleSize,
        fontFamily: '"Press Start 2P", monospace',
        color: '#00f5ff',
        letterSpacing: '0.03em',
        textAlign: 'center',
        lineHeight: 1.4,
      }}>
        {title}
      </span>
    </div>
  );
}
