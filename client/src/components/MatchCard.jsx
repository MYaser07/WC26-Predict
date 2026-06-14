import React from 'react';
import PredictionForm from './PredictionForm';

const FF  = 'FWC2026';   // decorative labels only
const TXT = 'Inter, system-ui, sans-serif'; // readable body text

function StatusBadge({ status }) {
  if (status === 'live') return (
    <span className="animate-pulse" style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', color: '#ef4444' }}>● LIVE</span>
  );
  if (status === 'finished') return (
    <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', color: 'var(--text-3)' }}>FT</span>
  );
  return null;
}

function timeUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function MatchCard({ match, prediction, userId, onPredictionSaved }) {
  const d         = new Date(match.match_time);
  const dayName   = d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase();
  const dayNum    = d.getDate();
  const monthStr  = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
  const timeStr   = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const countdown = timeUntil(match.match_time);
  const showScore = match.status === 'live' || match.status === 'finished';

  const compParts = match.competition.split('·');
  const compLabel = compParts[compParts.length - 1].trim();

  return (
    <div className="card" style={{ overflow: 'hidden' }}>

      {/* Competition header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface2)',
      }}>
        <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.18em', color: 'var(--gold)', textTransform: 'uppercase' }}>
          {compLabel}
        </span>
        <StatusBadge status={match.status} />
      </div>

      {/* Teams + score */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Home team */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: TXT, fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3, margin: 0 }}>
              {match.home_team}
            </p>
          </div>

          {/* Center: score or time */}
          <div style={{ flexShrink: 0, width: '96px', textAlign: 'center' }}>
            {showScore ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontFamily: TXT, fontSize: '32px', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>
                  {match.home_score ?? '–'}
                </span>
                <span style={{ fontSize: '18px', color: 'var(--text-3)', fontWeight: 700, margin: '0 2px' }}>:</span>
                <span style={{ fontFamily: TXT, fontSize: '32px', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>
                  {match.away_score ?? '–'}
                </span>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: TXT, fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.2 }}>{timeStr}</div>
                <div style={{ fontFamily: TXT, fontSize: '11px', fontWeight: 500, color: 'var(--text-3)', marginTop: '2px' }}>
                  {dayName} {dayNum} {monthStr}
                </div>
                {countdown && (
                  <div style={{
                    display: 'inline-block', marginTop: '5px',
                    fontFamily: TXT, fontSize: '11px', fontWeight: 700,
                    color: 'var(--gold)', background: 'rgba(245,158,11,0.1)',
                    padding: '2px 8px', borderRadius: '99px',
                  }}>
                    {countdown}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Away team */}
          <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
            <p style={{ fontFamily: TXT, fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3, margin: 0 }}>
              {match.away_team}
            </p>
          </div>
        </div>
      </div>

      {/* Prediction */}
      {userId && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <PredictionForm
            match={match}
            existingPrediction={prediction}
            userId={userId}
            onSaved={onPredictionSaved}
          />
        </div>
      )}
    </div>
  );
}
