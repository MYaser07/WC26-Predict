import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const FF = 'FWC2026';
const TXT = 'Inter, system-ui, sans-serif';

const WC26_TEAMS = [
  '🇨🇿 Czechia','🇿🇦 South Africa','🇲🇽 Mexico','🇰🇷 South Korea',
  '🇨🇭 Switzerland','🇧🇦 Bosnia-Herzegovina','🇨🇦 Canada','🇶🇦 Qatar',
  '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland','🇲🇦 Morocco','🇧🇷 Brazil','🇭🇹 Haiti',
  '🇺🇸 USA','🇦🇺 Australia','🇹🇷 Türkiye','🇵🇾 Paraguay',
  '🇩🇪 Germany','🇨🇼 Curaçao','🇨🇮 Ivory Coast','🇪🇨 Ecuador',
  '🇳🇱 Netherlands','🇯🇵 Japan','🇸🇪 Sweden','🇹🇳 Tunisia',
  '🇧🇪 Belgium','🇪🇬 Egypt','🇮🇷 Iran','🇳🇿 New Zealand',
  '🇪🇸 Spain','🇨🇻 Cape Verde','🇸🇦 Saudi Arabia','🇺🇾 Uruguay',
  '🇫🇷 France','🇸🇳 Senegal','🇮🇶 Iraq','🇳🇴 Norway',
  '🇦🇷 Argentina','🇩🇿 Algeria','🇦🇹 Austria','🇯🇴 Jordan',
  '🇵🇹 Portugal','🇨🇩 DR Congo','🇺🇿 Uzbekistan','🇨🇴 Colombia',
  '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England','🇭🇷 Croatia','🇬🇭 Ghana','🇵🇦 Panama',
].sort((a, b) => a.replace(/[^\w\s]/g, '').trim().localeCompare(b.replace(/[^\w\s]/g, '').trim()));

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { dark, toggle } = useTheme();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]     = useState(user.username);
  const [nameError, setNameError]     = useState('');
  const [nameSaving, setNameSaving]   = useState(false);

  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [teamSearch, setTeamSearch]         = useState('');

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === user.username) { setEditingName(false); return; }
    setNameSaving(true); setNameError('');
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed, supportedTeam: user.supportedTeam }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      updateUser({ username: data.username });
      setEditingName(false);
    } catch (err) { setNameError(err.message); }
    finally { setNameSaving(false); }
  };

  const pickTeam = async (team) => {
    setShowTeamPicker(false);
    if (team === user.supportedTeam) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, supportedTeam: team }),
      });
      const data = await res.json();
      if (res.ok) updateUser({ supportedTeam: data.supportedTeam });
    } catch (e) { console.error(e); }
  };

  const filteredTeams = WC26_TEAMS.filter(t =>
    t.toLowerCase().includes(teamSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Avatar + name */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FF, fontSize: '28px', fontWeight: 900, color: '#fff', flexShrink: 0,
          }}>
            {user.username[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FF, fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: '2px' }}>USERNAME</div>
            {editingName ? (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  maxLength={20}
                  autoFocus
                  style={{
                    fontFamily: TXT, fontSize: '16px', fontWeight: 700, color: 'var(--text-1)',
                    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '4px 10px', flex: 1, minWidth: '100px',
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                />
                <button onClick={saveName} disabled={nameSaving} style={{
                  fontFamily: FF, fontSize: '11px', fontWeight: 900, padding: '4px 12px',
                  borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
                }}>SAVE</button>
                <button onClick={() => { setEditingName(false); setNameInput(user.username); }} style={{
                  fontFamily: FF, fontSize: '11px', fontWeight: 900, padding: '4px 10px',
                  borderRadius: '8px', cursor: 'pointer', background: 'var(--surface2)',
                  border: '1px solid var(--border)', color: 'var(--text-2)',
                }}>✕</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: TXT, fontSize: '18px', fontWeight: 700, color: 'var(--text-1)' }}>{user.username}</span>
                <button onClick={() => { setEditingName(true); setNameInput(user.username); }} style={{
                  fontFamily: FF, fontSize: '11px', fontWeight: 900, color: 'var(--purple)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>EDIT</button>
              </div>
            )}
            {nameError && <p style={{ fontFamily: FF, fontSize: '11px', color: 'var(--red)', margin: '3px 0 0' }}>{nameError}</p>}
          </div>
        </div>
      </div>

      {/* My team */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: FF, fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: '10px' }}>
          MY TEAM
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: TXT, fontSize: '16px', fontWeight: 600, color: 'var(--text-1)' }}>{user.supportedTeam}</span>
          <button onClick={() => setShowTeamPicker(true)} style={{
            fontFamily: FF, fontSize: '11px', fontWeight: 900, color: 'var(--purple)',
            background: 'none', border: 'none', cursor: 'pointer',
          }}>CHANGE</button>
        </div>
      </div>

      {/* Quick links */}
      <div className="card" style={{ padding: '4px 0' }}>
        {[
          { to: '/mypicks', label: '📋 My Predictions' },
          { to: '/leaderboard', label: '🏆 Leaderboard' },
          { to: '/groups', label: '👥 My Groups' },
        ].map(({ to, label }) => (
          <Link key={to} to={to} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', textDecoration: 'none',
            borderBottom: '1px solid var(--border)',
            fontFamily: TXT, fontSize: '14px', fontWeight: 600, color: 'var(--text-1)',
          }}>
            {label} <span style={{ color: 'var(--text-3)' }}>→</span>
          </Link>
        ))}
      </div>

      {/* Theme + Logout */}
      <div className="card" style={{ padding: '4px 0' }}>
        <button onClick={toggle} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: '1px solid var(--border)',
          fontFamily: TXT, fontSize: '14px', fontWeight: 600, color: 'var(--text-1)',
        }}>
          {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          <span style={{
            fontFamily: FF, fontSize: '10px', fontWeight: 900, color: dark ? 'var(--gold)' : 'var(--purple)',
            background: dark ? 'rgba(245,158,11,0.1)' : 'rgba(124,58,237,0.1)',
            padding: '2px 8px', borderRadius: '99px',
          }}>{dark ? 'DARK ON' : 'LIGHT ON'}</span>
        </button>
        <button onClick={logout} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: TXT, fontSize: '14px', fontWeight: 600, color: 'var(--red)',
        }}>
          Sign Out →
        </button>
      </div>

      {/* Team picker modal */}
      {showTeamPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm p-5" style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontFamily: FF, fontSize: '16px', fontWeight: 900, color: 'var(--text-1)', margin: 0 }}>PICK YOUR TEAM</h3>
              <button onClick={() => setShowTeamPicker(false)} style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <input
              placeholder="Search team..."
              value={teamSearch}
              onChange={e => setTeamSearch(e.target.value)}
              style={{
                fontFamily: TXT, fontSize: '14px', color: 'var(--text-1)',
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '8px 12px', marginBottom: '10px',
              }}
            />
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredTeams.map(team => (
                <button key={team} onClick={() => pickTeam(team)} style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
                  background: team === user.supportedTeam ? 'rgba(79,70,229,0.1)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontFamily: TXT, fontSize: '14px', fontWeight: team === user.supportedTeam ? 700 : 400,
                  color: team === user.supportedTeam ? 'var(--purple)' : 'var(--text-1)',
                }}>
                  {team} {team === user.supportedTeam && '✓'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
