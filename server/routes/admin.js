const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/schema');

const ADMIN_PASSWORD = 'admin123';

// Admin auth middleware
function adminAuth(req, res, next) {
  const password = req.headers['x-admin-password'] || req.body.adminPassword;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }
  next();
}

// POST /api/admin/verify - verify admin password
router.post('/verify', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid password' });
});

// POST /api/admin/matches - add a new match
router.post('/matches', adminAuth, (req, res) => {
  const { homeTeam, awayTeam, competition, matchTime } = req.body;

  if (!homeTeam || !awayTeam || !competition || !matchTime) {
    return res.status(400).json({ error: 'All match fields are required' });
  }

  const db = getDb();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO matches (id, home_team, away_team, competition, match_time, status)
    VALUES (?, ?, ?, ?, ?, 'upcoming')
  `).run(id, homeTeam, awayTeam, competition, matchTime);

  res.status(201).json({ id, homeTeam, awayTeam, competition, matchTime, status: 'upcoming' });
});

// POST /api/admin/results - enter final result and calculate points
router.post('/results', adminAuth, (req, res) => {
  const { matchId, homeScore, awayScore } = req.body;

  if (!matchId || homeScore === undefined || awayScore === undefined) {
    return res.status(400).json({ error: 'matchId, homeScore, awayScore are required' });
  }

  const db = getDb();
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  const actualHomeScore = parseInt(homeScore);
  const actualAwayScore = parseInt(awayScore);

  // Determine actual winner
  let actualResult;
  if (actualHomeScore > actualAwayScore) actualResult = 'home';
  else if (actualAwayScore > actualHomeScore) actualResult = 'away';
  else actualResult = 'draw';

  const updateMatch = db.transaction(() => {
    // Update match
    db.prepare(`
      UPDATE matches SET home_score = ?, away_score = ?, status = 'finished'
      WHERE id = ?
    `).run(actualHomeScore, actualAwayScore, matchId);

    // Get all predictions for this match
    const predictions = db.prepare('SELECT * FROM predictions WHERE match_id = ?').all(matchId);

    let updatedCount = 0;
    for (const pred of predictions) {
      let points = 0;

      // Check exact score
      if (pred.home_goals === actualHomeScore && pred.away_goals === actualAwayScore) {
        points = 3;
      } else {
        // Check correct winner/draw
        let predResult;
        if (pred.home_goals > pred.away_goals) predResult = 'home';
        else if (pred.away_goals > pred.home_goals) predResult = 'away';
        else predResult = 'draw';

        if (predResult === actualResult) {
          points = 1;
        }
      }

      db.prepare('UPDATE predictions SET points = ? WHERE id = ?').run(points, pred.id);
      updatedCount++;
    }

    return updatedCount;
  });

  const updatedCount = updateMatch();

  res.json({
    success: true,
    matchId,
    homeScore: actualHomeScore,
    awayScore: actualAwayScore,
    predictionsUpdated: updatedCount,
  });
});

// PUT /api/admin/matches/:id/status - update match status
router.put('/matches/:id/status', adminAuth, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['upcoming', 'live', 'finished'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const db = getDb();
  db.prepare('UPDATE matches SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true, status });
});

// GET /api/admin/matches - get all matches for admin
router.get('/matches', adminAuth, (req, res) => {
  const db = getDb();
  const matches = db.prepare('SELECT * FROM matches ORDER BY match_time ASC').all();
  res.json(matches);
});

module.exports = router;
