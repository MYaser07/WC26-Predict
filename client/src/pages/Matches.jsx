import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';

const FF = 'FWC2026';

const STAGES = [
  { key: 'all',     label: 'ALL' },
  { key: 'group',   label: 'GROUP' },
  { key: 'r32',     label: 'R32' },
  { key: 'r16',     label: 'R16' },
  { key: 'qf',      label: 'QF' },
  { key: 'sf',      label: 'SF' },
  { key: 'final',   label: 'FINAL' },
];

function stageOf(competition) {
  const c = competition.toLowerCase();
  if (c.includes('group'))         return 'group';
  if (c.includes('round of 32'))   return 'r32';
  if (c.includes('round of 16'))   return 'r16';
  if (c.includes('quarter'))       return 'qf';
  if (c.includes('semi'))          return 'sf';
  if (c.includes('final'))         return 'final';
  return 'other';
}

function toLocalDate(isoStr) {
  if (!isoStr) return 'invalid';
  const d = new Date(isoStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return 'invalid';
  return d.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
}

function toDateKey(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches]         = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading]         = useState(true);
  const [stage, setStage]             = useState('all');
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        fetch('/api/matches'),
        fetch(`/api/predictions/user/${user.id}`),
      ]);
      const mData = await mRes.json();
      const pData = await pRes.json();
      const ms = Array.isArray(mData) ? mData : [];
      setMatches(ms);
      const map = {};
      if (Array.isArray(pData)) pData.forEach(p => { map[p.match_id] = p; });
      setPredictions(map);

      const todayStr = new Date().toISOString().slice(0, 10);
      const days = [...new Set(ms.map(m => toDateKey(m.match_time || m.kickoff)))].filter(Boolean).sort();
      setSelectedDay(days.find(d => d >= todayStr) || days[0] || todayStr);
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

  const stageFiltered = useMemo(() => (
    stage === 'all' ? matches : matches.filter(m => stageOf(m.competition) === stage)
  ), [matches, stage]);

  const days = useMemo(() => (
    [...new Set(stageFiltered.map(m => toDateKey(m.match_time || m.kickoff)))].filter(Boolean).sort()
  ), [stageFiltered]);

  // Reset day when stage changes
  useEffect(() => {
    if (!days.includes(selectedDay)) {
      const todayStr = new Date().toISOString().slice(0, 10);
      setSelectedDay(days.find(d => d >= todayStr) || days[0] || null);
    }
  }, [days]);

  const dayMatches = useMemo(() => (
    selectedDay ? stageFiltered.filter(m => toDateKey(m.match_time || m.kickoff) === selectedDay) : stageFiltered
  ), [stageFiltered, selectedDay]);

  const grouped = useMemo(() => (
    dayMatches.reduce((acc, m) => {
      const key = m.competition;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    }, {})
  ), [dayMatches]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '12px' }}>
      <img src="/wc26-logo.png" alt="" style={{ height: '48px', objectFit: 'contain', animation: 'pulse 2s infinite' }} />
      <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)' }}>LOADING...</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Stage filter */}
      <div style={{ overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: '6px', paddingBottom: '2px', width: 'max-content' }}>
          {STAGES.map(({ key, label }) => {
            const active = stage === key;
            return (
              <button key={key} onClick={() => setStage(key)} style={{
                padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontFamily: FF, fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', transition: 'all 0.15s',
                background: active ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'var(--surface)',
                color: active ? '#fff' : 'var(--text-3)',
                boxShadow: active ? '0 2px 12px rgba(124,58,237,0.3)' : 'none',
                border: active ? 'none' : '1px solid var(--border)',
              }}>{label}</button>
            );
          })}
        </div>
      </div>

      {/* Day tabs */}
      {days.length > 1 && (
        <div style={{ overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', gap: '6px', paddingBottom: '2px', width: 'max-content' }}>
            {days.map(day => {
              const active = selectedDay === day;
              const d = new Date(day + 'T00:00:00');
              const todayStr = new Date().toISOString().slice(0, 10);
              const isToday = day === todayStr;
              const label = isToday ? 'TODAY' : d.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
              return (
                <button key={day} onClick={() => setSelectedDay(day)} style={{
                  padding: '7px 10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.07em', transition: 'all 0.15s',
                  background: active ? 'var(--gold)' : 'var(--surface)',
                  color: active ? '#000' : 'var(--text-3)',
                  border: active ? 'none' : '1px solid var(--border)',
                  whiteSpace: 'nowrap',
                }}>{label}</button>
              );
            })}
          </div>
        </div>
      )}

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
