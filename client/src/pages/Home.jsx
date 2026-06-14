import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';

const FF = 'FWC2026';

const FILTERS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'live',     label: 'Live' },
  { key: 'finished', label: 'Finished' },
  { key: 'all',      label: 'All' },
];

export default function Home() {
  const { user } = useAuth();
  const [matches, setMatches]         = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('upcoming');

  const fetchData = useCallback(async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        fetch('/api/matches'),
        fetch(`/api/predictions/user/${user.id}`),
      ]);
      const mData = await mRes.json();
      const pData = await pRes.json();
      setMatches(Array.isArray(mData) ? mData : []);
      const map = {};
      if (Array.isArray(pData)) pData.forEach(p => { map[p.match_id] = p; });
      setPredictions(map);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaved = (saved) => {
    setPredictions(prev => ({
      ...prev,
      [saved.matchId || saved.match_id]: {
        ...prev[saved.matchId || saved.match_id],
        ...saved,
        home_goals: saved.homeGoals ?? saved.home_goals,
        away_goals: saved.awayGoals ?? saved.away_goals,
      },
    }));
  };

  const filtered = matches.filter(m => filter === 'all' ? true : m.status === filter);

  const grouped = filtered.reduce((acc, m) => {
    const key = m.competition;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const totalPts   = Object.values(predictions).reduce((s, p) => s + (p.points || 0), 0);
  const exact      = Object.values(predictions).filter(p => p.points === 3).length;
  const totalPicks = Object.keys(predictions).length;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '12px' }}>
      <img src="/wc26-logo.png" alt="" style={{ height: '48px', width: '48px', objectFit: 'contain', animation: 'pulse 2s infinite' }} />
      <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)' }}>LOADING MATCHES...</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Stats card */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)', margin: 0 }}>WELCOME BACK</p>
            <p style={{ fontFamily: FF, fontSize: '22px', fontWeight: 900, color: 'var(--text-1)', margin: '4px 0 2px' }}>{user.username}</p>
            <p style={{ fontFamily: FF, fontSize: '13px', color: 'var(--text-2)', margin: 0 }}>{user.supportedTeam}</p>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { val: totalPts,   label: 'PTS',   color: 'var(--gold)' },
              { val: exact,      label: 'EXACT',  color: 'var(--purple)' },
              { val: totalPicks, label: 'PICKS',  color: 'var(--teal)' },
            ].map(({ val, label, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: FF, fontSize: '30px', fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{val}</p>
                <p style={{ fontFamily: FF, fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', color: 'var(--text-3)', margin: '4px 0 0' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scoring guide */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { pts: '3 PTS', label: 'Exact score',  color: 'var(--gold)' },
          { pts: '1 PT',  label: 'Right winner', color: 'var(--purple)' },
          { pts: '0 PTS', label: 'Wrong',        color: 'var(--text-3)' },
        ].map(({ pts, label, color }) => (
          <div key={pts} className="card" style={{ flex: 1, padding: '10px', textAlign: 'center' }}>
            <p style={{ fontFamily: FF, fontSize: '14px', fontWeight: 900, color, margin: 0 }}>{pts}</p>
            <p style={{ fontFamily: FF, fontSize: '11px', color: 'var(--text-3)', margin: '3px 0 0' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button key={key} onClick={() => setFilter(key)} style={{
              flex: 1, padding: '9px 4px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontFamily: FF, fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', transition: 'all 0.15s',
              background: active ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'var(--surface)',
              color: active ? '#fff' : 'var(--text-3)',
              boxShadow: active ? '0 2px 12px rgba(124,58,237,0.3)' : 'none',
              border: active ? 'none' : '1px solid var(--border)',
            }}>
              {label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Match groups */}
      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: '40px', margin: '0 0 8px' }}>🏟️</p>
          <p style={{ fontFamily: FF, fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)' }}>NO MATCHES</p>
        </div>
      ) : (
        Object.entries(grouped).map(([competition, groupMatches]) => {
          const parts = competition.split('·');
          const groupLabel = parts[parts.length - 1].trim().toUpperCase();
          return (
            <div key={competition} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                  {groupLabel}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              {groupMatches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictions[match.id]}
                  userId={user.id}
                  onPredictionSaved={handleSaved}
                />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
