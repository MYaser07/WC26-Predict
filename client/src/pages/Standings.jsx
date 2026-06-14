import React, { useState, useEffect } from 'react';

const FF = 'FWC2026';
const TXT = 'Inter, system-ui, sans-serif';

function stripFlag(name) {
  return name.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
}

function getFlag(name) {
  const stripped = stripFlag(name);
  return name.replace(stripped, '').trim();
}

export default function Standings() {
  const [groups, setGroups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openGroups, setOpenGroups] = useState({ A: true, B: true });

  useEffect(() => {
    fetch('/api/standings')
      .then(r => r.json())
      .then(data => { setGroups(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggleGroup = (letter) => {
    setOpenGroups(prev => ({ ...prev, [letter]: !prev[letter] }));
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '12px' }}>
      <img src="/wc26-logo.png" alt="" style={{ height: '48px', objectFit: 'contain', animation: 'pulse 2s infinite' }} />
      <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)' }}>LOADING...</span>
    </div>
  );

  if (!groups || Object.keys(groups).length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <p style={{ fontSize: '40px', margin: '0 0 8px' }}>📊</p>
      <p style={{ fontFamily: FF, fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)' }}>STANDINGS NOT AVAILABLE</p>
    </div>
  );

  const letters = Object.keys(groups).sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ marginBottom: '4px' }}>
        <p style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)', margin: 0 }}>
          TOP 2 IN EACH GROUP ADVANCE
        </p>
      </div>

      {letters.map(letter => {
        const teams = groups[letter];
        const isOpen = !!openGroups[letter];
        return (
          <div key={letter} className="card" style={{ overflow: 'hidden' }}>
            {/* Group header */}
            <button
              onClick={() => toggleGroup(letter)}
              style={{
                width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: FF, fontSize: '18px', fontWeight: 900, color: 'var(--gold)' }}>
                  GROUP {letter}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {teams.map(t => (
                    <span key={t.name} style={{ fontSize: '16px' }}>{getFlag(t.name)}</span>
                  ))}
                </div>
              </div>
              <span style={{ fontFamily: FF, fontSize: '14px', color: 'var(--text-3)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▼</span>
            </button>

            {/* Standings table */}
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--border)' }}>
                {/* Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 28px 28px 28px 28px 36px 36px 36px 36px',
                  padding: '6px 16px', gap: '2px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--surface2)',
                }}>
                  {['TEAM','P','W','D','L','GF','GA','GD','PTS'].map((col, i) => (
                    <div key={col} style={{
                      fontFamily: FF, fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em',
                      color: col === 'PTS' ? 'var(--gold)' : 'var(--text-3)',
                      textAlign: i === 0 ? 'left' : 'center',
                    }}>{col}</div>
                  ))}
                </div>
                {/* Rows */}
                {teams.map((team, idx) => {
                  const qualify = idx < 2;
                  const teamName = stripFlag(team.name);
                  const flag = getFlag(team.name);
                  return (
                    <div key={team.name} style={{
                      display: 'grid', gridTemplateColumns: '1fr 28px 28px 28px 28px 36px 36px 36px 36px',
                      padding: '10px 16px', gap: '2px', alignItems: 'center',
                      background: qualify ? 'rgba(79,70,229,0.06)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                      borderLeft: qualify ? '3px solid #4f46e5' : '3px solid transparent',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{flag}</span>
                        <span style={{
                          fontFamily: TXT, fontSize: '13px', fontWeight: qualify ? 700 : 500,
                          color: qualify ? 'var(--text-1)' : 'var(--text-2)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{teamName}</span>
                      </div>
                      {[team.P, team.W, team.D, team.L, team.GF, team.GA, team.GD, team.Pts].map((val, i) => (
                        <div key={i} style={{
                          fontFamily: FF, fontSize: '13px', fontWeight: i === 7 ? 900 : 500,
                          color: i === 7 ? 'var(--gold)' : 'var(--text-2)', textAlign: 'center',
                        }}>{val}</div>
                      ))}
                    </div>
                  );
                })}
                {/* Qualify legend */}
                <div style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#4f46e5', opacity: 0.7 }} />
                  <span style={{ fontFamily: FF, fontSize: '10px', color: 'var(--text-3)' }}>QUALIFIED FOR ROUND OF 32</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
