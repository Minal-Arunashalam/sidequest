import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',       label: 'HOME',   icon: '⌂'  },
  { to: '/nearby', label: 'NEARBY', icon: '◉'  },
  { to: '/log',    label: 'LOG',    icon: '≡'  },
  { to: '/recap',  label: 'RECAP',  icon: '◈'  },
];

export default function NavBar() {
  return (
    <nav
      style={{
        background: '#0d0d1a',
        borderTop: '2px solid #2a2a3f',
        display: 'flex',
        justifyContent: 'space-around',
        flexShrink: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} end={to === '/'} style={{ flex: 1, textDecoration: 'none' }}>
          {({ isActive }) => (
            <div
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '14px 8px 16px', gap: '6px',
                borderTop: isActive ? '3px solid #f5ff00' : '3px solid transparent',
                marginTop: '-2px',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1, filter: isActive ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                {icon}
              </span>
              <span style={{
                fontSize: '7px',
                fontFamily: '"Press Start 2P", monospace',
                color: isActive ? '#f5ff00' : '#3a3a5f',
                letterSpacing: '0.05em',
              }}>
                {label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
