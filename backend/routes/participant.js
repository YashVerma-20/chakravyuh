const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// All participant routes require authentication
router.use(authMiddleware);

/* =====================================================
   PARTICIPANT STATUS
   ===================================================== */
router.get('/status', async (req, res) => {
    try {
        const teamId = req.user.userId;
        
        // 🔥 CRASH FIX: Check for invalid token data
        if (!teamId) {
            return res.status(401).json({ error: 'Invalid token. Please re-login.' });
        }

        // Get round state
        const configResult = await db.query('SELECT round_state FROM round_config LIMIT 1');
        const roundState = configResult.rows[0]?.round_state || 'LOCKED';

        // Team state
        const stateResult = await db.query('SELECT * FROM team_state WHERE team_id = $1', [teamId]);
        const teamState = stateResult.rows[0];

        let canProceed = true;
        if (teamState) {
            const pending = await db.query(
                `SELECT 1 FROM submissions WHERE team_id = $1 AND question_position = $2 AND evaluated_at IS NULL LIMIT 1`,
                [teamId, teamState.current_question_position]
            );
            canProceed = pending.rows.length === 0;
        }

        res.json({
            status: roundState,
            roundState,
            currentQuestion: teamState?.current_question_position || 1,
            totalQuestions: 7,
            isCompleted: teamState?.is_completed || false,
            wrongAnswerCount: teamState?.wrong_answer_count || 0,
            canProceed
        });
    } catch (error) {
        console.error('Status Error:', error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

/* =====================================================
   GET CURRENT QUESTION (FINAL BULLETPROOF VERSION)
   ===================================================== */
router.get('/question/current', async (req, res) => {
    try {
        const teamId = req.user.userId;
        console.log(`🔍 Fetching question for Team ID: ${teamId}`);

        // 🔥 CRASH FIX: Stop immediately if ID is missing
        if (!teamId) {
            console.error("❌ Error: Team ID is undefined in token.");
            return res.status(401).json({ error: 'Session invalid. Please login again.' });
        }

        // 1. Check Round State
        const configResult = await db.query('SELECT round_state FROM round_config LIMIT 1');
        const roundState = configResult.rows[0]?.round_state || 'LOCKED';

        if (roundState !== 'ACTIVE') {
            return res.json({ status: roundState });
        }

        // 2. SELF-HEAL: Ensure Team State Exists
        let stateResult = await db.query('SELECT * FROM team_state WHERE team_id = $1', [teamId]);
        
        if (stateResult.rows.length === 0) {
            console.log(`⚠️ Team State missing for ${teamId}. Creating now...`);
            await db.query(`
                INSERT INTO team_state (team_id, current_question_position, started_at, is_completed, wrong_answer_count, total_score)
                VALUES ($1, 1, CURRENT_TIMESTAMP, false, 0, 0)
            `, [teamId]);
            stateResult = await db.query('SELECT * FROM team_state WHERE team_id = $1', [teamId]);
        }

        const teamState = stateResult.rows[0];
        
        // Double check state exists to avoid crash
        if (!teamState) {
             return res.json({ status: 'WAITING', message: 'Initializing team...' });
        }

        if (teamState.is_completed) return res.json({ status: 'COMPLETED' });

        // 3. SELF-HEAL: Ensure Questions Exist
        let questionResult = await db.query(
            `SELECT qb.id, qb.question_text, qb.question_type, qb.options, qb.max_points
             FROM team_questions tq
             JOIN question_bank qb ON tq.question_id = qb.id
             WHERE tq.team_id = $1 AND tq.question_position = $2`,
            [teamId, teamState.current_question_position]
        );

        if (questionResult.rows.length === 0) {
            console.log(`⚠️ Questions missing for ${teamId}. Assigning random set now...`);
            
            // Pick a random set
            const randomSet = Math.floor(Math.random() * 7) + 1;
            const questions = await db.query('SELECT id FROM question_bank WHERE question_set_id = $1 ORDER BY id LIMIT 7', [randomSet]);
            
            // Fallback if sets are empty
            let finalQuestions = questions.rows;
            if (finalQuestions.length === 0) {
                 const fallback = await db.query('SELECT id FROM question_bank LIMIT 7');
                 finalQuestions = fallback.rows;
            }

            if (finalQuestions.length === 0) {
                return res.json({ status: 'WAITING', message: 'CRITICAL: Question Bank is empty! Contact Judge.' });
            }
            
            for (let i = 0; i < finalQuestions.length; i++) {
                await db.query('INSERT INTO team_questions (team_id, question_id, question_position) VALUES ($1, $2, $3)', 
                [teamId, finalQuestions[i].id, i + 1]);
            }

            // Retry Fetch
            questionResult = await db.query(
                `SELECT qb.id, qb.question_text, qb.question_type, qb.options, qb.max_points
                 FROM team_questions tq
                 JOIN question_bank qb ON tq.question_id = qb.id
                 WHERE tq.team_id = $1 AND tq.question_position = $2`,
                [teamId, teamState.current_question_position]
            );
        }

        if (questionResult.rows.length === 0) {
            return res.json({ status: 'WAITING', message: 'Failed to assign questions. Please contact support.' });
        }

        res.json({
            status: 'ACTIVE',
            currentQuestion: teamState.current_question_position,
            totalQuestions: 7,
            question: questionResult.rows[0]
        });

    } catch (error) {
        console.error('❌ CRASH in Question Loader:', error);
        res.status(500).json({ error: 'Server error loading question' });
    }
});

/* =====================================================
   SUBMIT ANSWER
   ===================================================== */
router.post('/question/submit', async (req, res) => {
    try {
        const teamId = req.user.userId;
        if (!teamId) return res.status(401).json({ error: 'Session invalid' });

        const { answer } = req.body;
        if (!answer || !answer.trim()) return res.status(400).json({ error: 'Answer is required' });

        const config = (await db.query('SELECT * FROM round_config LIMIT 1')).rows[0];
        if (config.round_state !== 'ACTIVE') return res.status(400).json({ error: 'Round is not active' });

        const teamState = (await db.query('SELECT * FROM team_state WHERE team_id = $1', [teamId])).rows[0];
        if (!teamState || teamState.is_completed) return res.status(400).json({ error: 'Invalid team state' });

        const question = (await db.query(
            `SELECT qb.* FROM team_questions tq
             JOIN question_bank qb ON tq.question_id = qb.id
             WHERE tq.team_id = $1 AND tq.question_position = $2`,
            [teamId, teamState.current_question_position]
        )).rows[0];

        if (!question) return res.status(400).json({ error: 'Question not found' });

        let isCorrect = false;
        let points = 0;

        if (question.question_type === 'MCQ') {
            isCorrect = answer.toUpperCase().trim() === question.correct_answer.toUpperCase().trim();
            points = isCorrect ? (config.mcq_correct_points || 10) : 0;
        }

        await db.query(
            `INSERT INTO submissions (team_id, question_id, question_position, answer_text, is_correct, points_awarded, evaluated_at)
             VALUES ($1, $2, $3, $4, $5, $6, ${question.question_type === 'MCQ' ? 'CURRENT_TIMESTAMP' : 'NULL'})`,
            [teamId, question.id, teamState.current_question_position, answer, isCorrect, points]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

module.exports = router;
