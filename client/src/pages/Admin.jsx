import React, { useState, useEffect, useCallback } from 'react';

const TEAMS = [
  '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Arsenal', '🔵 Chelsea', '🔴 Liverpool', '🔵 Manchester City',
  '🔴 Manchester United', '⚫ Newcastle', '🟡 Leeds', '🦊 Leicester',
  '🐝 Brentford', '🦅 Crystal Palace', '🇪🇸 Real Madrid', '🔵🔴 Barcelona',
  '🟡🔴 Atlético Madrid', '🇩🇪 Bayern Munich', '🟡⚫ Borussia Dortmund',
  '🇮🇹 Juventus', '🔵⚫ Inter Milan', '🔴⚫ AC Milan', '🇫🇷 PSG',
  '🇧🇷 Brazil', '🇦🇷 Argentina', '🇫🇷 France', '🇩🇪 Germany',
  '🇪🇸 Spain', '🇵🇹 Portugal', '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',
];

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error('Invalid password');
      onLogin(password);
    } catch {
      setError('Invalid admin password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Enter admin password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="input"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading || !password} className="btn-primary w-full">
            {loading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const [adminPassword, setAdminPassword] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');

  // Add match form
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [competition, setCompetition] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [matchError, setMatchError] = useState('');
  const [matchSuccess, setMatchSuccess] = useState('');

  // Result form
  const [resultMatchId, setResultMatchId] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [resultError, setResultError] = useState('');
  const [resultSuccess, setResultSuccess] = useState('');

  const fetchMatches = useCallback(() => {
    if (!adminPassword) return;
    setLoading(true);
    fetch('/api/admin/matches', {
      headers: { 'x-admin-password': adminPassword },
    })
      .then((r) => r.json())
      .then((data) => setMatches(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [adminPassword]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleAddMatch = async (e) => {
    e.preventDefault();
    setMatchError('');
    setMatchSuccess('');
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ homeTeam, awayTeam, competition, matchTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add match');
      setMatchSuccess(`Match added: ${homeTeam} vs ${awayTeam}`);
      setHomeTeam(''); setAwayTeam(''); setCompetition(''); setMatchTime('');
      fetchMatches();
    } catch (err) {
      setMatchError(err.message);
    }
  };

  const handleSetResult = async (e) => {
    e.preventDefault();
    setResultError('');
    setResultSuccess('');
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ matchId: resultMatchId, homeScore: Number(homeScore), awayScore: Number(awayScore) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set result');
      const match = matches.find((m) => m.id === resultMatchId);
      setResultSuccess(`Result set! ${data.predictionsUpdated} predictions updated.`);
      setResultMatchId(''); setHomeScore(''); setAwayScore('');
      fetchMatches();
    } catch (err) {
      setResultError(err.message);
    }
  };

  const handleStatusChange = async (matchId, status) => {
    await fetch(`/api/admin/matches/${matchId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
      body: JSON.stringify({ status }),
    });
    fetchMatches();
  };

  function formatDate(d) {
    return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  if (!adminPassword) return <AdminLogin onLogin={setAdminPassword} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">⚙️ Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Manage matches and results</p>
        </div>
        <button onClick={() => setAdminPassword(null)} className="text-red-400 hover:text-red-300 text-sm">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'matches', label: '⚽ Matches' },
          { key: 'add', label: '+ Add Match' },
          { key: 'results', label: '🏁 Set Results' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key ? 'bg-green-600 text-white' : 'btn-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Matches list */}
      {activeTab === 'matches' && (
        <div className="card overflow-hidden">
          {loading ? (
            <div className="text-center py-8 text-green-400 animate-pulse">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-green-900/40">
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Match</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase hidden sm:table-cell">Competition</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Date</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Score</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="border-b border-green-900/20 hover:bg-green-900/10">
                      <td className="px-4 py-3 text-sm text-white">
                        <div>{match.home_team}</div>
                        <div className="text-gray-400">vs {match.away_team}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 hidden sm:table-cell">{match.competition}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">{formatDate(match.match_time)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          match.status === 'live' ? 'bg-red-600/20 text-red-400' :
                          match.status === 'finished' ? 'bg-gray-600/20 text-gray-400' :
                          'bg-green-900/30 text-green-400'
                        }`}>
                          {match.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-white">
                        {match.home_score !== null && match.home_score !== undefined
                          ? `${match.home_score} - ${match.away_score}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={match.status}
                          onChange={(e) => handleStatusChange(match.id, e.target.value)}
                          className="text-xs bg-[#162016] border border-green-900/40 text-gray-300 rounded px-2 py-1"
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="live">Live</option>
                          <option value="finished">Finished</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {matches.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">No matches</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add match form */}
      {activeTab === 'add' && (
        <div className="card p-6 max-w-lg">
          <h2 className="font-bold text-white mb-5">Add New Match</h2>
          <form onSubmit={handleAddMatch} className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 block mb-1">Home Team</label>
              <select value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} className="input" required>
                <option value="">Select home team...</option>
                {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Away Team</label>
              <select value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} className="input" required>
                <option value="">Select away team...</option>
                {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Competition</label>
              <input
                type="text"
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                placeholder="e.g. Premier League"
                className="input"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Match Date & Time</label>
              <input
                type="datetime-local"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="input"
                required
              />
            </div>
            {matchError && <p className="text-red-400 text-sm">{matchError}</p>}
            {matchSuccess && <p className="text-green-400 text-sm">{matchSuccess}</p>}
            <button type="submit" className="btn-primary w-full">Add Match</button>
          </form>
        </div>
      )}

      {/* Set results form */}
      {activeTab === 'results' && (
        <div className="card p-6 max-w-lg">
          <h2 className="font-bold text-white mb-5">Enter Match Result</h2>
          <form onSubmit={handleSetResult} className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 block mb-1">Select Match</label>
              <select value={resultMatchId} onChange={(e) => setResultMatchId(e.target.value)} className="input" required>
                <option value="">Select match...</option>
                {matches.filter((m) => m.status !== 'finished').map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.home_team} vs {m.away_team} ({m.competition})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="text-sm text-gray-300 block mb-1">Home Goals</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="input text-center text-2xl font-bold"
                  required
                />
              </div>
              <div className="text-green-500 font-bold text-2xl mt-5">:</div>
              <div className="flex-1">
                <label className="text-sm text-gray-300 block mb-1">Away Goals</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="input text-center text-2xl font-bold"
                  required
                />
              </div>
            </div>
            {resultError && <p className="text-red-400 text-sm">{resultError}</p>}
            {resultSuccess && <p className="text-green-400 text-sm">{resultSuccess}</p>}
            <button type="submit" className="btn-primary w-full">
              Submit Result & Calculate Points
            </button>
          </form>

          {/* Finished matches reference */}
          {matches.filter((m) => m.status === 'finished').length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Completed Matches</h3>
              <div className="space-y-2">
                {matches.filter((m) => m.status === 'finished').map((m) => (
                  <div key={m.id} className="flex justify-between items-center text-sm bg-[#162016] rounded px-3 py-2">
                    <span className="text-gray-300">{m.home_team} vs {m.away_team}</span>
                    <span className="text-white font-bold">{m.home_score} - {m.away_score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
