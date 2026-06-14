import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/',          label: '🏠', full: 'Home' },
    { to: '/matches',   label: '⚽', full: 'Matches' },
    { to: '/standings', label: '📊', full: 'Standings' },
    { to: '/groups',    label: '👥', full: 'Groups' },
    { to: '/profile',   label: '👤', full: 'Profile' },
  ];

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* Top bar */}
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
      }}>
        <div className="rainbow-bar" />
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img src="/wc26-logo.png" alt="WC26" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
              <div>
                <div style={{ fontFamily: 'FWC2026', fontWeight: 900, fontSize: '17px', color: 'var(--text-1)', letterSpacing: '0.08em', lineHeight: 1.1 }}>
                  WC<span style={{ color: 'var(--gold)' }}>26</span>
                </div>
                <div style={{ fontFamily: 'FWC2026', fontSize: '9px', color: 'var(--teal)', letterSpacing: '0.25em', lineHeight: 1 }}>PREDICT</div>
              </div>
            </Link>

            {/* Desktop nav */}
            {user && (
              <div style={{ display: 'flex', gap: '2px' }} className="hidden md:flex">
                {navLinks.map(({ to, full }) => (
                  <Link key={to} to={to} style={{
                    fontFamily: 'FWC2026', fontWeight: 800, fontSize: '12px',
                    letterSpacing: '0.08em', padding: '6px 12px', borderRadius: '10px',
                    textDecoration: 'none', transition: 'all 0.15s',
                    background: isActive(to) ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
                    color: isActive(to) ? '#fff' : 'var(--text-2)',
                    boxShadow: isActive(to) ? '0 2px 12px rgba(124,58,237,0.3)' : 'none',
                  }}>{full}</Link>
                ))}
              </div>
            )}

            {/* Right: username chip (desktop) */}
            {user && (
              <div className="hidden md:flex" style={{ alignItems: 'center', gap: '8px' }}>
                <Link to="/profile" style={{
                  display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '5px 10px',
                }}>
                  <span style={{ fontFamily: 'FWC2026', fontSize: '12px', color: 'var(--gold)' }}>{user.username}</span>
                </Link>
              </div>
            )}

            {!user && (
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', fontSize: '12px', padding: '8px 16px' }}>
                JOIN NOW
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      {user && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '6px 0 calc(6px + env(safe-area-inset-bottom))',
        }} className="md:hidden">
          {navLinks.map(({ to, label, full }) => {
            const active = isActive(to);
            return (
              <Link key={to} to={to} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                textDecoration: 'none', padding: '4px 12px', borderRadius: '10px',
                background: active ? 'rgba(79,70,229,0.12)' : 'transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{label}</span>
                <span style={{
                  fontFamily: 'FWC2026', fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em',
                  color: active ? 'var(--purple)' : 'var(--text-3)',
                }}>{full.toUpperCase()}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom padding on mobile so content doesn't hide behind tab bar */}
      {user && <div className="md:hidden" style={{ height: '70px' }} />}
    </>
  );
}
