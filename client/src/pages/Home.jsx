import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAIPrediction, stripFlag } from '../data/fifaRankings';

const FF = 'FWC2026';
const TXT = 'Inter, system-ui, sans-serif';

function useCountdown(targetIso) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso.replace(' ', 'T')).getTime();
    const tick = () => setDiff(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, over: diff === 0 };
}

function CountdownBox({ val, label }) {
  return (
    <div style={{ textAlign: 'center', minWidth: '56px' }}>
      <div style={{
        fontFamily: FF, fontSize: '36px', fontWeight: 900, color: 'var(--gold)', lineHeight: 1,
        background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '8px 10px', minWidth: '56px', display: 'inline-block',
      }}>{String(val).padStart(2, '0')}</div>
      <div style={{ fontFamily: FF, fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--text-3)', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

function AICard({ match, expanded, onToggle }) {
  const ai = useMemo(() => getAIPrediction(match.home_team, match.away_team), [match.home_team, match.away_team]);
  const kickoff = new Date((match.match_time || match.kickoff || '').replace(' ', 'T'));
  const timeStr = kickoff.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = kickoff.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' });

  const homeName = stripFlag(match.home_team);
  const awayName = stripFlag(match.away_team);
  const homeFlag = match.home_team.replace(homeName, '').trim();
  const awayFlag = match.away_team.replace(awayName, '').trim();

  return (
    <div className="card" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={onToggle}>
      {/* Compact row */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '22px' }}>{homeFlag}</span>
          <span style={{ fontFamily: TXT, fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', truncate: true }}>{homeName}</span>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, color: 'var(--text-3)' }}>{timeStr}</div>
          <div style={{ fontFamily: FF, fontSize: '10px', color: 'var(--text-3)' }}>{dateStr}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: TXT, fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>{awayName}</span>
          <span style={{ fontSize: '22px' }}>{awayFlag}</span>
        </div>
      </div>

      {/* Expanded AI section */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px', background: 'var(--surface2)' }}>
          <div style={{ fontFamily: FF, fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--teal)', marginBottom: '12px' }}>
            AI PREDICTION · FIFA RANKINGS
          </div>
          {/* Big predicted score */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '2px' }}>{homeFlag}</div>
              <div style={{ fontFamily: FF, fontSize: '11px', color: 'var(--text-3)' }}>#{ai.homeRank}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: FF, fontSize: '40px', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>
                {ai.homeScore} <span style={{ color: 'var(--gold)' }}>–</span> {ai.awayScore}
              </div>
              <div style={{ fontFamily: FF, fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>PREDICTED</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '2px' }}>{awayFlag}</div>
              <div style={{ fontFamily: FF, fontSize: '11px', color: 'var(--text-3)' }}>#{ai.awayRank}</div>
            </div>
          </div>
          {/* Win probability */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: FF, fontSize: '11px', color: 'var(--text-2)' }}>{homeName} {ai.homeWinPct}%</span>
              <span style={{ fontFamily: FF, fontSize: '11px', color: 'var(--text-2)' }}>{awayName} {100 - ai.homeWinPct}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '99px', background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${ai.homeWinPct}%`, background: 'linear-gradient(90deg,#4f46e5,#7c3aed)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
          {/* Confidence */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: FF, fontSize: '10px', color: 'var(--text-3)' }}>CONFIDENCE</span>
            <div style={{ height: '4px', flex: 1, borderRadius: '99px', background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${ai.confidence}%`, background: 'linear-gradient(90deg,var(--teal),var(--gold))', borderRadius: '99px' }} />
            </div>
            <span style={{ fontFamily: FF, fontSize: '10px', fontWeight: 900, color: 'var(--gold)' }}>{ai.confidence}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function toLocalDateKey(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function Home() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

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

  const nextMatch = useMemo(() => matches.find(m => m.status === 'upcoming'), [matches]);
  const { d, h, m, s } = useCountdown(nextMatch?.match_time || nextMatch?.kickoff);

  const todayKey = toLocalDateKey(new Date().toISOString());
  const tomorrowKey = toLocalDateKey(new Date(Date.now() + 86400000).toISOString());

  const todayMatches    = matches.filter(m => toLocalDateKey(m.match_time || m.kickoff) === todayKey);
  const tomorrowMatches = matches.filter(m => toLocalDateKey(m.match_time || m.kickoff) === tomorrowKey);

  const totalPts   = Object.values(predictions).reduce((s, p) => s + (p.points || 0), 0);
  const totalPicks = Object.keys(predictions).length;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '12px' }}>
      <img src="/wc26-logo.png" alt="" style={{ height: '48px', width: '48px', objectFit: 'contain', animation: 'pulse 2s infinite' }} />
      <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)' }}>LOADING...</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Hero countdown */}
      {nextMatch && (
        <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))' }}>
          <p style={{ fontFamily: FF, fontSize: '10px', fontWeight: 900, letterSpacing: '0.25em', color: 'var(--teal)', margin: '0 0 8px' }}>NEXT MATCH</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontFamily: TXT, fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>
              {nextMatch.home_team} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>vs</span> {nextMatch.away_team}
            </div>
            <div style={{ fontFamily: FF, fontSize: '11px', color: 'var(--text-3)' }}>
              {nextMatch.competition?.split('·').pop()?.trim()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <CountdownBox val={d} label="DAYS" />
            <CountdownBox val={h} label="HRS" />
            <CountdownBox val={m} label="MIN" />
            <CountdownBox val={s} label="SEC" />
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div className="card" style={{ flex: 1, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontFamily: FF, fontSize: '28px', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>{totalPts}</div>
          <div style={{ fontFamily: FF, fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--text-3)', marginTop: '3px' }}>MY PTS</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontFamily: FF, fontSize: '28px', fontWeight: 900, color: 'var(--purple)', lineHeight: 1 }}>{totalPicks}</div>
          <div style={{ fontFamily: FF, fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--text-3)', marginTop: '3px' }}>PICKS</div>
        </div>
        <Link to="/matches" style={{ flex: 2, textDecoration: 'none' }}>
          <div className="card" style={{ padding: '12px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(79,70,229,0.4)' }}>
            <div style={{ fontFamily: FF, fontSize: '13px', fontWeight: 900, color: 'var(--purple)' }}>ALL MATCHES →</div>
            <div style={{ fontFamily: FF, fontSize: '10px', color: 'var(--text-3)', marginTop: '2px' }}>PREDICT NOW</div>
          </div>
        </Link>
      </div>

      {/* Today's matches */}
      {todayMatches.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--gold)' }}>TODAY</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayMatches.map(match => (
              <AICard
                key={match.id}
                match={match}
                expanded={!!expanded[match.id]}
                onToggle={() => setExpanded(prev => ({ ...prev, [match.id]: !prev[match.id] }))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tomorrow's matches */}
      {tomorrowMatches.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontFamily: FF, fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--purple)' }}>TOMORROW</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tomorrowMatches.map(match => (
              <AICard
                key={match.id}
                match={match}
                expanded={!!expanded[match.id]}
                onToggle={() => setExpanded(prev => ({ ...prev, [match.id]: !prev[match.id] }))}
              />
            ))}
          </div>
        </div>
      )}

      {todayMatches.length === 0 && tomorrowMatches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: '36px', margin: '0 0 8px' }}>🏟️</p>
          <p style={{ fontFamily: FF, fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--text-3)' }}>NO MATCHES TODAY OR TOMORROW</p>
          <Link to="/matches" style={{ fontFamily: FF, fontSize: '12px', color: 'var(--purple)', textDecoration: 'none', display: 'inline-block', marginTop: '8px' }}>
            VIEW ALL MATCHES →
          </Link>
        </div>
      )}
    </div>
  );
}
