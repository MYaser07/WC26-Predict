const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/schema');

function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/groups/create
router.post('/create', (req, res) => {
  const { name, userId } = req.body;

  if (!name || !userId) {
    return res.status(400).json({ error: 'Group name and userId are required' });
  }

  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let inviteCode;
  let attempts = 0;
  do {
    inviteCode = generateInviteCode();
    attempts++;
    if (attempts > 10) return res.status(500).json({ error: 'Could not generate unique code' });
  } while (db.prepare('SELECT id FROM groups WHERE invite_code = ?').get(inviteCode));

  const groupId = uuidv4();
  const memberId = uuidv4();

  const createGroup = db.transaction(() => {
    db.prepare('INSERT INTO groups (id, name, invite_code, created_by) VALUES (?, ?, ?, ?)').run(groupId, name.trim(), inviteCode, userId);
    db.prepare('INSERT INTO group_members (id, group_id, user_id) VALUES (?, ?, ?)').run(memberId, groupId, userId);
  });

  createGroup();

  res.status(201).json({ id: groupId, name: name.trim(), inviteCode, createdBy: userId });
});

// POST /api/groups/join/:code
router.post('/join/:code', (req, res) => {
  const { userId } = req.body;
  const { code } = req.params;

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const db = getDb();
  const group = db.prepare('SELECT * FROM groups WHERE invite_code = ?').get(code.toUpperCase());
  if (!group) return res.status(404).json({ error: 'Group not found with that invite code' });

  const alreadyMember = db.prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?').get(group.id, userId);
  if (alreadyMember) {
    return res.json({ id: group.id, name: group.name, inviteCode: group.invite_code, alreadyMember: true });
  }

  db.prepare('INSERT INTO group_members (id, group_id, user_id) VALUES (?, ?, ?)').run(uuidv4(), group.id, userId);

  res.json({ id: group.id, name: group.name, inviteCode: group.invite_code });
});

// GET /api/groups/user/:userId - get groups for a user
router.get('/user/:userId', (req, res) => {
  const db = getDb();
  const groups = db.prepare(`
    SELECT g.id, g.name, g.invite_code, g.created_by,
      (SELECT COUNT(*) FROM group_members gm2 WHERE gm2.group_id = g.id) as member_count
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
    ORDER BY g.created_at DESC
  `).all(req.params.userId);
  res.json(groups);
});

// GET /api/groups/:id/leaderboard
router.get('/:id/leaderboard', (req, res) => {
  const db = getDb();

  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const leaderboard = db.prepare(`
    SELECT
      u.id,
      u.username,
      u.supported_team,
      COALESCE(SUM(p.points), 0) as total_points,
      COUNT(CASE WHEN p.points = 3 THEN 1 END) as exact_scores,
      COUNT(CASE WHEN p.points = 1 THEN 1 END) as correct_winners,
      COUNT(p.id) as total_predictions
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    LEFT JOIN predictions p ON u.id = p.user_id
    WHERE gm.group_id = ?
    GROUP BY u.id, u.username, u.supported_team
    ORDER BY total_points DESC, exact_scores DESC, u.username ASC
  `).all(req.params.id);

  res.json({ group: { id: group.id, name: group.name, inviteCode: group.invite_code }, leaderboard });
});

// GET /api/groups/:id/predictions/:matchId
router.get('/:id/predictions/:matchId', (req, res) => {
  const db = getDb();

  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  // Only show predictions if match has started (live or finished)
  const showPredictions = match.status === 'live' || match.status === 'finished';

  if (!showPredictions) {
    // Return who has predicted but not scores
    const members = db.prepare(`
      SELECT u.id, u.username, u.supported_team,
        CASE WHEN p.id IS NOT NULL THEN 1 ELSE 0 END as has_predicted
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      LEFT JOIN predictions p ON u.id = p.user_id AND p.match_id = ?
      WHERE gm.group_id = ?
    `).all(req.params.matchId, req.params.id);

    return res.json({ revealed: false, match, members });
  }

  // Show all predictions
  const predictions = db.prepare(`
    SELECT u.id as user_id, u.username, u.supported_team,
      p.home_goals, p.away_goals, p.points
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    LEFT JOIN predictions p ON u.id = p.user_id AND p.match_id = ?
    WHERE gm.group_id = ?
    ORDER BY COALESCE(p.points, -1) DESC, u.username ASC
  `).all(req.params.matchId, req.params.id);

  res.json({ revealed: true, match, predictions });
});

// GET /api/groups/:id - get group info
router.get('/:id', (req, res) => {
  const db = getDb();
  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const members = db.prepare(`
    SELECT u.id, u.username, u.supported_team
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
  `).all(req.params.id);

  res.json({ id: group.id, name: group.name, inviteCode: group.invite_code, createdBy: group.created_by, members });
});

module.exports = router;
