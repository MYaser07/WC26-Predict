import React, { useState } from 'react';

const FF  = 'FWC2026';
const TXT = 'Inter, system-ui, sans-serif';

function Counter({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} style={{
        width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid var(--border)',
        background: 'var(--surface2)', color: 'var(--text-2)', fontFamily: FF,
        fontSize: '20px', fontWeight: 900, cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', lineHeight: 1,
      }}>−</button>
      <span style={{ fontFamily: FF, fontSize: '22px', fontWeight: 900, color: 'var(--text-1)', width: '28px', textAlign: 'center', lineHeight: 1 }}>
        {value}
      </span>
      <button type="button" onClick={() => onChange(Math.min(20, value + 1))} style={{
        width: '32px', height: '32px', borderRadius: '8px', border: 'none',
        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
        fontFamily: FF, fontSize: '20px', fontWeight: 900, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
      }}>+</button>
    </div>
  );
}

export function PointsBadge({ points }) {
  const styles = {
    3: { bg: 'rgba(245,158,11,0.12)', color: 'var(--gold)', label: '⭐ 3 PTS' },
    1: { bg: 'rgba(99,102,241,0.12)', color: 'var(--purple)', label: '✓ 1 PT' },
    0: { bg: 'rgba(239,68,68,0.1)',   color: 'var(--red)',    label: '✗ 0 PTS' },
  };
  const s = styles[points];
  if (!s) return null;
  return (
    <span style={{
      fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em',
      padding: '3px 10px', borderRadius: '99px',
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

export default function PredictionForm({ match, existingPrediction, userId, onSaved }) {
  const [home, setHome]     = useState(existingPrediction?.home_goals ?? 0);
  const [away, setAway]     = useState(existingPrediction?.away_goals ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [editing, setEditing] = useState(false);

  const kickoff     = new Date(match.match_time).getTime();
  const twoHrsBefore = kickoff - 2 * 60 * 60 * 1000;
  const canEdit     = match.status === 'upcoming' && Date.now() < twoHrsBefore;
  const locked2h    = match.status === 'upcoming' && Date.now() >= twoHrsBefore;
  const hasExisting = !!existingPrediction;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await fetch(
        hasExisting ? `/api/predictions/${existingPrediction.id}` : '/api/predictions',
        {
          method: hasExisting ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, matchId: match.id, homeGoals: home, awayGoals: away }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setEditing(false);
      onSaved?.(data);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const row = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', flexWrap: 'wrap', gap: '10px' };
  const labelStyle = { fontFamily: TXT, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-3)', textTransform: 'uppercase' };

  /* locked 2h before / after kickoff */
  if (locked2h && hasExisting) return (
    <div style={row}>
      <span style={labelStyle}>Your Pick</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontFamily: TXT, fontSize: '18px', fontWeight: 700, color: 'var(--text-1)' }}>
          {existingPrediction.home_goals} – {existingPrediction.away_goals}
        </span>
        <span style={{ fontFamily: TXT, fontSize: '11px', color: 'var(--gold)', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '99px' }}>🔒 Locked</span>
      </div>
    </div>
  );

  if (locked2h && !hasExisting) return (
    <div style={row}>
      <span style={{ fontFamily: TXT, fontSize: '13px', color: 'var(--text-3)' }}>🔒 Predictions closed (2h before kickoff)</span>
    </div>
  );

  if (hasExisting && !canEdit) return (
    <div style={row}>
      <span style={labelStyle}>Your Pick</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontFamily: FF, fontSize: '20px', fontWeight: 900, color: 'var(--text-1)' }}>
          {existingPrediction.home_goals} – {existingPrediction.away_goals}
        </span>
        {typeof existingPrediction.points === 'number' && <PointsBadge points={existingPrediction.points} />}
      </div>
    </div>
  );

  /* no prediction, match started */
  if (!canEdit && !hasExisting) return (
    <div style={row}>
      <span style={{ ...labelStyle, color: 'var(--text-3)' }}>No Prediction Made</span>
    </div>
  );

  /* saved, can edit */
  if (hasExisting && !editing) return (
    <div style={row}>
      <span style={labelStyle}>Your Pick</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontFamily: FF, fontSize: '20px', fontWeight: 900, color: 'var(--text-1)' }}>
          {existingPrediction.home_goals} – {existingPrediction.away_goals}
        </span>
        <button onClick={() => { setEditing(true); setHome(existingPrediction.home_goals); setAway(existingPrediction.away_goals); }}
          style={{ fontFamily: FF, fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer' }}>
          EDIT
        </button>
      </div>
    </div>
  );

  /* prediction form */
  return (
    <form onSubmit={submit}>
      <div style={{ ...row, flexWrap: 'wrap', gap: '12px' }}>
        <span style={labelStyle}>{hasExisting ? 'Edit Pick' : 'Your Pick'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Counter value={home} onChange={setHome} />
          <span style={{ fontFamily: FF, fontSize: '18px', fontWeight: 900, color: 'var(--text-3)' }}>–</span>
          <Counter value={away} onChange={setAway} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" disabled={saving} style={{
            fontFamily: FF, fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em',
            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff',
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? '...' : hasExisting ? 'SAVE' : 'PREDICT'}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(false)} style={{
              fontFamily: FF, fontSize: '12px', fontWeight: 900, letterSpacing: '0.1em',
              padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
              background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-2)',
            }}>
              CANCEL
            </button>
          )}
        </div>
      </div>
      {error && <p style={{ fontFamily: FF, fontSize: '12px', color: 'var(--red)', margin: '0 16px 12px' }}>{error}</p>}
    </form>
  );
}
