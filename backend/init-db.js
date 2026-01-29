const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const initDb = async () => {
  try {
    console.log('🗄️  Initializing PostgreSQL database...\n');

    /* =========================
       CREATE TABLES
       ========================= */

    await query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        team_id TEXT UNIQUE NOT NULL,
        team_name TEXT NOT NULL,
        access_token TEXT UNIQUE NOT NULL,
        is_dummy BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS judges (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS round_config (
        id INTEGER PRIMARY KEY,
        round_state TEXT DEFAULT 'LOCKED',
        mcq_correct_points INTEGER DEFAULT 10,
        descriptive_max_points INTEGER DEFAULT 15,
        wrong_answer_penalty INTEGER DEFAULT -5,
        three_wrong_penalty INTEGER DEFAULT -20,
        is_locked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS question_bank (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        options TEXT,
        correct_answer TEXT,
        max_points INTEGER DEFAULT 15,
        difficulty TEXT,
        question_set_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS team_questions (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id),
        question_id INTEGER REFERENCES question_bank(id),
        question_position INTEGER,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, question_position)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id),
        question_id INTEGER REFERENCES question_bank(id),
        question_position INTEGER,
        answer_text TEXT NOT NULL,
        is_correct BOOLEAN,
        points_awarded INTEGER DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        evaluated_at TIMESTAMP,
        evaluated_by INTEGER REFERENCES judges(id)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS team_state (
        id SERIAL PRIMARY KEY,
        team_id INTEGER UNIQUE REFERENCES teams(id),
        current_question_position INTEGER DEFAULT 1,
        total_score INTEGER DEFAULT 0,
        wrong_answer_count INTEGER DEFAULT 0,
        question_set_number INTEGER DEFAULT 1,
        is_completed BOOLEAN DEFAULT FALSE,
        started_at TIMESTAMP,
        completed_at TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS question_time_tracking (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id),
        question_position INTEGER,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        team_id INTEGER UNIQUE REFERENCES teams(id),
        final_score INTEGER NOT NULL,
        manual_rank INTEGER,
        notes TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tables ensured\n');

    /* =========================
       SEED JUDGES
       ========================= */

    const pass = bcrypt.hashSync('admin123', 10);

    await query(
      `INSERT INTO judges (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO NOTHING`,
      ['admin', pass]
    );

    await query(
      `INSERT INTO judges (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO NOTHING`,
      ['judge1', pass]
    );

    console.log('✅ Judges seeded\n');

    /* =========================
       SEED TEAMS
       ========================= */

    const realTeams = [
      ['TEAM_BB', 'Binary Brains', 'TEAM_BB001_2026', false],
      ['TEAM_TI', 'Three Idiots', 'TEAM_TI002_2026', false],
      ['TEAM_E404', 'Error 404 (brain not found)', 'TEAM_E404003_2026', false],
      ['TEAM_DUO', 'Duo', 'TEAM_DUO004_2026', false],
      ['TEAM_TL', 'Trinetra Legion', 'TEAM_TL005_2026', false],
      ['TEAM_CF', 'cat food', 'TEAM_CF006_2026', false],
      ['TEAM_CGPT', 'team chatgpt', 'TEAM_CGPT007_2026', false],
      ['TEAM_IX', 'Innovation X', 'TEAM_IX008_2026', false],
      ['TEAM_TF', 'Twin Flames', 'TEAM_TF009_2026', false],
      ['TEAM_TJ', 'The Jacks', 'TEAM_TJ010_2026', false],
      ['TEAM_MV', 'ManasVerse', 'TEAM_MV011_2026', false],
      ['TEAM_LL', 'Logic Labs', 'TEAM_LL012_2026', false],
      ['TEAM_HW', 'hello world', 'TEAM_HW013_2026', false],
      ['TEAM_XU', 'Xavier uncle', 'TEAM_XU014_2026', false],
      ['TEAM_T3', 'Team Teen Tandav - T^3', 'TEAM_T3015_2026', false],
      ['TEAM_MS', 'Mini Sena', 'TEAM_MS016_2026', false]
    ];

    const dummyTeams = [
      ['DUMMY_01', 'DUMMY_TEAM_1', 'DUMMY_TEST_001_2026', true],
      ['DUMMY_02', 'DUMMY_TEAM_2', 'DUMMY_TEST_002_2026', true],
      ['DUMMY_03', 'DUMMY_TEAM_3', 'DUMMY_TEST_003_2026', true],
      ['DUMMY_04', 'DUMMY_TEAM_4', 'DUMMY_TEST_004_2026', true],
      ['DUMMY_05', 'DUMMY_TEAM_5', 'DUMMY_TEST_005_2026', true],
      ['DUMMY_06', 'DUMMY_TEAM_6', 'DUMMY_TEST_006_2026', true],
      ['DUMMY_07', 'DUMMY_TEAM_7', 'DUMMY_TEST_007_2026', true],
      ['DUMMY_08', 'DUMMY_TEAM_8', 'DUMMY_TEST_008_2026', true]
    ];

    for (const t of [...realTeams, ...dummyTeams]) {
      await query(
        `INSERT INTO teams (team_id, team_name, access_token, is_dummy)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (team_id) DO NOTHING`,
        t
      );
    }

    console.log('✅ 24 teams seeded\n');

    /* =========================
       ROUND CONFIG
       ========================= */

    await query(
      `INSERT INTO round_config (id, round_state)
       VALUES (1, 'LOCKED')
       ON CONFLICT (id) DO NOTHING`
    );

    console.log('🎉 Database ready\n');

  } catch (err) {
    console.error('❌ init-db failed:', err);
  }
};

module.exports = initDb;
