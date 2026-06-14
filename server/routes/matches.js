const express = require('express');
const router = express.Router();
const { getDb } = require('../db/schema');

// GET /api/matches
router.get('/', (req, res) => {
  const db = getDb();
  const matches = db.prepare(`
    SELECT * FROM matches ORDER BY match_time ASC
  `).all();
  res.json(matches);
});

// GET /api/matches/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

module.exports = router;
