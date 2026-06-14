const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/schema');

// POST /api/predictions
router.post('/', (req, res) => {
  const { userId, matchId, homeGoals, awayGoals } = req.body;

  if (!userId || !matchId || homeGoals === undefined || awayGoals === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (homeGoals < 0 || awayGoals < 0 || homeGoals > 20 || awayGoals > 20) {
    return res.status(400).json({ error: 'Invalid score values' });
  }

  const db = getDb();

  // Check match exists and is upcoming
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  if (match.status !== 'upcoming') {
    return res.status(400).json({ error: 'Cannot predict on a match that has already started' });
  }
  // Lock predictions at kickoff
  const kickoff = new Date(match.match_time.replace(' ', 'T')).getTime();
  if (Date.now() >= kickoff) {
    return res.status(400).json({ error: 'Predictions closed — match has kicked off' });
  }

  // Check for existing prediction
  const existing = db.prepare('SELECT * FROM predictions WHERE user_id = ? AND match_id = ?').get(userId, matchId);
  if (existing) {
    return res.status(409).json({ error: 'Prediction already exists. Use PUT to update.' });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO predictions (id, user_id, match_id, home_goals, away_goals, points)
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(id, userId, matchId, homeGoals, awayGoals);

  res.status(201).json({ id, userId, matchId, homeGoals, awayGoals, points: 0 });
});

// PUT /api/predictions/:id
router.put('/:id', (req, res) => {
  const { homeGoals, awayGoals, userId } = req.body;

  if (homeGoals === undefined || awayGoals === undefined) {
    return res.status(400).json({ error: 'Missing score values' });
  }

  const db = getDb();
  const prediction = db.prepare('SELECT * FROM predictions WHERE id = ?').get(req.params.id);
  if (!prediction) return res.status(404).json({ error: 'Prediction not found' });

  // Verify ownership
  if (prediction.user_id !== userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Check match status and 2-hour cutoff
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(prediction.match_id);
  if (match.status !== 'upcoming') {
    return res.status(400).json({ error: 'Cannot edit prediction after match has started' });
  }
  const kickoff = new Date(match.match_time.replace(' ', 'T')).getTime();
  if (Date.now() >= kickoff) {
    return res.status(400).json({ error: 'Predictions closed — match has kicked off' });
  }

  db.prepare(`
    UPDATE predictions SET home_goals = ?, away_goals = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(homeGoals, awayGoals, req.params.id);

  res.json({ id: req.params.id, homeGoals, awayGoals });
});

// GET /api/predictions/user/:userId
router.get('/user/:userId', (req, res) => {
  const db = getDb();
  const predictions = db.prepare(`
    SELECT p.*, m.home_team, m.away_team, m.competition, m.match_time, m.status, m.home_score, m.away_score
    FROM predictions p
    JOIN matches m ON p.match_id = m.id
    WHERE p.user_id = ?
    ORDER BY m.match_time ASC
  `).all(req.params.userId);
  res.json(predictions);
});

module.exports = router;
