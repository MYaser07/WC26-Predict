const express = require('express');
const router = express.Router();
const { getDb } = require('../db/schema');

// GET /api/leaderboard
router.get('/', (req, res) => {
  const db = getDb();

  const leaderboard = db.prepare(`
    SELECT
      u.id,
      u.username,
      u.supported_team,
      COALESCE(SUM(p.points), 0) as total_points,
      COUNT(CASE WHEN p.points = 3 THEN 1 END) as exact_scores,
      COUNT(CASE WHEN p.points = 1 THEN 1 END) as correct_winners,
      COUNT(p.id) as total_predictions
    FROM users u
    LEFT JOIN predictions p ON u.id = p.user_id
    GROUP BY u.id, u.username, u.supported_team
    ORDER BY total_points DESC, exact_scores DESC, u.username ASC
  `).all();

  res.json(leaderboard);
});

module.exports = router;
