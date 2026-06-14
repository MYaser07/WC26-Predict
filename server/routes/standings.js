const express = require('express');
const router = express.Router();
const { getDb } = require('../db/schema');

// GET /api/standings
router.get('/', (req, res) => {
  const db = getDb();

  const matches = db.prepare(`
    SELECT * FROM matches
    WHERE competition LIKE '%Group%'
    ORDER BY match_time ASC
  `).all();

  const groups = {};

  for (const match of matches) {
    const m = match.competition.match(/Group ([A-L])/);
    if (!m) continue;
    const letter = m[1];
    if (!groups[letter]) groups[letter] = {};

    for (const team of [match.home_team, match.away_team]) {
      if (!groups[letter][team]) {
        groups[letter][team] = { name: team, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 };
      }
    }

    if (match.status === 'finished' && match.home_score !== null) {
      const h = groups[letter][match.home_team];
      const a = groups[letter][match.away_team];
      h.P++; a.P++;
      h.GF += match.home_score; h.GA += match.away_score;
      a.GF += match.away_score; a.GA += match.home_score;
      h.GD = h.GF - h.GA; a.GD = a.GF - a.GA;
      if (match.home_score > match.away_score) { h.W++; h.Pts += 3; a.L++; }
      else if (match.home_score < match.away_score) { a.W++; a.Pts += 3; h.L++; }
      else { h.D++; h.Pts++; a.D++; a.Pts++; }
    }
  }

  const result = {};
  for (const [letter, teams] of Object.entries(groups)) {
    result[letter] = Object.values(teams).sort((a, b) =>
      b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF
    );
  }

  res.json(result);
});

module.exports = router;
