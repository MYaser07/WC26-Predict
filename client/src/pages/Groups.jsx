import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

function GroupPredictionsModal({ group, match, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/groups/${group.id}/predictions/${match.id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [group.id, match.id]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white">{match.home_team} vs {match.away_team}</h3>
            <p className="text-xs text-gray-400">{match.competition}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {loading ? (
          <div className="text-green-400 animate-pulse py-4 text-center">Loading...</div>
        ) : data && !data.revealed ? (
          <div>
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mb-4 text-sm text-yellow-300">
              🔒 Predictions hidden until match kicks off
            </div>
            <div className="space-y-2">
              {data.members?.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{m.username} <span className="text-gray-500 text-xs">{m.supported_team}</span></span>
                  <span className={m.has_predicted ? 'text-green-400' : 'text-gray-600'}>
                    {m.has_predicted ? '✓ Predicted' : 'Not yet'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : data && data.revealed ? (
          <div>
            {(data.match?.home_score !== null && data.match?.home_score !== undefined) && (
              <div className="text-center mb-4">
                <div className="text-xs text-gray-400 mb-1">Final Score</div>
                <div className="text-3xl font-black text-white">
                  {data.match.home_score} <span className="text-green-500">:</span> {data.match.away_score}
                </div>
              </div>
            )}
            <div className="space-y-2">
              {data.predictions?.map((p) => (
                <div key={p.user_id} className="flex items-center justify-between bg-[#162016] rounded-lg px-3 py-2">
                  <div>
                    <span className="text-white text-sm font-medium">{p.username}</span>
                    <span className="text-gray-500 text-xs ml-2">{p.supported_team}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.home_goals !== null ? (
                      <span className="text-green-300 font-bold">{p.home_goals} - {p.away_goals}</span>
                    ) : (
                      <span className="text-gray-600 text-xs">No prediction</span>
                    )}
                    {p.points !== null && p.home_goals !== null && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.points === 3 ? 'bg-yellow-500/20 text-yellow-400' :
                        p.points === 1 ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {p.points}pts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function GroupDetail({ group, onBack }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      fetch(`/api/groups/${group.id}/leaderboard`).then((r) => r.json()),
      fetch('/api/matches').then((r) => r.json()),
    ]).then(([lb, m]) => {
      setLeaderboard(lb.leaderboard || []);
      setMatches(Array.isArray(m) ? m : []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [group.id]);

  const copyCode = () => {
    navigator.clipboard.writeText(group.invite_code || group.inviteCode);
  };

  if (loading) return <div className="text-green-400 animate-pulse py-8 text-center">Loading group...</div>;

  const inviteCode = group.invite_code || group.inviteCode;

  return (
    <div>
      <button onClick={onBack} className="text-green-400 hover:text-green-300 text-sm mb-4 flex items-center gap-1">
        ← Back to groups
      </button>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">{group.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-400 text-sm">Invite code:</span>
            <span className="font-mono font-bold text-green-400 text-lg tracking-widest">{inviteCode}</span>
            <button onClick={copyCode} className="text-xs text-gray-400 hover:text-white border border-green-900/40 px-2 py-0.5 rounded">
              Copy
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="card p-5">
          <h3 className="font-bold text-white mb-4">🏆 Group Leaderboard</h3>
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div key={entry.id} className={`flex items-center justify-between p-2 rounded-lg ${entry.id === user.id ? 'bg-green-900/20' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-bold text-sm w-5 text-center">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                  </span>
                  <div>
                    <div className="text-white text-sm font-semibold">
                      {entry.username} {entry.id === user.id && <span className="text-green-400 text-xs">(you)</span>}
                    </div>
                    <div className="text-xs text-gray-500">{entry.supported_team}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-black">{entry.total_points}pts</div>
                  <div className="text-xs text-gray-500">⭐{entry.exact_scores} ✓{entry.correct_winners}</div>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="text-gray-500 text-sm">No members yet</p>}
          </div>
        </div>

        {/* Match predictions */}
        <div className="card p-5">
          <h3 className="font-bold text-white mb-4">⚽ Match Predictions</h3>
          <div className="space-y-2">
            {matches.map((match) => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="w-full text-left p-3 bg-[#162016] rounded-lg hover:bg-green-900/20 transition-colors border border-green-900/30"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white font-medium truncate">
                    {match.home_team} vs {match.away_team}
                  </div>
                  <div className="text-xs ml-2 flex-shrink-0">
                    {match.status === 'live' ? (
                      <span className="text-red-400 animate-pulse">🔴 Live</span>
                    ) : match.status === 'finished' ? (
                      <span className="text-gray-400">✓</span>
                    ) : (
                      <span className="text-green-600">🔒</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{match.competition}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedMatch && (
        <GroupPredictionsModal
          group={group}
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGroups = useCallback(() => {
    fetch(`/api/groups/user/${user.id}`)
      .then((r) => r.json())
      .then((data) => setGroups(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName.trim(), userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create group');
      setGroupName('');
      setShowCreate(false);
      fetchGroups();
      setActiveGroup(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/groups/join/${inviteCode.trim().toUpperCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join group');
      setInviteCode('');
      setShowJoin(false);
      fetchGroups();
      setActiveGroup(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (activeGroup) {
    return <GroupDetail group={activeGroup} onBack={() => { setActiveGroup(null); fetchGroups(); }} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">👥 Groups</h1>
          <p className="text-gray-400 text-sm mt-1">Compete with friends in private groups</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); setError(''); }} className="btn-secondary text-sm">
            Join Group
          </button>
          <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); setError(''); }} className="btn-primary text-sm">
            + Create Group
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card p-5 mb-5">
          <h3 className="font-bold text-white mb-4">Create a New Group</h3>
          <form onSubmit={handleCreate} className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name (e.g. Office Legends)"
              className="input flex-1 min-w-48"
              maxLength={40}
              autoFocus
            />
            <button type="submit" disabled={actionLoading || !groupName.trim()} className="btn-primary">
              {actionLoading ? 'Creating...' : 'Create'}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      )}

      {/* Join form */}
      {showJoin && (
        <div className="card p-5 mb-5">
          <h3 className="font-bold text-white mb-4">Join a Group</h3>
          <form onSubmit={handleJoin} className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character invite code"
              className="input flex-1 min-w-48 font-mono tracking-widest uppercase"
              maxLength={6}
              autoFocus
            />
            <button type="submit" disabled={actionLoading || inviteCode.length !== 6} className="btn-primary">
              {actionLoading ? 'Joining...' : 'Join'}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      )}

      {/* Groups list */}
      {loading ? (
        <div className="text-green-400 animate-pulse py-8 text-center">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-gray-400 text-lg mb-2">No groups yet</p>
          <p className="text-gray-500 text-sm">Create a group or join one with an invite code</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group)}
              className="card p-5 text-left hover:border-green-600/50 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg group-hover:text-green-400 transition-colors">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">Code:</span>
                    <span className="font-mono font-bold text-green-400 tracking-widest">
                      {group.invite_code || group.inviteCode}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-lg">{group.member_count || '?'}</div>
                  <div className="text-xs text-gray-400">members</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                View group →
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
