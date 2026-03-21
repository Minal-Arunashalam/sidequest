interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'FINDING QUEST...' }: LoadingSpinnerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '48px 24px' }}>
      <div
        className="animate-spin-pixel"
        style={{
          width: 48,
          height: 48,
          background: '#13131f',
          border: '3px solid #9b5de5',
          boxShadow: '4px 4px 0px #6b3db0, 0 0 20px rgba(155,93,229,0.4)',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 12, height: 12, background: '#f5ff00' }} />
      </div>
      <span style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#9b5de5', letterSpacing: '0.1em', textAlign: 'center', lineHeight: 2 }}>
        {message}
      </span>
    </div>
  );
}
