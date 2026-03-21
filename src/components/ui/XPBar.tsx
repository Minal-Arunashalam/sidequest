interface XPBarProps {
  progress: number;
  totalXP: number;
  xpToNext: number;
  animated?: boolean;
}

export default function XPBar({ progress, totalXP, xpToNext, animated = true }: XPBarProps) {
  const pct = Math.min(Math.max(progress * 100, 0), 100);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#9b5de5' }}>
          {totalXP.toLocaleString()} XP
        </span>
        <span style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#00f5ff' }}>
          {xpToNext} to lvl
        </span>
      </div>

      <div style={{ width: '100%', height: '12px', background: '#0a0a0f', border: '2px solid #2a2a3f', borderRadius: '2px', overflow: 'hidden', padding: '2px' }}>
        <div
          className={animated ? 'animate-xp-fill' : ''}
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #9b5de5, #f5ff00)',
            borderRadius: '1px',
            transition: animated ? undefined : 'width 0.5s ease-out',
          }}
        />
      </div>
    </div>
  );
}
