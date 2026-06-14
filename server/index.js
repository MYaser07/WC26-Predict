const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db/schema');

const usersRouter       = require('./routes/users');
const matchesRouter     = require('./routes/matches');
const predictionsRouter = require('./routes/predictions');
const leaderboardRouter = require('./routes/leaderboard');
const groupsRouter      = require('./routes/groups');
const adminRouter       = require('./routes/admin');
const standingsRouter   = require('./routes/standings');

const app  = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

initDb();

// API routes
app.use('/api/users',       usersRouter);
app.use('/api/matches',     matchesRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/groups',      groupsRouter);
app.use('/api/admin',       adminRouter);
app.use('/api/standings',   standingsRouter);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Serve React app in production
if (isProd) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 WC26 server running on port ${PORT} [${isProd ? 'production' : 'development'}]`);
});
