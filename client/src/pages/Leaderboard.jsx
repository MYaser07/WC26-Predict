import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function RankIcon({ rank }) {
  if (rank === 1) return <span className="text-yellow-400 text-xl">🥇</span>;
  if (rank === 2) return <span className="text-gray-300 text-xl">🥈</span>;
  if (rank === 3) return <span className="text-amber-600 text-xl">🥉</span>;
  return <span className="text-gray-500 font-bold text-sm w-6 text-center">{rank}</span>;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data) => setLeaderboard(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const userRank = leaderboard.findIndex((u) => u.id === user.id) + 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-green-400 animate-pulse">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">🏆 Global Leaderboard</h1>
          <p className="text-gray-400 text-sm mt-1">{leaderboard.length} players competing</p>
        </div>
        {userRank > 0 && (
          <div className="card px-4 py-3 text-center">
            <div className="text-xl font-black text-green-400">#{userRank}</div>
            <div className="text-xs text-gray-400">Your Rank</div>
          </div>
        )}
      </div>

      {/* Top 3 podium (if we have at least 3) */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* 2nd place */}
          <div className="card p-4 text-center mt-4">
            <div className="text-3xl mb-1">🥈</div>
            <div className="font-bold text-white text-sm truncate">{leaderboard[1].username}</div>
            <div className="text-xs text-gray-400 truncate">{leaderboard[1].supported_team}</div>
            <div className="text-xl font-black text-gray-300 mt-2">{leaderboard[1].total_points}pts</div>
          </div>
          {/* 1st place */}
          <div className="card p-4 text-center border-yellow-600/40 bg-yellow-900/10">
            <div className="text-4xl mb-1">🥇</div>
            <div className="font-bold text-white truncate">{leaderboard[0].username}</div>
            <div className="text-xs text-gray-400 truncate">{leaderboard[0].supported_team}</div>
            <div className="text-2xl font-black text-yellow-400 mt-2">{leaderboard[0].total_points}pts</div>
          </div>
          {/* 3rd place */}
          <div className="card p-4 text-center mt-6">
            <div className="text-3xl mb-1">🥉</div>
            <div className="font-bold text-white text-sm truncate">{leaderboard[2].username}</div>
            <div className="text-xs text-gray-400 truncate">{leaderboard[2].supported_team}</div>
            <div className="text-xl font-black text-amber-600 mt-2">{leaderboard[2].total_points}pts</div>
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-green-900/40">
                <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">Rank</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">Player</th>
                <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold">Pts</th>
                <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold hidden sm:table-cell">⭐ Exact</th>
                <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold hidden sm:table-cell">✓ Winner</th>
                <th className="text-right px-4 py-3 text-xs text-gray-400 uppercase tracking-wider font-semibold hidden md:table-cell">Preds</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const rank = idx + 1;
                const isMe = entry.id === user.id;
                return (
                  <tr
                    key={entry.id}
                    className={`border-b border-green-900/20 transition-colors ${
                      isMe ? 'bg-green-900/20' : 'hover:bg-green-900/10'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center w-8">
                        <RankIcon rank={rank} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-semibold text-white text-sm flex items-center gap-1">
                            {entry.username}
                            {isMe && <span className="text-xs text-green-400">(you)</span>}
                          </div>
                          <div className="text-xs text-gray-400">{entry.supported_team}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-black text-lg text-green-400">{entry.total_points}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-yellow-400 font-semibold hidden sm:table-cell">
                      {entry.exact_scores}
                    </td>
                    <td className="px-4 py-3 text-right text-blue-400 font-semibold hidden sm:table-cell">
                      {entry.correct_winners}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 hidden md:table-cell">
                      {entry.total_predictions}
                    </td>
                  </tr>
                );
              })}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No players yet. Be the first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
