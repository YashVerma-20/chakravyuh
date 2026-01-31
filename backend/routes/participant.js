const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// All participant routes require authentication
router.use(authMiddleware);

/* =====================================================
   PARTICIPANT STATUS (🔥 REQUIRED BY FRONTEND)
   ===================================================== */
router.get('/status', async (req, res) => {
    try {
        const teamId = req.user.userId;

        // Get round state (SINGLE SOURCE OF TRUTH)
        const configResult = await db.query(`
            SELECT round_state 
            FROM round_config 
            ORDER BY id ASC 
            LIMIT 1
        `);

        const roundState = configResult.rows[0]?.round_state || 'LOCKED';

        // Team state
        const stateResult = await db.query(
            'SELECT * FROM team_state WHERE team_id = $1',
            [teamId]
        );
        const teamState = stateResult.rows[0];

        let canProceed = true;

        if (teamState) {
            const pending = await db.query(
                `SELECT 1 
                 FROM submissions 
                 WHERE team_id = $1 
                 AND question_position = $2 
                 AND evaluated_at IS NULL 
                 LIMIT 1`,
                [teamId, teamState.current_question_position]
            );
            canProceed = pending.rows.length === 0;
        }

        res.json({
            // 🔥 THIS FIELD IS WHAT FIXES YOUR UI
            status: roundState,

            // additional info
            roundState,
            currentQuestion: teamState?.current_question_position || 1,
            totalQuestions: 7,
            isCompleted: teamState?.is_completed || false,
            wrongAnswerCount: teamState?.wrong_answer_count || 0,
            canProceed
        });
    } catch (error) {
        console.error('Participant status error:', error);
        res.status(500).json({ error: 'Failed to fetch participant status' });
    }
});

/* =====================================================
   GET CURRENT QUESTION (CRASH PROOF VERSION)
   ===================================================== */
router.get('/question/current', async (req, res) => {
    try {
        const teamId = req.user.userId;

        // 1. Check Round State
        const configResult = await db.query('SELECT round_state FROM round_config LIMIT 1');
        const roundState = configResult.rows[0]?.round_state || 'LOCKED';

        if (roundState !== 'ACTIVE') {
            return res.json({ status: roundState });
        }

        // 2. Ensure Team State Exists
        let stateResult = await db.query(
            'SELECT * FROM team_state WHERE team_id = $1',
            [teamId]
        );

        if (stateResult.rows.length === 0) {
            await db.query(
                `INSERT INTO team_state 
                 (team_id, current_question_position, started_at, is_completed, wrong_answer_count, total_score)
                 VALUES ($1, 1, CURRENT_TIMESTAMP, false, 0, 0)`,
                [teamId]
            );
            stateResult = await db.query(
                'SELECT * FROM team_state WHERE team_id = $1',
                [teamId]
            );
        }

        const teamState = stateResult.rows[0];

        if (teamState.is_completed) {
            return res.json({ status: 'COMPLETED' });
        }

        // 3. Fetch Question (Safely)
        const questionResult = await db.query(
            `SELECT qb.id, qb.question_text, qb.question_type, qb.options, qb.max_points
             FROM team_questions tq
             JOIN question_bank qb ON tq.question_id = qb.id
             WHERE tq.team_id = $1 AND tq.question_position = $2`,
            [teamId, teamState.current_question_position]
        );

        // 🔥 FIX: Handle case where no question is assigned (prevents crash)
        if (questionResult.rows.length === 0) {
            console.error(`⚠️ No question found for Team ${teamId} at position ${teamState.current_question_position}`);
            return res.json({ 
                status: 'WAITING', 
                message: 'Questions are being assigned. Please contact the judge.' 
            });
        }

        const question = questionResult.rows[0];

        res.json({
            status: 'ACTIVE',
            currentQuestion: teamState.current_question_position,
            totalQuestions: 7,
            question: {
                id: question.id,
                text: question.question_text,
                type: question.question_type,
                options: question.options,
                maxPoints: question.max_points
            }
        });
    } catch (error) {
        console.error('❌ Get current question crash:', error);
        res.status(500).json({ error: 'Server error loading question' });
    }
});

/* =====================================================
   SUBMIT ANSWER (UNCHANGED LOGIC)
   ===================================================== */
router.post('/question/submit', async (req, res) => {
    try {
        const teamId = req.user.userId;
        const { answer } = req.body;

        if (!answer || !answer.trim()) {
            return res.status(400).json({ error: 'Answer is required' });
        }

        const config = (await db.query('SELECT * FROM round_config LIMIT 1')).rows[0];
        if (config.round_state !== 'ACTIVE') {
            return res.status(400).json({ error: 'Round is not active' });
        }

        const teamState = (await db.query(
            'SELECT * FROM team_state WHERE team_id = $1',
            [teamId]
        )).rows[0];

        if (!teamState || teamState.is_completed) {
            return res.status(400).json({ error: 'Invalid team state' });
        }

        const question = (await db.query(
            `SELECT qb.*
             FROM team_questions tq
             JOIN question_bank qb ON tq.question_id = qb.id
             WHERE tq.team_id = $1 AND tq.question_position = $2`,
            [teamId, teamState.current_question_position]
        )).rows[0];

        if (!question) {
            return res.status(400).json({ error: 'Question not found' });
        }

        let isCorrect = null;
        let points = 0;

        if (question.question_type === 'MCQ') {
            isCorrect = answer.toUpperCase() === question.correct_answer.toUpperCase();
            points = isCorrect ? config.mcq_correct_points : 0;
        }

        await db.query(
            `INSERT INTO submissions 
             (team_id, question_id, question_position, answer_text, is_correct, points_awarded, evaluated_at)
             VALUES ($1, $2, $3, $4, $5, $6, 
             ${question.question_type === 'MCQ' ? 'CURRENT_TIMESTAMP' : 'NULL'})`,
            [teamId, question.id, teamState.current_question_position, answer, isCorrect ? 1 : 0, points]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

module.exports = router;
