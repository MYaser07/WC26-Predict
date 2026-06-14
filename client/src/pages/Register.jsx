import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TEAMS = [
  // Group A
  '🇲🇽 Mexico', '🇿🇦 South Africa', '🇰🇷 South Korea', '🇨🇿 Czechia',
  // Group B
  '🇨🇦 Canada', '🇧🇦 Bosnia-Herzegovina', '🇶🇦 Qatar', '🇨🇭 Switzerland',
  // Group C
  '🇧🇷 Brazil', '🇲🇦 Morocco', '🇭🇹 Haiti', '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland',
  // Group D
  '🇺🇸 USA', '🇵🇾 Paraguay', '🇦🇺 Australia', '🇹🇷 Türkiye',
  // Group E
  '🇩🇪 Germany', '🇨🇼 Curaçao', '🇨🇮 Ivory Coast', '🇪🇨 Ecuador',
  // Group F
  '🇳🇱 Netherlands', '🇯🇵 Japan', '🇸🇪 Sweden', '🇹🇳 Tunisia',
  // Group G
  '🇧🇪 Belgium', '🇪🇬 Egypt', '🇮🇷 Iran', '🇳🇿 New Zealand',
  // Group H
  '🇪🇸 Spain', '🇨🇻 Cape Verde', '🇸🇦 Saudi Arabia', '🇺🇾 Uruguay',
  // Group I
  '🇫🇷 France', '🇸🇳 Senegal', '🇮🇶 Iraq', '🇳🇴 Norway',
  // Group J
  '🇦🇷 Argentina', '🇩🇿 Algeria', '🇦🇹 Austria', '🇯🇴 Jordan',
  // Group K
  '🇵🇹 Portugal', '🇨🇩 DR Congo', '🇺🇿 Uzbekistan', '🇨🇴 Colombia',
  // Group L
  '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', '🇭🇷 Croatia', '🇬🇭 Ghana', '🇵🇦 Panama',
];

export { TEAMS };

export default function Register() {
  const [username, setUsername] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !selectedTeam) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), supportedTeam: selectedTeam }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      login({ id: data.id, username: data.username, supportedTeam: data.supportedTeam });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        {/* Hero */}
        <div className="text-center mb-8">
          <img src="/wc26-logo.png" alt="WC26" className="h-24 w-24 object-contain mx-auto mb-4" />
          <h1 className="text-6xl font-black text-white mb-1" style={{ fontFamily: 'FWC2026', letterSpacing: '0.1em' }}>
            WC<span style={{ color: '#f59e0b' }}>26</span>
          </h1>
          <p className="text-sm tracking-widest mb-2" style={{ color: '#0d9488', fontFamily: 'FWC2026', letterSpacing: '0.25em' }}>PREDICT · COMPETE · WIN</p>
          <div className="rainbow-bar w-32 mx-auto rounded-full" />
        </div>

        <div className="card p-6" style={{ border: '1px solid rgba(79,70,229,0.2)' }}>
          <h2 className="text-xl font-black text-white mb-6" style={{ fontFamily: 'FWC2026', letterSpacing: '0.1em' }}>JOIN THE GAME</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-medium">
                Choose a username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. GoalMachine99"
                className="input"
                maxLength={20}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Already registered? Enter your username to sign back in.
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2 font-medium">
                Your supported team
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {TEAMS.map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => setSelectedTeam(team)}
                    className={`text-left text-sm px-3 py-2 rounded-lg border transition-all duration-150 ${
                      selectedTeam === team
                        ? 'bg-green-600/30 border-green-500 text-green-300'
                        : 'bg-[#162016] border-green-900/40 text-gray-300 hover:border-green-700/60 hover:text-white'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !selectedTeam}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Joining...' : '🚀 Start Predicting'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
