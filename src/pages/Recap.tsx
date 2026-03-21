import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { captureAndShare } from '../lib/share';
import RecapCard from '../components/RecapCard';
import PixelButton from '../components/ui/PixelButton';

function getWeekLabel() {
  const now = new Date();
  const start = new Date(now); start.setDate(now.getDate() - now.getDay());
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}, ${now.getFullYear()}`;
}

export default function Recap() {
  const { weeklyQuests, gameState, level } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const weeklyXP = weeklyQuests.reduce((sum, q) => sum + q.xpReward, 0);

  async function handleShare() {
    if (!cardRef.current) return;
    setIsCapturing(true);
    try { await captureAndShare(cardRef.current); }
    catch { alert('Could not save image. Try a screenshot instead.'); }
    finally { setIsCapturing(false); }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '32px 20px 20px', gap: '20px', background: '#0a0a0f' }}>
      <div>
        <h1 style={{ fontSize: '14px', fontFamily: '"Press Start 2P", monospace', color: '#f5ff00', letterSpacing: '0.04em', lineHeight: 1.6, textShadow: '0 0 16px rgba(245,255,0,0.4)' }}>WEEKLY RECAP</h1>
        <p style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', fontWeight: 400, marginTop: '10px', letterSpacing: '0.05em', lineHeight: 1.8 }}>{getWeekLabel()}</p>
      </div>

      {weeklyQuests.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '52px 24px', border: '2px dashed #2a2a3f', background: '#13131f', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', lineHeight: 2 }}>NO QUESTS THIS WEEK</p>
          <p style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#2a2a3f', lineHeight: 2 }}>COMPLETE SOME ADVENTURES.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'THIS WEEK', value: `${weeklyQuests.length} QUESTS`, color: '#00f5ff' },
              { label: 'XP EARNED', value: `+${weeklyXP}`,                  color: '#f5ff00' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#13131f', border: `2px solid ${color}40`, padding: '14px 16px', boxShadow: '4px 4px 0px #000' }}>
                <div style={{ fontSize: '7px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', marginBottom: '8px', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: '12px', fontFamily: '"Press Start 2P", monospace', color, letterSpacing: '0.02em', lineHeight: 1.6 }}>{value}</div>
              </div>
            ))}
          </div>

          <div>
            <p style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', marginBottom: '12px', letterSpacing: '0.08em' }}>
              SHARE CARD
            </p>
            <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px' }}>
              <div style={{ transform: 'scale(0.86)', transformOrigin: 'top left', width: 'fit-content' }}>
                <RecapCard ref={cardRef} weeklyQuests={weeklyQuests} weeklyXP={weeklyXP} totalXP={gameState.totalXP} level={level} weekLabel={getWeekLabel()} />
              </div>
            </div>
          </div>

          <PixelButton variant="primary" size="lg" fullWidth onClick={handleShare} disabled={isCapturing}>
            {isCapturing ? 'SAVING...' : '▶ SAVE & SHARE'}
          </PixelButton>
          <p style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', textAlign: 'center', lineHeight: 2 }}>
            SAVES AS PNG
          </p>
        </>
      )}
    </div>
  );
}
