const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

/* =====================================================
   GET CURRENT QUESTION
   ===================================================== */
router.get('/question/current', async (req, res) => {
    try {
        const teamId = req.user.userId || req.user.id;
        if (!teamId) return res.status(401).json({ error: 'Session invalid. Please login again.' });

        // 1. Check Round State
        const configResult = await db.query('SELECT round_state FROM round_config LIMIT 1');
        const roundState = configResult.rows[0]?.round_state || 'LOCKED';

        if (roundState !== 'ACTIVE') {
            return res.json({ status: roundState });
        }

        // 2. Ensure Team State Exists
        let stateResult = await db.query('SELECT * FROM team_state WHERE team_id = $1', [teamId]);
        
        if (stateResult.rows.length === 0) {
            await db.query(`
                INSERT INTO team_state (team_id, current_question_position, started_at, is_completed, wrong_answer_count, total_score)
                VALUES ($1, 1, CURRENT_TIMESTAMP, false, 0, 0)
            `, [teamId]);
            stateResult = await db.query('SELECT * FROM team_state WHERE team_id = $1', [teamId]);
        }

        const teamState = stateResult.rows[0];
        if (!teamState) return res.json({ status: 'WAITING', message: 'Initializing team...' });
        if (teamState.is_completed) return res.json({ status: 'COMPLETED' });

        // 3. Fetch Question
        let questionResult = await db.query(
            `SELECT qb.id, qb.question_text, qb.question_type, qb.options, qb.max_points
             FROM team_questions tq
             JOIN question_bank qb ON tq.question_id = qb.id
             WHERE tq.team_id = $1 AND tq.question_position = $2`,
            [teamId, teamState.current_question_position]
        );

        // 4. Auto-Assign if missing
        if (questionResult.rows.length === 0) {
            console.log(`⚠️ Questions missing for ${teamId}. Assigning random set...`);
            const randomSet = Math.floor(Math.random() * 7) + 1;
            let questions = await db.query('SELECT id FROM question_bank WHERE question_set_id = $1 ORDER BY id LIMIT 7', [randomSet]);
            
            if (questions.rows.length === 0) {
                 questions = await db.query('SELECT id FROM question_bank LIMIT 7');
            }

            if (questions.rows.length === 0) {
                return res.json({ status: 'WAITING', message: 'CRITICAL: Question Bank is empty! Contact Judge.' });
            }
            
            for (let i = 0; i < questions.rows.length; i++) {
                await db.query('INSERT INTO team_questions (team_id, question_id, question_position) VALUES ($1, $2, $3)', 
                [teamId, questions.rows[i].id, i + 1]);
            }

            questionResult = await db.query(
                `SELECT qb.id, qb.question_text, qb.question_type, qb.options, qb.max_points
                 FROM team_questions tq
                 JOIN question_bank qb ON tq.question_id = qb.id
                 WHERE tq.team_id = $1 AND tq.question_position = $2`,
                [teamId, teamState.current_question_position]
            );
        }

        if (questionResult.rows.length === 0) {
            return res.json({ status: 'WAITING', message: 'Failed to assign questions.' });
        }

        const rawQ = questionResult.rows[0];

        // Normalize Data for Frontend
        const formattedQuestion = {
            id: rawQ.id,
            text: rawQ.question_text,
            type: rawQ.question_type,
            options: rawQ.options,          
            maxPoints: rawQ.max_points
        };

        res.json({
            status: 'ACTIVE',
            currentQuestion: teamState.current_question_position,
            totalQuestions: 7,
            question: formattedQuestion
        });

    } catch (error) {
        console.error('❌ CRASH in Question Loader:', error);
        res.status(500).json({ error: 'Server error loading question' });
    }
});

/* =====================================================
   SUBMIT ANSWER (UPDATED SCORING LOGIC)
   ===================================================== */
router.post('/question/submit', async (req, res) => {
    try {
        const teamId = req.user.userId || req.user.id;
        if (!teamId) return res.status(401).json({ error: 'Session invalid' });

        const { answer } = req.body;
        if (!answer || !answer.trim()) return res.status(400).json({ error: 'Answer is required' });

        // 1. Fetch Config & Team State
        const config = (await db.query('SELECT * FROM round_config LIMIT 1')).rows[0];
        if (config.round_state !== 'ACTIVE') return res.status(400).json({ error: 'Round is not active' });

        const teamState = (await db.query('SELECT * FROM team_state WHERE team_id = $1', [teamId])).rows[0];
        if (!teamState || teamState.is_completed) return res.status(400).json({ error: 'Invalid team state' });

        // 2. Get the Question
        const question = (await db.query(
            `SELECT qb.* FROM team_questions tq
             JOIN question_bank qb ON tq.question_id = qb.id
             WHERE tq.team_id = $1 AND tq.question_position = $2`,
            [teamId, teamState.current_question_position]
        )).rows[0];

        if (!question) return res.status(400).json({ error: 'Question not found' });

        // 3. CALCULATE POINTS & STREAK LOGIC
        let isCorrect = false;
        let points = 0;
        let newWrongCount = teamState.wrong_answer_count;

        // Config values (Default fallbacks: Correct=+10, Wrong=-5, 3-Wrong=-20)
        const POINTS_CORRECT = config.mcq_correct_points || 10;
        const PENALTY_WRONG = config.wrong_answer_penalty || -5;
        const PENALTY_THREE_WRONG = config.three_wrong_penalty || -20;

        if (question.question_type === 'MCQ') {
            isCorrect = answer.toUpperCase().trim() === question.correct_answer.toUpperCase().trim();
            
            if (isCorrect) {
                // Correct Answer: Award points & RESET streak
                points = POINTS_CORRECT;
                newWrongCount = 0; 
            } else {
                // Wrong Answer: Apply penalty & INCREASE streak
                points = PENALTY_WRONG;
                newWrongCount++;

                // Check for 3 Consecutive Wrongs
                if (newWrongCount >= 3) {
                    points += PENALTY_THREE_WRONG; // Add the heavy penalty (e.g., -5 + -20 = -25)
                    newWrongCount = 0; // Reset streak after punishment
                }
            }
        } else {
            // Descriptive: Pending evaluation (0 points for now)
            points = 0;
        }

        // 4. Save Submission
        await db.query(
            `INSERT INTO submissions (team_id, question_id, question_position, answer_text, is_correct, points_awarded, evaluated_at)
             VALUES ($1, $2, $3, $4, $5, $6, ${question.question_type === 'MCQ' ? 'CURRENT_TIMESTAMP' : 'NULL'})`,
            [teamId, question.id, teamState.current_question_position, answer, isCorrect, points]
        );

        // 5. Update Team Stats
        const nextPosition = teamState.current_question_position + 1;
        const isNowCompleted = nextPosition > 7; 

        await db.query(
            `UPDATE team_state 
             SET current_question_position = $1, 
                 is_completed = $2, 
                 total_score = total_score + $3,
                 wrong_answer_count = $4
             WHERE team_id = $5`,
            [nextPosition, isNowCompleted, points, newWrongCount, teamId]
        );

        res.json({ success: true, isCorrect, points, nextPosition, completed: isNowCompleted });
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

router.get('/status', async (req, res) => {
    try {
        const teamId = req.user.userId || req.user.id;
        if (!teamId) return res.status(401).json({ error: 'Session invalid' });

        const configResult = await db.query('SELECT round_state FROM round_config LIMIT 1');
        const roundState = configResult.rows[0]?.round_state || 'LOCKED';

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

module.exports = router;
