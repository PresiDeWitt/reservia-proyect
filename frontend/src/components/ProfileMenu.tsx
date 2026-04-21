import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) setTimeout(() => document.addEventListener('click', handler));
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 4px', borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      >
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name || 'Cuenta'}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: 16, opacity: 0.7 }}>expand_more</span>
      </button>

      {open && (
        <div className="scale-in" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 280, background: 'var(--surface-3)', color: 'var(--ink)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', boxShadow: 'var(--sh-lg)', zIndex: 200, overflow: 'hidden' }}>
          {/* Header with grain */}
          <div style={{ padding: '18px 20px', background: 'var(--navy)', color: 'var(--cream)', position: 'relative' }} className="grain">
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</div>
                <div style={{ fontSize: 11, opacity: 0.65 }}>{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div style={{ padding: 8 }}>
            {[
              { to: '/account', icon: 'person', label: 'Mi cuenta' },
              { to: '/my-bookings', icon: 'event', label: 'Mis reservas' },
              { to: '/favorites', icon: 'favorite', label: 'Favoritos' },
            ].map(item => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--r-md)', color: 'var(--ink)', textDecoration: 'none', transition: 'background 0.15s', fontSize: 13, fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-5)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

            <button onClick={() => { logout(); setOpen(false); navigate('/'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--r-md)', color: 'var(--ruby)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-5)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
