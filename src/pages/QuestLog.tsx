import { useApp } from '../context/AppContext';
import QuestLogItem from '../components/QuestLogItem';

export default function QuestLog() {
  const { completedQuests } = useApp();

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '32px 20px 20px', gap: '20px', background: '#0a0a0f' }}>
      <div>
        <h1 style={{ fontSize: '16px', fontFamily: '"Press Start 2P", monospace', color: '#f5ff00', letterSpacing: '0.04em', lineHeight: 1.6, textShadow: '0 0 16px rgba(245,255,0,0.4)' }}>
          ADVENTURE LOG
        </h1>
        <p style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#5555aa', fontWeight: 400, marginTop: '10px', letterSpacing: '0.05em', lineHeight: 1.8 }}>
          {completedQuests.length} QUEST{completedQuests.length !== 1 ? 'S' : ''} COMPLETED
        </p>
      </div>

      {completedQuests.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '52px 24px', border: '2px dashed #2a2a3f', background: '#13131f', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontFamily: '"Press Start 2P", monospace', color: '#3a3a5f', lineHeight: 2 }}>YOUR LOG IS EMPTY</p>
          <p style={{ fontSize: '8px', fontFamily: '"Press Start 2P", monospace', color: '#2a2a3f', lineHeight: 2 }}>COMPLETE A QUEST TO BEGIN.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {completedQuests.map((quest) => (
            <QuestLogItem key={quest.id} quest={quest} />
          ))}
        </div>
      )}
    </div>
  );
}
