const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, judgeOnly } = require('../middleware/auth');

// All judge routes require authentication and judge role
router.use(authMiddleware, judgeOnly);

/* =========================
   GET ALL SUBMISSIONS
   ========================= */
router.get('/submissions', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT s.*, t.team_name,
                   qb.question_text, qb.question_type, qb.correct_answer
            FROM submissions s
            JOIN teams t ON s.team_id = t.id
            JOIN question_bank qb ON s.question_id = qb.id
            ORDER BY s.submitted_at DESC
        `);

        res.json({ submissions: result.rows });
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

/* =========================
   GET ROUND CONFIG (SINGLE ROW)
   ========================= */
router.get('/config', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT *
            FROM round_config
            ORDER BY id ASC
            LIMIT 1
        `);

        res.json({
            config: result.rows[0] || {
                round_state: 'LOCKED',
                is_locked: false
            }
        });
    } catch (error) {
        console.error('Get config error:', error);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

/* =========================
   START ROUND (SAFE + FULL RESET)
   ========================= */
router.post('/round/start', async (req, res) => {
    try {
        // Ensure round_config exists
        const configCheck = await db.query(
            'SELECT id FROM round_config ORDER BY id ASC LIMIT 1'
        );

        if (configCheck.rows.length === 0) {
            await db.query(`
                INSERT INTO round_config (round_state, is_locked)
                VALUES ('LOCKED', false)
            `);
        }

        const teamsResult = await db.query('SELECT id FROM teams');

        for (const team of teamsResult.rows) {
            // Reset team state (FULL RESET)
            await db.query(`
                INSERT INTO team_state (
                    team_id,
                    total_score,
                    started_at,
                    is_completed,
                    wrong_answer_count,
                    current_question_position,
                    question_set_number
                )
                VALUES ($1, 0, CURRENT_TIMESTAMP, false, 0, 1, 1)
                ON CONFLICT (team_id)
                DO UPDATE SET
                    total_score = 0,
                    started_at = CURRENT_TIMESTAMP,
                    is_completed = false,
                    wrong_answer_count = 0,
                    current_question_position = 1,
                    question_set_number = 1
            `, [team.id]);

            // 🔴 CRITICAL: clear old question assignments
            await db.query(
                'DELETE FROM team_questions WHERE team_id = $1',
                [team.id]
            );

            // Assign fresh questions
            const randomSet = Math.floor(Math.random() * 7) + 1;

            const questionsResult = await db.query(`
                SELECT id
                FROM question_bank
                WHERE question_set_id = $1
                ORDER BY id
                LIMIT 7
            `, [randomSet]);

            for (let i = 0; i < questionsResult.rows.length; i++) {
                await db.query(`
                    INSERT INTO team_questions (team_id, question_id, question_position)
                    VALUES ($1, $2, $3)
                `, [team.id, questionsResult.rows[i].id, i + 1]);
            }
        }

        // Activate round (single source of truth)
        await db.query(`
            UPDATE round_config
            SET round_state = 'ACTIVE',
                is_locked = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = (
                SELECT id
                FROM round_config
                ORDER BY id ASC
                LIMIT 1
            )
        `);

        res.json({
            success: true,
            message: 'Round started successfully',
            teamsInitialized: teamsResult.rows.length
        });
    } catch (error) {
        console.error('❌ Start round error:', error);
        res.status(500).json({ error: 'Failed to start round' });
    }
});

/* =========================
   COMPLETE ROUND
   ========================= */
router.post('/round/complete', async (req, res) => {
    try {
        await db.query(`
            UPDATE round_config
            SET round_state = 'COMPLETED',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = (
                SELECT id
                FROM round_config
                ORDER BY id ASC
                LIMIT 1
            )
        `);

        res.json({ success: true, message: 'Round completed' });
    } catch (error) {
        console.error('Complete round error:', error);
        res.status(500).json({ error: 'Failed to complete round' });
    }
});

/* =========================
   RESET ROUND (FULL RESET)
   ========================= */
router.post('/round/reset', async (req, res) => {
    try {
        await db.query('BEGIN');

        await db.query('DELETE FROM submissions');
        await db.query('DELETE FROM question_time_tracking');
        await db.query('DELETE FROM leaderboard');
        await db.query('DELETE FROM team_state');
        await db.query('DELETE FROM team_questions');

        await db.query(`
            UPDATE round_config
            SET round_state = 'LOCKED',
                is_locked = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = (
                SELECT id
                FROM round_config
                ORDER BY id ASC
                LIMIT 1
            )
        `);

        await db.query('COMMIT');

        res.json({ success: true, message: 'Round reset successfully' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('❌ Reset round error:', error);
        res.status(500).json({
            error: 'Failed to reset round',
            details: error.message
        });
    }
});

/* =========================
   DASHBOARD STATS
   ========================= */
// =========================
// PARTICIPANT STATUS (🔥 REQUIRED)
// =========================
router.get('/status', async (req, res) => {
    try {
        const teamId = req.user.userId;

        const configResult = await db.query(`
            SELECT round_state
            FROM round_config
            ORDER BY id ASC
            LIMIT 1
        `);

        const roundState = configResult.rows[0]?.round_state || 'LOCKED';

        const stateResult = await db.query(
            'SELECT * FROM team_state WHERE team_id = $1',
            [teamId]
        );

        const teamState = stateResult.rows[0];

        res.json({
            // 🔥 FRONTEND EXPECTS THIS
            status: roundState,

            // Extra info
            roundState,
            currentQuestion: teamState?.current_question_position || 1,
            totalQuestions: 7,
            isCompleted: teamState?.is_completed || false,
            wrongAnswerCount: teamState?.wrong_answer_count || 0,
            canProceed: true
        });
    } catch (error) {
        console.error('Participant status error:', error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});


module.exports = router;
