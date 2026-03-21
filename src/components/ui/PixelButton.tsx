import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, { bg: string; color: string; shadow: string; border: string }> = {
  primary: {
    bg: '#f5ff00',
    color: '#0a0a0f',
    shadow: '4px 4px 0px #b8c000',
    border: '2px solid #b8c000',
  },
  secondary: {
    bg: '#9b5de5',
    color: '#ffffff',
    shadow: '4px 4px 0px #6b3db0',
    border: '2px solid #6b3db0',
  },
  ghost: {
    bg: '#13131f',
    color: '#e8e8f0',
    shadow: '4px 4px 0px #000000',
    border: '2px solid #2a2a3f',
  },
  danger: {
    bg: '#f72585',
    color: '#ffffff',
    shadow: '4px 4px 0px #b01060',
    border: '2px solid #b01060',
  },
};

const SIZES = {
  sm: { padding: '8px 16px',  fontSize: '8px'  },
  md: { padding: '12px 24px', fontSize: '9px'  },
  lg: { padding: '16px 32px', fontSize: '10px' },
};

export default function PixelButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  style,
  disabled,
  className = '',
  ...props
}: PixelButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];

  return (
    <button
      disabled={disabled}
      className={`pixel-btn-press ${className}`}
      style={{
        background: disabled ? '#1a1a2e' : v.bg,
        color: disabled ? '#3a3a5f' : v.color,
        boxShadow: disabled ? 'none' : v.shadow,
        border: disabled ? '2px solid #2a2a3f' : v.border,
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: '"Press Start 2P", monospace',
        fontWeight: 400,
        letterSpacing: '0.05em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        lineHeight: 1.6,
        userSelect: 'none',
        outline: 'none',
        borderRadius: '2px',
        imageRendering: 'pixelated',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
