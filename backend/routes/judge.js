const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, judgeOnly } = require('../middleware/auth');

// All judge routes require authentication and judge role
router.use(authMiddleware, judgeOnly);

// =========================
// GET ALL SUBMISSIONS
// =========================
router.get('/submissions', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT s.*, t.team_name, t.team_id, qb.question_text, qb.question_type, qb.correct_answer
             FROM submissions s
             JOIN teams t ON s.team_id = t.id
             JOIN question_bank qb ON s.question_id = qb.id
             ORDER BY s.submitted_at DESC`
        );

        res.json({ submissions: result.rows });
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

/* =========================
   GET ROUND CONFIG (MISSING FIX)
   ========================= */
router.get('/config', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM round_config LIMIT 1'
        );

        res.json({
            config: result.rows[0] || {
                round_state: 'LOCKED',
                is_locked: 0
            }
        });
    } catch (error) {
        console.error('Get config error:', error);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

/* =========================
   START ROUND (FIXED)
   ========================= */
router.post('/round/start', async (req, res) => {
    try {
        // 1️⃣ Ensure exactly ONE round_config row exists
        const configCheck = await db.query(
            'SELECT id FROM round_config LIMIT 1'
        );

        if (configCheck.rows.length === 0) {
            await db.query(`
                INSERT INTO round_config (round_state, is_locked)
                VALUES ('LOCKED', 0)
            `);
        }

        // 2️⃣ Initialize / reset team_state
        const teamsResult = await db.query('SELECT id FROM teams');
        const teams = teamsResult.rows;

        for (const team of teams) {
            await db.query(`
                INSERT INTO team_state (team_id, total_score, started_at, is_completed)
                VALUES ($1, 0, CURRENT_TIMESTAMP, false)
                ON CONFLICT (team_id)
                DO UPDATE SET
                    total_score = 0,
                    started_at = CURRENT_TIMESTAMP,
                    is_completed = false
            `, [team.id]);

            // Assign questions ONCE
            const assignedCheck = await db.query(
                'SELECT COUNT(*) FROM team_questions WHERE team_id = $1',
                [team.id]
            );

            if (parseInt(assignedCheck.rows[0].count) === 0) {
                const randomSet = Math.floor(Math.random() * 7) + 1;

                const questionsResult = await db.query(
                    'SELECT id FROM question_bank WHERE question_set_id = $1 ORDER BY id LIMIT 7',
                    [randomSet]
                );

                for (let i = 0; i < questionsResult.rows.length; i++) {
                    await db.query(
                        `INSERT INTO team_questions (team_id, question_id, question_position)
                         VALUES ($1, $2, $3)`,
                        [team.id, questionsResult.rows[i].id, i + 1]
                    );
                }
            }
        }

        // 3️⃣ Activate round (SAFE UPDATE)
        await db.query(`
            UPDATE round_config
            SET round_state = 'ACTIVE',
                is_locked = true,
                updated_at = CURRENT_TIMESTAMP
        `);

        res.json({
            success: true,
            message: 'Round started successfully',
            teamsInitialized: teams.length
        });
    } catch (error) {
        console.error('❌ Start round error:', error);
        res.status(500).json({ error: 'Failed to start round' });
    }
});


/* =========================
   ROUND COMPLETE
   ========================= */
router.post('/round/complete', async (req, res) => {
    try {
        await db.query(`
            UPDATE round_config
            SET round_state = 'COMPLETED',
                updated_at = CURRENT_TIMESTAMP
        `);

        res.json({ success: true, message: 'Round completed' });
    } catch (error) {
        console.error('Complete round error:', error);
        res.status(500).json({ error: 'Failed to complete round' });
    }
});

/* =========================
   ROUND RESET
   ========================= */
router.post('/round/reset', async (req, res) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Order matters because of FK constraints
        await client.query('DELETE FROM submissions');
        await client.query('DELETE FROM question_time_tracking');
        await client.query('DELETE FROM leaderboard');
        await client.query('DELETE FROM team_state');

        await client.query(`
            UPDATE round_config
            SET
                round_state = 'LOCKED',
                is_locked = false,
                updated_at = CURRENT_TIMESTAMP
        `);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Round reset successfully'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Reset round error:', error);

        res.status(500).json({
            error: 'Failed to reset round',
            details: error.message
        });
    } finally {
        client.release();
    }
});


/* =========================
   DASHBOARD STATS (MAIN)
   ========================= */
router.get('/dashboard/stats', async (req, res) => {
    try {
        const configResult = await db.query('SELECT * FROM round_config LIMIT 1');
        const teamsResult = await db.query('SELECT COUNT(*) FROM teams');
        const completedResult = await db.query('SELECT COUNT(*) FROM team_state WHERE is_completed = true');
        const submissionsResult = await db.query('SELECT COUNT(*) FROM submissions');

        res.json({
            roundState: configResult.rows[0]?.round_state || 'LOCKED',
            totalTeams: parseInt(teamsResult.rows[0].count),
            completedTeams: parseInt(completedResult.rows[0].count),
            totalSubmissions: parseInt(submissionsResult.rows[0].count)
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

/* =========================
   ✅ FRONTEND COMPATIBILITY
   DO NOT REMOVE
   ========================= */
router.get('/stats', async (req, res) => {
    try {
        const configResult = await db.query('SELECT * FROM round_config LIMIT 1');
        const teamsResult = await db.query('SELECT COUNT(*) FROM teams');
        const completedResult = await db.query('SELECT COUNT(*) FROM team_state WHERE is_completed = true');
        const submissionsResult = await db.query('SELECT COUNT(*) FROM submissions');

        res.json({
            roundState: configResult.rows[0]?.round_state || 'LOCKED',
            totalTeams: parseInt(teamsResult.rows[0].count),
            completedTeams: parseInt(completedResult.rows[0].count),
            totalSubmissions: parseInt(submissionsResult.rows[0].count)
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
