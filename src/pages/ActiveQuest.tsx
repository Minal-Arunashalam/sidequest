import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { compressImage } from '../lib/share';
import QuestCard from '../components/QuestCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PixelButton from '../components/ui/PixelButton';
import Modal from '../components/ui/Modal';

type PageMode = 'generating' | 'preview' | 'active' | 'error';

export default function ActiveQuest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeQuest, pendingQuest, isLoading, status: genStatus, error: genError, generate, reset, addQuest, completeQuest, clearActiveQuest, getLocation, location, locationLabel, recentTitles, recentCategories, addXP, incrementQuestsCompleted, gameState } = useApp();

  const [mode, setMode] = useState<PageMode>('generating');
  const [localError, setLocalError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isRerolling, setIsRerolling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasGenerated = useRef(false);

  useEffect(() => {
    if (searchParams.get('mode') === 'active' && activeQuest) { setMode('active'); return; }
    if (!hasGenerated.current) { hasGenerated.current = true; doGenerate(); }
  }, []);

  const vibeContext = (() => {
    const mood = searchParams.get('mood');
    const time = searchParams.get('time');
    const goal = searchParams.get('goal');
    if (!mood && !time) return undefined;
    return { mood: mood ?? '', time: time ?? '', goal: goal ?? undefined };
  })();

  async function doGenerate() {
    setMode('generating');
    setLocalError(null);
    try {
      const geo = location ? { location, locationLabel } : await getLocation();
      await generate(geo.location.lat, geo.location.lng, geo.locationLabel, recentTitles, recentCategories, vibeContext);
      setMode('preview');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLocalError(msg);
      setMode('error');
    }
  }

  async function handleReroll() {
    setIsRerolling(true); reset(); setLocalError(null);
    try {
      const geo = location ? { location, locationLabel } : await getLocation();
      await generate(geo.location.lat, geo.location.lng, geo.locationLabel, recentTitles, recentCategories, vibeContext);
      setMode('preview');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLocalError(msg);
      setMode('error');
    }
    finally { setIsRerolling(false); }
  }

  function handleAccept() {
    if (!pendingQuest) return;
    addQuest({ ...pendingQuest, status: 'active' as const });
    setMode('active');
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setPhoto(await compressImage(file, 800)); }
    catch { alert('Failed to process photo. Please try again.'); }
  }

  async function handleSubmit() {
    if (!activeQuest || !photo) return;
    setIsSubmitting(true);
    setEarnedXP(activeQuest.xpReward);
    completeQuest(activeQuest.id, photo, activeQuest.xpReward, addXP, incrementQuestsCompleted);
    setIsSubmitting(false);
    setShowXPModal(true);
  }

  function handleModalClose() { setShowXPModal(false); reset(); navigate('/'); }

  if (mode === 'generating' || isLoading) {
    return (
      <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (mode === 'error' || genStatus === 'error') {
    const errorMsg = localError || genError;
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: '24px', background: '#0a0a0f' }}>
        <h2 style={{ fontSize: '14px', fontFamily: '"Press Start 2P", monospace', color: '#f72585', letterSpacing: '0.03em', textAlign: 'center', lineHeight: 2 }}>ERROR!</h2>
        {errorMsg && (
          <div style={{ background: '#13131f', border: '2px solid #f72585', padding: '14px 16px', width: '100%', maxWidth: '320px', boxShadow: '4px 4px 0px #000' }}>
            <p style={{ fontSize: '10px', fontFamily: '"Press Start 2P", monospace', color: '#f72585', lineHeight: 2, wordBreak: 'break-word' }}>{errorMsg}</p>
          </div>
        )}
        <PixelButton variant="primary" onClick={doGenerate}>TRY AGAIN</PixelButton>
        <PixelButton variant="ghost" onClick={() => navigate('/')}>GO HOME</PixelButton>
      </div>
    );
  }

  if (mode === 'preview' && pendingQuest) {
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '24px 20px', gap: '16px', background: '#0a0a0f' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: '10px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', cursor: 'pointer', letterSpacing: '0.05em' }}>
            ← BACK
          </button>
          <span style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', letterSpacing: '0.06em' }}>NEW QUEST</span>
        </div>
        <QuestCard quest={pendingQuest} onAccept={handleAccept} onReroll={handleReroll} isRerolling={isRerolling} />
      </div>
    );
  }

  if (mode === 'active' && activeQuest) {
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '24px 20px', gap: '20px', background: '#0a0a0f' }}>

        {/* Status badge + title */}
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', border: '1px solid #00f5ff', fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#00f5ff', marginBottom: '14px', background: 'rgba(0,245,255,0.08)', letterSpacing: '0.06em' }}>
            ▶ ACTIVE
          </span>
          <h2 style={{ fontSize: '13px', fontFamily: '"Press Start 2P", monospace', color: '#e8e8f0', lineHeight: 1.9, letterSpacing: '0.02em' }}>
            {activeQuest.title}
          </h2>
        </div>

        <p style={{ fontSize: '13px', fontFamily: '"Inter", sans-serif', color: '#8888aa', lineHeight: 1.7 }}>{activeQuest.description}</p>

        {/* Reward + location */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ background: '#13131f', border: '2px solid #f5ff00', padding: '14px 16px', boxShadow: '4px 4px 0px #b8c000' }}>
            <div style={{ fontSize: '7px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', marginBottom: '6px', letterSpacing: '0.06em' }}>REWARD</div>
            <div style={{ fontSize: '16px', fontFamily: '"Press Start 2P", monospace', color: '#f5ff00', textShadow: '0 0 10px rgba(245,255,0,0.5)' }}>+{activeQuest.xpReward} XP</div>
          </div>
          {activeQuest.locationLabel && (
            <div style={{ background: '#13131f', border: '2px solid #2a2a3f', padding: '14px 16px', flex: 1, boxShadow: '4px 4px 0px #000' }}>
              <div style={{ fontSize: '7px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', marginBottom: '6px', letterSpacing: '0.06em' }}>LOCATION</div>
              <div style={{ fontSize: '10px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', lineHeight: 1.8 }}>{activeQuest.locationLabel}</div>
            </div>
          )}
        </div>

        {/* Photo upload */}
        <div style={{ background: '#13131f', border: '2px solid #2a2a3f', padding: '20px', boxShadow: '4px 4px 0px #000' }}>
          <h3 style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#e8e8f0', marginBottom: '8px', letterSpacing: '0.06em' }}>SUBMIT PROOF</h3>
          <p style={{ fontSize: '10px', fontFamily: '"Inter", sans-serif', color: '#5555aa', marginBottom: '16px', lineHeight: 1.6 }}>
            Snap a photo to confirm your adventure.
          </p>

          {photo ? (
            <div style={{ position: 'relative', border: '2px solid #9b5de5' }}>
              <img src={photo} alt="Quest proof" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }} />
              <button onClick={() => setPhoto(null)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(10,10,15,0.9)', border: '1px solid #f72585', color: '#f72585', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer', fontFamily: '"Press Start 2P", monospace' }}>✕</button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ width: '100%', height: '130px', border: '2px dashed #2a2a3f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', background: '#0d0d1a' }}
            >
              <span style={{ fontSize: '28px' }}>📷</span>
              <span style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', letterSpacing: '0.05em' }}>TAP TO ADD PHOTO</span>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: 'none' }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PixelButton variant="primary" size="lg" fullWidth disabled={!photo || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'SUBMITTING...' : '✓ COMPLETE QUEST'}
          </PixelButton>
          <PixelButton variant="danger" size="sm" fullWidth onClick={() => { if (confirm('Abandon this quest?')) { clearActiveQuest(); reset(); navigate('/'); } }}>
            ✕ ABANDON
          </PixelButton>
        </div>

        {/* XP Modal */}
        <Modal open={showXPModal} onClose={handleModalClose}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px' }}>⭐</div>
            <div>
              <div style={{ fontSize: '12px', fontFamily: '"Press Start 2P", monospace', color: '#e8e8f0', marginBottom: '16px', lineHeight: 2, letterSpacing: '0.03em' }}>QUEST COMPLETE!</div>
              <div className="animate-float-up" style={{ fontSize: '20px', fontFamily: '"Press Start 2P", monospace', color: '#f5ff00', textShadow: '0 0 20px rgba(245,255,0,0.6)', letterSpacing: '0.03em' }}>
                +{earnedXP} XP
              </div>
            </div>
            {(gameState.currentStreak ?? 0) > 0 && (
              <p style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#f72585', lineHeight: 2 }}>
                🔥 {gameState.currentStreak} DAY STREAK
              </p>
            )}
            <p style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', lineHeight: 2 }}>ADVENTURE LOGGED.</p>
            <PixelButton variant="primary" size="md" onClick={handleModalClose} fullWidth>
              CONTINUE ▶
            </PixelButton>
          </div>
        </Modal>
      </div>
    );
  }

  navigate('/');
  return null;
}
