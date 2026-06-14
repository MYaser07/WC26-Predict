import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/',            label: 'Matches' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/groups',      label: 'Groups' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
    }}>
      <div className="rainbow-bar" />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/wc26-logo.png" alt="WC26" style={{ height: '34px', width: '34px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontFamily: 'FWC2026', fontWeight: 900, fontSize: '18px', color: 'var(--text-1)', letterSpacing: '0.08em', lineHeight: 1.1 }}>
                WC<span style={{ color: 'var(--gold)' }}>26</span>
              </div>
              <div style={{ fontFamily: 'FWC2026', fontSize: '9px', color: 'var(--teal)', letterSpacing: '0.25em', lineHeight: 1 }}>PREDICT</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div style={{ display: 'flex', gap: '4px' }} className="hidden md:flex">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} style={{
                  fontFamily: 'FWC2026', fontWeight: 800, fontSize: '13px',
                  letterSpacing: '0.08em', padding: '6px 14px', borderRadius: '10px',
                  textDecoration: 'none', transition: 'all 0.15s',
                  background: isActive(to) ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
                  color: isActive(to) ? '#fff' : 'var(--text-2)',
                  boxShadow: isActive(to) ? '0 2px 12px rgba(124,58,237,0.3)' : 'none',
                }}>
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme toggle */}
            <button
              onClick={toggle}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'var(--surface2)', border: '1px solid var(--border)',
                cursor: 'pointer', fontSize: '16px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? '☀️' : '🌙'}
            </button>

            {user ? (
              <>
                <div className="hidden md:flex" style={{
                  alignItems: 'center', gap: '8px',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '6px 12px',
                }}>
                  <span style={{ fontFamily: 'FWC2026', fontSize: '13px', color: 'var(--text-2)' }}>{user.supportedTeam}</span>
                  <span style={{ fontFamily: 'FWC2026', fontWeight: 900, fontSize: '13px', color: 'var(--gold)' }}>{user.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="hidden md:block"
                  style={{ fontFamily: 'FWC2026', fontSize: '12px', color: 'var(--text-3)', letterSpacing: '0.1em', cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  SIGN OUT
                </button>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden"
                  style={{ fontFamily: 'FWC2026', fontSize: '20px', color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {menuOpen ? '✕' : '☰'}
                </button>
              </>
            ) : (
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', fontSize: '12px', padding: '8px 16px' }}>
                JOIN NOW
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {user && menuOpen && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 4px', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'FWC2026', fontSize: '13px', color: 'var(--text-2)' }}>{user.supportedTeam}</span>
              <span style={{ fontFamily: 'FWC2026', fontWeight: 900, fontSize: '13px', color: 'var(--gold)' }}>{user.username}</span>
            </div>
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
                fontFamily: 'FWC2026', fontWeight: 800, fontSize: '14px', letterSpacing: '0.08em',
                padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
                background: isActive(to) ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
                color: isActive(to) ? '#fff' : 'var(--text-2)',
              }}>
                {label}
              </Link>
            ))}
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              style={{ fontFamily: 'FWC2026', fontSize: '13px', color: 'var(--red)', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em' }}
            >
              SIGN OUT
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
