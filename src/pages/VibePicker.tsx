import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from '../components/ui/PixelButton';

const MOODS = [
  { value: 'energized',  label: 'ENERGIZED',  emoji: '⚡' },
  { value: 'meh',        label: 'MEH',        emoji: '😐' },
  { value: 'burnt-out',  label: 'BURNT OUT',  emoji: '🫠' },
  { value: 'anxious',    label: 'ANXIOUS',    emoji: '😬' },
  { value: 'bored',      label: 'BORED',      emoji: '😴' },
];

const TIMES = [
  { value: '30min',  label: '30 MIN'  },
  { value: '1hour',  label: '1 HOUR'  },
  { value: '2hours', label: '2 HOURS' },
  { value: '3plus',  label: '3+ HOURS' },
];

const GOALS = [
  { value: 'socialize', label: 'SOCIALIZE',   emoji: '🤝' },
  { value: 'decompress', label: 'DECOMPRESS', emoji: '🧘' },
  { value: 'creative',  label: 'BE CREATIVE', emoji: '🎨' },
  { value: 'move',      label: 'GET MOVING',  emoji: '🏃' },
  { value: 'explore',   label: 'EXPLORE',     emoji: '🗺️' },
];

function Chip({
  label, emoji, selected, onClick,
}: { label: string; emoji?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 14px',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        border: selected ? '2px solid #f5ff00' : '2px solid #2a2a3f',
        background: selected ? 'rgba(245,255,0,0.12)' : '#13131f',
        color: selected ? '#f5ff00' : '#5555aa',
        boxShadow: selected ? '0 0 8px rgba(245,255,0,0.3)' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        lineHeight: 1.6,
        userSelect: 'none',
        transition: 'all 120ms ease-out',
      }}
    >
      {emoji && <span style={{ fontSize: '14px' }}>{emoji}</span>}
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', letterSpacing: '0.08em' }}>
        {title}
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {children}
      </div>
    </div>
  );
}

export default function VibePicker() {
  const navigate = useNavigate();
  const [mood, setMood] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [mystery, setMystery] = useState(false);

  function handleGenerate() {
    const params = new URLSearchParams();
    if (mood) params.set('mood', mood);
    if (time) params.set('time', time);
    if (goal) params.set('goal', goal);
    if (mystery) params.set('mystery', 'true');
    navigate(`/quest?${params.toString()}`);
  }

  const ready = mystery || (!!mood && !!time);

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '28px 20px 24px', gap: '28px', background: '#0a0a0f' }}>

      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', cursor: 'pointer', letterSpacing: '0.05em', marginBottom: '20px', display: 'block' }}
        >
          ← BACK
        </button>
        <h1 style={{ fontSize: '14px', fontFamily: '"Press Start 2P", monospace', color: '#f5ff00', letterSpacing: '0.04em', lineHeight: 1.6, textShadow: '0 0 16px rgba(245,255,0,0.4)' }}>
          VIBE CHECK
        </h1>
        <p style={{ fontSize: '9px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', marginTop: '10px', lineHeight: 2, letterSpacing: '0.04em' }}>
          TELL US YOUR SITUATION
        </p>
      </div>

      {/* Mood */}
      <Section title="HOW U FEELING?">
        {MOODS.map(m => (
          <Chip key={m.value} label={m.label} emoji={m.emoji} selected={mood === m.value} onClick={() => setMood(mood === m.value ? null : m.value)} />
        ))}
      </Section>

      {/* Time */}
      <Section title="HOW MUCH TIME?">
        {TIMES.map(t => (
          <Chip key={t.value} label={t.label} selected={time === t.value} onClick={() => setTime(time === t.value ? null : t.value)} />
        ))}
      </Section>

      {/* Goal */}
      <Section title="WHAT U AFTER? (OPTIONAL)">
        {GOALS.map(g => (
          <Chip key={g.value} label={g.label} emoji={g.emoji} selected={goal === g.value} onClick={() => setGoal(goal === g.value ? null : g.value)} />
        ))}
      </Section>

      {/* Mystery mode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', letterSpacing: '0.08em' }}>
          MODE
        </span>
        <button
          onClick={() => setMystery(m => !m)}
          style={{
            padding: '12px 16px',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            border: mystery ? '2px solid #9b5de5' : '2px solid #2a2a3f',
            background: mystery ? 'rgba(155,93,229,0.12)' : '#13131f',
            color: mystery ? '#9b5de5' : '#5555aa',
            boxShadow: mystery ? '0 0 8px rgba(155,93,229,0.3)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            userSelect: 'none',
            transition: 'all 120ms ease-out',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '16px' }}>🔍</span>
          <div style={{ textAlign: 'left' }}>
            <div>MYSTERY MODE {mystery ? '[ ON ]' : '[ OFF ]'}</div>
            <div style={{ fontSize: '7px', color: mystery ? '#7a3db5' : '#3a3a5f', marginTop: '6px', lineHeight: 1.8 }}>
              CLUES REVEALED ONE AT A TIME
            </div>
          </div>
        </button>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <PixelButton variant="primary" size="lg" fullWidth disabled={!ready} onClick={handleGenerate}>
          GENERATE QUEST ▶
        </PixelButton>
        {!ready && (
          <p style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', textAlign: 'center', lineHeight: 2 }}>
            PICK A MOOD + TIME TO CONTINUE
          </p>
        )}
      </div>
    </div>
  );
}
