import { type ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={onClose}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)' }} />
      <div
        className="animate-bounce-in"
        style={{
          position: 'relative', zIndex: 1,
          background: '#13131f',
          border: '3px solid #9b5de5',
          boxShadow: '8px 8px 0px #6b3db0, 0 0 40px rgba(155,93,229,0.3)',
          width: '100%', maxWidth: '360px',
          padding: '36px 28px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
