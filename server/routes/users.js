const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/schema');

// POST /api/users/register
router.post('/register', (req, res) => {
  const { username, supportedTeam } = req.body;

  if (!username || !supportedTeam) {
    return res.status(400).json({ error: 'Username and supported team are required' });
  }

  const trimmed = username.trim();
  if (trimmed.length < 2 || trimmed.length > 20) {
    return res.status(400).json({ error: 'Username must be 2-20 characters' });
  }

  const db = getDb();

  // Check if username already exists
  const existing = db.prepare('SELECT id, username, supported_team FROM users WHERE LOWER(username) = LOWER(?)').get(trimmed);
  if (existing) {
    // Return existing user (auto-login with same name)
    return res.json({
      id: existing.id,
      username: existing.username,
      supportedTeam: existing.supported_team,
    });
  }

  const id = uuidv4();
  db.prepare('INSERT INTO users (id, username, supported_team) VALUES (?, ?, ?)').run(id, trimmed, supportedTeam);

  res.status(201).json({ id, username: trimmed, supportedTeam });
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, supported_team FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, username: user.username, supportedTeam: user.supported_team });
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  const { username, supportedTeam } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newUsername = username ? username.trim() : user.username;
  const newTeam = supportedTeam || user.supported_team;

  if (newUsername.length < 2 || newUsername.length > 20) {
    return res.status(400).json({ error: 'Username must be 2-20 characters' });
  }

  if (newUsername !== user.username) {
    const taken = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?').get(newUsername, req.params.id);
    if (taken) return res.status(409).json({ error: 'Username already taken' });
  }

  db.prepare('UPDATE users SET username = ?, supported_team = ? WHERE id = ?').run(newUsername, newTeam, req.params.id);
  res.json({ id: req.params.id, username: newUsername, supportedTeam: newTeam });
});

module.exports = router;
