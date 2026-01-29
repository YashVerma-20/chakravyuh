const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// All participant routes require authentication
router.use(authMiddleware);

/* =====================================================
   GET CURRENT QUESTION (FULLY SAFE)
   ===================================================== */
router.get('/question/current', async (req, res) => {
    try {
        const teamId = req.user.userId;

        // 1️⃣ Check round state
        const configResult = await db.query(
            'SELECT round_state FROM round_config LIMIT 1'
        );
        const roundState = configResult.rows[0]?.round_state || 'LOCKED';

        if (roundState !== 'ACTIVE') {
            return res.json({
                status: roundState,
                message: 'Round is not active'
            });
        }

        // 2️⃣ Get or create team_state
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

        if (!teamState) {
            return res.json({
                status: 'LOCKED',
                message: 'Team state not ready yet'
            });
        }

        if (teamState.is_completed) {
            return res.json({
                status: 'COMPLETED',
                message: 'All questions completed'
            });
        }

        // 3️⃣ Fetch assigned question
        const questionResult = await db.query(
            `SELECT qb.id, qb.question_text, qb.question_type, qb.options, qb.max_points
             FROM team_questions tq
             JOIN question_bank qb ON tq.question_id = qb.id
             WHERE tq.team_id = $1 AND tq.question_position = $2`,
            [teamId, teamState.current_question_position]
        );

        if (questionResult.rows.length === 0) {
            return res.json({
                status: 'LOCKED',
                message: 'Questions not assigned yet. Please wait.'
            });
        }

        const question = questionResult.rows[0];

        // 4️⃣ Start time tracking
        const trackingCheck = await db.query(
            `SELECT 1 FROM question_time_tracking
             WHERE team_id = $1
             AND question_position = $2
             AND completed_at IS NULL`,
            [teamId, teamState.current_question_position]
        );

        if (trackingCheck.rows.length === 0) {
            await db.query(
                `INSERT INTO question_time_tracking (team_id, question_position)
                 VALUES ($1, $2)`,
                [teamId, teamState.current_question_position]
            );
        }

        // 5️⃣ Send response
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
        console.error('Get current question error:', error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});

/* =====================================================
   SUBMIT ANSWER (SAFE VERSION)
   ===================================================== */
router.post('/question/submit', async (req, res) => {
    try {
        const teamId = req.user.userId;
        const { answer } = req.body;

        if (!answer || !answer.trim()) {
            return res.status(400).json({ error: 'Answer is required' });
        }

        // Check round state
        const configResult = await db.query('SELECT * FROM round_config LIMIT 1');
        const config = configResult.rows[0];

        if (config.round_state !== 'ACTIVE') {
            return res.status(400).json({ error: 'Round is not active' });
        }

        // Get team state
        const stateResult = await db.query(
            'SELECT * FROM team_state WHERE team_id = $1',
            [teamId]
        );
        const teamState = stateResult.rows[0];

        if (!teamState) {
            return res.status(400).json({ error: 'Team state not initialized' });
        }

        if (teamState.is_completed) {
            return res.status(400).json({ error: 'All questions already completed' });
        }

        // Get current question
        const questionResult = await db.query(
            `SELECT qb.*
             FROM team_questions tq
             JOIN question_bank qb ON tq.question_id = qb.id
             WHERE tq.team_id = $1 AND tq.question_position = $2`,
            [teamId, teamState.current_question_position]
        );

        if (questionResult.rows.length === 0) {
            return res.status(400).json({
                error: 'Question not found. Please wait and retry.'
            });
        }

        const question = questionResult.rows[0];

        let isCorrect = null;
        let pointsAwarded = 0;

        // Auto-evaluate MCQ
        if (question.question_type === 'MCQ') {
            isCorrect =
                answer.toUpperCase() === question.correct_answer.toUpperCase();
            pointsAwarded = isCorrect ? config.mcq_correct_points : 0;
        }

        const isCorrectInt =
            isCorrect === null ? null : isCorrect ? 1 : 0;

        // Record submission
        await db.query(
            `INSERT INTO submissions
             (team_id, question_id, question_position, answer_text, is_correct, points_awarded, evaluated_at)
             VALUES ($1, $2, $3, $4, $5, $6,
             ${question.question_type === 'MCQ' ? 'CURRENT_TIMESTAMP' : 'NULL'})`,
            [
                teamId,
                question.id,
                teamState.current_question_position,
                answer,
                isCorrectInt,
                pointsAwarded
            ]
        );

        // Complete time tracking
        await db.query(
            `UPDATE question_time_tracking
             SET completed_at = CURRENT_TIMESTAMP
             WHERE team_id = $1
             AND question_position = $2
             AND completed_at IS NULL`,
            [teamId, teamState.current_question_position]
        );

        // Wrong MCQ
        if (question.question_type === 'MCQ' && !isCorrect) {
            const newWrongCount = teamState.wrong_answer_count + 1;
            const penalty = config.wrong_answer_penalty;

            if (newWrongCount >= 3) {
                const newScore =
                    teamState.total_score + config.three_wrong_penalty;
                const newSetNumber = teamState.question_set_number + 1;

                await db.query(
                    `UPDATE team_state
                     SET total_score = $1,
                         wrong_answer_count = 0,
                         current_question_position = 1,
                         question_set_number = $2
                     WHERE team_id = $3`,
                    [newScore, newSetNumber, teamId]
                );

                await assignNewQuestionSet(teamId, newSetNumber);

                return res.json({
                    action: 'RESET_NEW_SET',
                    message: '3 wrong answers. New question set assigned.'
                });
            }

            await db.query(
                `UPDATE team_state
                 SET total_score = $1,
                     wrong_answer_count = $2,
                     current_question_position = 1
                 WHERE team_id = $3`,
                [
                    teamState.total_score + penalty,
                    newWrongCount,
                    teamId
                ]
            );

            return res.json({
                action: 'RESET_TO_Q1',
                message: 'Wrong answer. Reset to Question 1.'
            });
        }

        // Correct MCQ
        if (question.question_type === 'MCQ' && isCorrect) {
            const newScore = teamState.total_score + pointsAwarded;
            const nextPos = teamState.current_question_position + 1;

            if (nextPos > 7) {
                await db.query(
                    `UPDATE team_state
                     SET total_score = $1,
                         is_completed = true,
                         completed_at = CURRENT_TIMESTAMP
                     WHERE team_id = $2`,
                    [newScore, teamId]
                );

                await db.query(
                    `INSERT INTO leaderboard (team_id, final_score)
                     VALUES ($1, $2)
                     ON CONFLICT (team_id)
                     DO UPDATE SET final_score = $2`,
                    [teamId, newScore]
                );

                return res.json({ action: 'COMPLETED' });
            }

            await db.query(
                `UPDATE team_state
                 SET total_score = $1,
                     current_question_position = $2
                 WHERE team_id = $3`,
                [newScore, nextPos, teamId]
            );

            return res.json({ action: 'NEXT_QUESTION' });
        }

        // Descriptive
        if (question.question_type === 'DESCRIPTIVE') {
            return res.json({ action: 'QUEUED_FOR_EVALUATION' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

/* =====================================================
   HELPER: ASSIGN NEW QUESTION SET
   ===================================================== */
async function assignNewQuestionSet(teamId, setNumber) {
    await db.query('DELETE FROM team_questions WHERE team_id = $1', [teamId]);

    let result = await db.query(
        `SELECT id FROM question_bank
         WHERE question_set_id = $1
         ORDER BY RANDOM()
         LIMIT 7`,
        [setNumber]
    );

    if (result.rows.length < 7) {
        result = await db.query(
            'SELECT id FROM question_bank ORDER BY RANDOM() LIMIT 7'
        );
    }

    for (let i = 0; i < result.rows.length; i++) {
        await db.query(
            `INSERT INTO team_questions (team_id, question_id, question_position)
             VALUES ($1, $2, $3)`,
            [teamId, result.rows[i].id, i + 1]
        );
    }
}

module.exports = router;
