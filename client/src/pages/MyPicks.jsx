import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const FF = 'FWC2026';
const TXT = 'Inter, system-ui, sans-serif';

function toLocalDate(isoStr) {
  if (!isoStr) return 'invalid';
  const d = new Date(isoStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return 'invalid';
  return d.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
}

function formatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function toDateKey(isoStr) {
  if (!isoStr) return 'invalid';
  const d = new Date(isoStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return 'invalid';
  return d.toISOString().slice(0, 10);
}

function PointsBadge({ points }) {
  if (points === null || points === undefined) return null;
  const cfg = {
    3: { bg: 'rgba(245,158,11,0.12)', color: 'var(--gold)',   label: '⭐ 3 PTS' },
    1: { bg: 'rgba(99,102,241,0.12)', color: 'var(--purple)', label: '✓ 1 PT' },
    0: { bg: 'rgba(239,68,68,0.1)',   color: 'var(--red)',    label: '✗ 0 PTS' },
  };
  const s = cfg[points];
  if (!s) return null;
  return (
    <span style={{
      fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em',
      padding: '3px 10px', borderRadius: '99px', background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

export default function MyPicks() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming'); // 'upcoming' | 'history'

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/predictions/user/${user.id}`);
      const data = await res.json();
      setPredictions(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const now = Date.now();

  const upcoming = predictions.filter(p => p.status === 'upcoming');
  const history  = predictions.filter(p => p.status === 'live' || p.status === 'finished');

  const totalPts  = history.reduce((s, p) => s + (p.points || 0), 0);
  const exact     = history.filter(p => p.points === 3).length;
  const correct   = history.filter(p => p.points === 1).length;
  const wrong     = history.filter(p => p.points === 0).length;

  // Group by date
  function groupByDate(list) {
    return list.reduce((acc, p) => {
      const key = toDateKey(p.match_time || p.kickoff);
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});
  }

  const upcomingGrouped = groupByDate(upcoming);
  const historyGrouped  = groupByDate(history);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '12px' }}>
      <img src="/wc26-logo.png" alt="" style={{ height: '48px', width: '48px', objectFit: 'contain', animation: 'pulse 2s infinite' }} />
      <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)' }}>LOADING...</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Summary card */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <p style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)', margin: '0 0 10px' }}>MY PREDICTIONS</p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { val: totalPts, label: 'PTS',     color: 'var(--gold)' },
            { val: exact,    label: 'EXACT',   color: 'var(--gold)' },
            { val: correct,  label: 'CORRECT', color: 'var(--purple)' },
            { val: wrong,    label: 'WRONG',   color: 'var(--red)' },
            { val: upcoming.length, label: 'PENDING', color: 'var(--teal)' },
          ].map(({ val, label, color }) => (
            <div key={label} style={{ textAlign: 'center', minWidth: '52px' }}>
              <p style={{ fontFamily: FF, fontSize: '26px', fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{val}</p>
              <p style={{ fontFamily: FF, fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--text-3)', margin: '3px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[
          { key: 'upcoming', label: `UPCOMING (${upcoming.length})` },
          { key: 'history',  label: `HISTORY (${history.length})` },
        ].map(({ key, label }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '9px 4px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontFamily: FF, fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', transition: 'all 0.15s',
              background: active ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'var(--surface)',
              color: active ? '#fff' : 'var(--text-3)',
              boxShadow: active ? '0 2px 12px rgba(124,58,237,0.3)' : 'none',
              border: active ? 'none' : '1px solid var(--border)',
            }}>{label}</button>
          );
        })}
      </div>

      {/* Upcoming predictions */}
      {tab === 'upcoming' && (
        Object.keys(upcomingGrouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '40px', margin: '0 0 8px' }}>📋</p>
            <p style={{ fontFamily: FF, fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)' }}>NO UPCOMING PICKS</p>
          </div>
        ) : (
          Object.entries(upcomingGrouped).sort(([a],[b]) => a.localeCompare(b)).map(([dateKey, preds]) => (
            <div key={dateKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--teal)', whiteSpace: 'nowrap' }}>
                  {toLocalDate(preds[0].match_time || preds[0].kickoff)}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>
              {preds.map(p => (
                <div key={p.id} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: TXT, fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ truncate: true }}>{p.home_team}</span>
                        <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: '12px' }}>vs</span>
                        <span>{p.away_team}</span>
                      </div>
                      <div style={{ fontFamily: FF, fontSize: '11px', color: 'var(--text-3)', marginTop: '3px' }}>
                        {formatTime(p.match_time || p.kickoff)} · {p.competition?.split('·').pop()?.trim()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: FF, fontSize: '20px', fontWeight: 900, color: 'var(--purple)' }}>
                        {p.home_goals} – {p.away_goals}
                      </div>
                      <div style={{ fontFamily: FF, fontSize: '10px', color: 'var(--text-3)' }}>YOUR PICK</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )
      )}

      {/* History */}
      {tab === 'history' && (
        Object.keys(historyGrouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '40px', margin: '0 0 8px' }}>⏳</p>
            <p style={{ fontFamily: FF, fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)' }}>NO RESULTS YET</p>
          </div>
        ) : (
          Object.entries(historyGrouped).sort(([a],[b]) => b.localeCompare(a)).map(([dateKey, preds]) => (
            <div key={dateKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                  {toLocalDate(preds[0].match_time || preds[0].kickoff)}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>
              {preds.map(p => (
                <div key={p.id} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: TXT, fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>
                        {p.home_team} <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: '12px' }}>vs</span> {p.away_team}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontFamily: FF, fontSize: '10px', color: 'var(--text-3)' }}>RESULT </span>
                          <span style={{ fontFamily: FF, fontSize: '14px', fontWeight: 900, color: p.home_score !== null ? 'var(--text-1)' : 'var(--text-3)' }}>
                            {p.home_score !== null ? `${p.home_score} – ${p.away_score}` : '?'}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontFamily: FF, fontSize: '10px', color: 'var(--text-3)' }}>PICK </span>
                          <span style={{ fontFamily: FF, fontSize: '14px', fontWeight: 900, color: 'var(--purple)' }}>
                            {p.home_goals !== null && p.home_goals !== undefined ? `${p.home_goals} – ${p.away_goals}` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {p.home_goals !== null ? (
                        <PointsBadge points={p.points} />
                      ) : (
                        <span style={{ fontFamily: FF, fontSize: '11px', color: 'var(--text-3)' }}>No pick</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )
      )}
    </div>
  );
}
