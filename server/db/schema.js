const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/predict_win.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      supported_team TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      competition TEXT NOT NULL,
      match_time DATETIME NOT NULL,
      status TEXT DEFAULT 'upcoming',
      home_score INTEGER,
      away_score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      match_id TEXT NOT NULL,
      home_goals INTEGER NOT NULL,
      away_goals INTEGER NOT NULL,
      points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (match_id) REFERENCES matches(id),
      UNIQUE(user_id, match_id)
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      invite_code TEXT UNIQUE NOT NULL,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS group_members (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(group_id, user_id)
    );
  `);

  // Seed matches if none exist
  const matchCount = database.prepare('SELECT COUNT(*) as count FROM matches').get();
  if (matchCount.count === 0) {
    const insertMatch = database.prepare(`
      INSERT INTO matches (id, home_team, away_team, competition, match_time, status)
      VALUES (?, ?, ?, ?, ?, 'upcoming')
    `);

    const seedMatches = [
      // ── GROUP STAGE ──
      // June 14
      [uuidv4(), '🇩🇪 Germany',      '🇨🇼 Curaçao',         'World Cup 2026 · Group E',  '2026-06-14 19:00:00'],
      [uuidv4(), '🇨🇮 Ivory Coast',  '🇪🇨 Ecuador',         'World Cup 2026 · Group E',  '2026-06-15 00:00:00'],
      [uuidv4(), '🇳🇱 Netherlands',  '🇯🇵 Japan',           'World Cup 2026 · Group F',  '2026-06-14 21:00:00'],
      [uuidv4(), '🇸🇪 Sweden',       '🇹🇳 Tunisia',         'World Cup 2026 · Group F',  '2026-06-15 02:00:00'],
      // June 15
      [uuidv4(), '🇪🇸 Spain',        '🇨🇻 Cape Verde',      'World Cup 2026 · Group H',  '2026-06-15 19:00:00'],
      [uuidv4(), '🇸🇦 Saudi Arabia', '🇺🇾 Uruguay',         'World Cup 2026 · Group H',  '2026-06-16 01:00:00'],
      [uuidv4(), '🇧🇪 Belgium',      '🇪🇬 Egypt',           'World Cup 2026 · Group G',  '2026-06-15 21:00:00'],
      [uuidv4(), '🇮🇷 Iran',         '🇳🇿 New Zealand',     'World Cup 2026 · Group G',  '2026-06-16 02:00:00'],
      // June 16
      [uuidv4(), '🇫🇷 France',       '🇸🇳 Senegal',         'World Cup 2026 · Group I',  '2026-06-16 20:00:00'],
      [uuidv4(), '🇮🇶 Iraq',         '🇳🇴 Norway',          'World Cup 2026 · Group I',  '2026-06-17 01:00:00'],
      [uuidv4(), '🇦🇷 Argentina',    '🇩🇿 Algeria',         'World Cup 2026 · Group J',  '2026-06-17 02:00:00'],
      [uuidv4(), '🇦🇹 Austria',      '🇯🇴 Jordan',          'World Cup 2026 · Group J',  '2026-06-17 02:00:00'],
      // June 17
      [uuidv4(), '🇵🇹 Portugal',     '🇨🇩 DR Congo',        'World Cup 2026 · Group K',  '2026-06-17 19:00:00'],
      [uuidv4(), '🇺🇿 Uzbekistan',   '🇨🇴 Colombia',        'World Cup 2026 · Group K',  '2026-06-18 02:00:00'],
      [uuidv4(), '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',   '🇭🇷 Croatia',         'World Cup 2026 · Group L',  '2026-06-17 21:00:00'],
      [uuidv4(), '🇬🇭 Ghana',        '🇵🇦 Panama',          'World Cup 2026 · Group L',  '2026-06-18 00:00:00'],
      // June 18
      [uuidv4(), '🇨🇿 Czechia',      '🇿🇦 South Africa',    'World Cup 2026 · Group A',  '2026-06-18 19:00:00'],
      [uuidv4(), '🇲🇽 Mexico',       '🇰🇷 South Korea',     'World Cup 2026 · Group A',  '2026-06-19 01:00:00'],
      [uuidv4(), '🇨🇭 Switzerland',  '🇧🇦 Bosnia-Herzegovina','World Cup 2026 · Group B','2026-06-18 21:00:00'],
      [uuidv4(), '🇨🇦 Canada',       '🇶🇦 Qatar',           'World Cup 2026 · Group B',  '2026-06-19 02:00:00'],
      // June 19
      [uuidv4(), '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland',    '🇲🇦 Morocco',         'World Cup 2026 · Group C',  '2026-06-19 23:00:00'],
      [uuidv4(), '🇧🇷 Brazil',       '🇭🇹 Haiti',           'World Cup 2026 · Group C',  '2026-06-20 01:30:00'],
      [uuidv4(), '🇺🇸 USA',          '🇦🇺 Australia',       'World Cup 2026 · Group D',  '2026-06-19 21:00:00'],
      [uuidv4(), '🇹🇷 Türkiye',      '🇵🇾 Paraguay',        'World Cup 2026 · Group D',  '2026-06-20 02:00:00'],
      // June 20
      [uuidv4(), '🇩🇪 Germany',      '🇨🇮 Ivory Coast',     'World Cup 2026 · Group E',  '2026-06-20 22:00:00'],
      [uuidv4(), '🇪🇨 Ecuador',      '🇨🇼 Curaçao',         'World Cup 2026 · Group E',  '2026-06-21 01:00:00'],
      [uuidv4(), '🇳🇱 Netherlands',  '🇸🇪 Sweden',          'World Cup 2026 · Group F',  '2026-06-20 19:00:00'],
      [uuidv4(), '🇯🇵 Japan',        '🇹🇳 Tunisia',         'World Cup 2026 · Group F',  '2026-06-21 04:00:00'],
      // June 21
      [uuidv4(), '🇪🇸 Spain',        '🇸🇦 Saudi Arabia',    'World Cup 2026 · Group H',  '2026-06-21 19:00:00'],
      [uuidv4(), '🇺🇾 Uruguay',      '🇨🇻 Cape Verde',      'World Cup 2026 · Group H',  '2026-06-22 01:00:00'],
      [uuidv4(), '🇧🇪 Belgium',      '🇮🇷 Iran',            'World Cup 2026 · Group G',  '2026-06-21 21:00:00'],
      [uuidv4(), '🇳🇿 New Zealand',  '🇪🇬 Egypt',           'World Cup 2026 · Group G',  '2026-06-22 02:00:00'],
      // June 22
      [uuidv4(), '🇦🇷 Argentina',    '🇦🇹 Austria',         'World Cup 2026 · Group J',  '2026-06-22 19:00:00'],
      [uuidv4(), '🇩🇿 Algeria',      '🇯🇴 Jordan',          'World Cup 2026 · Group J',  '2026-06-23 01:00:00'],
      [uuidv4(), '🇫🇷 France',       '🇮🇶 Iraq',            'World Cup 2026 · Group I',  '2026-06-22 23:00:00'],
      [uuidv4(), '🇳🇴 Norway',       '🇸🇳 Senegal',         'World Cup 2026 · Group I',  '2026-06-23 02:00:00'],
      // June 23
      [uuidv4(), '🇵🇹 Portugal',     '🇺🇿 Uzbekistan',      'World Cup 2026 · Group K',  '2026-06-23 19:00:00'],
      [uuidv4(), '🇨🇴 Colombia',     '🇨🇩 DR Congo',        'World Cup 2026 · Group K',  '2026-06-24 02:00:00'],
      [uuidv4(), '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',   '🇬🇭 Ghana',           'World Cup 2026 · Group L',  '2026-06-23 22:00:00'],
      [uuidv4(), '🇵🇦 Panama',       '🇭🇷 Croatia',         'World Cup 2026 · Group L',  '2026-06-24 01:00:00'],
      // June 24 - Decisive matches
      [uuidv4(), '🇨🇿 Czechia',      '🇲🇽 Mexico',          'World Cup 2026 · Group A',  '2026-06-24 23:00:00'],
      [uuidv4(), '🇿🇦 South Africa', '🇰🇷 South Korea',     'World Cup 2026 · Group A',  '2026-06-24 23:00:00'],
      [uuidv4(), '🇨🇭 Switzerland',  '🇨🇦 Canada',          'World Cup 2026 · Group B',  '2026-06-25 01:00:00'],
      [uuidv4(), '🇧🇦 Bosnia-Herzegovina','🇶🇦 Qatar',       'World Cup 2026 · Group B',  '2026-06-25 01:00:00'],
      [uuidv4(), '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland',    '🇧🇷 Brazil',          'World Cup 2026 · Group C',  '2026-06-25 00:00:00'],
      [uuidv4(), '🇲🇦 Morocco',      '🇭🇹 Haiti',           'World Cup 2026 · Group C',  '2026-06-25 00:00:00'],
      // June 25
      [uuidv4(), '🇩🇪 Germany',      '🇪🇨 Ecuador',         'World Cup 2026 · Group E',  '2026-06-25 22:00:00'],
      [uuidv4(), '🇨🇼 Curaçao',      '🇨🇮 Ivory Coast',     'World Cup 2026 · Group E',  '2026-06-25 22:00:00'],
      [uuidv4(), '🇳🇱 Netherlands',  '🇹🇳 Tunisia',         'World Cup 2026 · Group F',  '2026-06-26 00:00:00'],
      [uuidv4(), '🇯🇵 Japan',        '🇸🇪 Sweden',          'World Cup 2026 · Group F',  '2026-06-26 00:00:00'],
      [uuidv4(), '🇺🇸 USA',          '🇹🇷 Türkiye',         'World Cup 2026 · Group D',  '2026-06-26 02:00:00'],
      [uuidv4(), '🇵🇾 Paraguay',     '🇦🇺 Australia',       'World Cup 2026 · Group D',  '2026-06-26 02:00:00'],
      // June 26
      [uuidv4(), '🇫🇷 France',       '🇳🇴 Norway',          'World Cup 2026 · Group I',  '2026-06-26 21:00:00'],
      [uuidv4(), '🇸🇳 Senegal',      '🇮🇶 Iraq',            'World Cup 2026 · Group I',  '2026-06-26 21:00:00'],
      [uuidv4(), '🇪🇸 Spain',        '🇺🇾 Uruguay',         'World Cup 2026 · Group H',  '2026-06-27 00:00:00'],
      [uuidv4(), '🇨🇻 Cape Verde',   '🇸🇦 Saudi Arabia',    'World Cup 2026 · Group H',  '2026-06-27 00:00:00'],
      [uuidv4(), '🇧🇪 Belgium',      '🇳🇿 New Zealand',     'World Cup 2026 · Group G',  '2026-06-27 01:00:00'],
      [uuidv4(), '🇪🇬 Egypt',        '🇮🇷 Iran',            'World Cup 2026 · Group G',  '2026-06-27 01:00:00'],
      // June 27
      [uuidv4(), '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',   '🇵🇦 Panama',          'World Cup 2026 · Group L',  '2026-06-27 22:00:00'],
      [uuidv4(), '🇭🇷 Croatia',      '🇬🇭 Ghana',           'World Cup 2026 · Group L',  '2026-06-27 22:00:00'],
      [uuidv4(), '🇵🇹 Portugal',     '🇨🇴 Colombia',        'World Cup 2026 · Group K',  '2026-06-28 00:30:00'],
      [uuidv4(), '🇨🇩 DR Congo',     '🇺🇿 Uzbekistan',      'World Cup 2026 · Group K',  '2026-06-28 00:30:00'],
      [uuidv4(), '🇦🇷 Argentina',    '🇯🇴 Jordan',          'World Cup 2026 · Group J',  '2026-06-28 02:00:00'],
      [uuidv4(), '🇩🇿 Algeria',      '🇦🇹 Austria',         'World Cup 2026 · Group J',  '2026-06-28 02:00:00'],
      // ── KNOCKOUT ──
      [uuidv4(), '🏆 R32 TBD',      '🏆 R32 TBD',          'World Cup 2026 · Round of 32', '2026-06-28 19:00:00'],
      [uuidv4(), '🏆 R32 TBD',      '🏆 R32 TBD',          'World Cup 2026 · Round of 32', '2026-06-29 00:00:00'],
      [uuidv4(), '🏆 R32 TBD',      '🏆 R32 TBD',          'World Cup 2026 · Round of 32', '2026-06-29 19:00:00'],
      [uuidv4(), '🏆 R32 TBD',      '🏆 R32 TBD',          'World Cup 2026 · Round of 32', '2026-06-30 00:00:00'],
      [uuidv4(), '🏆 R16 TBD',      '🏆 R16 TBD',          'World Cup 2026 · Round of 16', '2026-07-04 19:00:00'],
      [uuidv4(), '🏆 R16 TBD',      '🏆 R16 TBD',          'World Cup 2026 · Round of 16', '2026-07-05 00:00:00'],
      [uuidv4(), '🏆 QF TBD',       '🏆 QF TBD',           'World Cup 2026 · Quarter-Final','2026-07-09 19:00:00'],
      [uuidv4(), '🏆 QF TBD',       '🏆 QF TBD',           'World Cup 2026 · Quarter-Final','2026-07-10 19:00:00'],
      [uuidv4(), '🏆 SF TBD',       '🏆 SF TBD',           'World Cup 2026 · Semi-Final',  '2026-07-14 02:00:00'],
      [uuidv4(), '🏆 SF TBD',       '🏆 SF TBD',           'World Cup 2026 · Semi-Final',  '2026-07-15 02:00:00'],
      [uuidv4(), '🥉 3rd Place TBD','🥉 3rd Place TBD',    'World Cup 2026 · 3rd Place',   '2026-07-18 19:00:00'],
      [uuidv4(), '🏆 FINAL TBD',    '🏆 FINAL TBD',        'World Cup 2026 · 🏆 FINAL 🏆', '2026-07-19 20:00:00'],
    ];

    const insertMany = database.transaction((matches) => {
      for (const match of matches) {
        insertMatch.run(...match);
      }
    });

    insertMany(seedMatches);
    console.log('✅ Seeded 5 sample matches');
  }

  console.log('✅ Database initialized');
  return database;
}

module.exports = { getDb, initDb };
