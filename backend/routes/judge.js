const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, judgeOnly } = require('../middleware/auth');

// All judge routes require authentication and judge role
router.use(authMiddleware, judgeOnly);

/* =====================================================
   🌱 EMERGENCY SEEDER (RUN ONCE TO FIX EMPTY DB)
   ===================================================== */
router.get('/seed-defaults', async (req, res) => {
    try {
        console.log("🌱 Attempting to seed database...");
        
        // 1. Check if questions already exist
        const check = await db.query('SELECT COUNT(*) FROM question_bank');
        if (parseInt(check.rows[0].count) > 0) {
            return res.json({ message: 'Database already has questions! No need to seed.' });
        }

        // 2. Define 7 Dummy Questions for PostgreSQL
        const questions = [
            { t: "What is the time complexity of Binary Search?", type: "MCQ", opt: { A: "O(n)", B: "O(log n)", C: "O(n^2)", D: "O(1)" }, ans: "B" },
            { t: "Which data structure uses LIFO?", type: "MCQ", opt: { A: "Queue", B: "Array", C: "Stack", D: "Tree" }, ans: "C" },
            { t: "What does HTML stand for?", type: "MCQ", opt: { A: "Hyper Text Markup Language", B: "High Tool Mount Logic", C: "Hyperlink Text Mode", D: "None" }, ans: "A" },
            { t: "Explain the concept of Recursion briefly.", type: "DESCRIPTIVE", opt: null, ans: "Function calling itself" },
            { t: "Which SQL command is used to fetch data?", type: "MCQ", opt: { A: "UPDATE", B: "DELETE", C: "SELECT", D: "INSERT" }, ans: "C" },
            { t: "What is the capital of India?", type: "MCQ", opt: { A: "Mumbai", B: "Delhi", C: "Chennai", D: "Kolkata" }, ans: "B" },
            { t: "Who wrote the code for this Hackathon?", type: "MCQ", opt: { A: "Chatgpt", B: "Me", C: "Copilot", D: "Gemini" }, ans: "B" }
        ];

        // 3. Insert them
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            await db.query(`
                INSERT INTO question_bank 
                (question_text, question_type, options, correct_answer, max_points, question_set_id)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [q.t, q.type, q.opt ? JSON.stringify(q.opt) : null, q.ans, 10, 1]);
        }

        console.log("✅ Seeding complete.");
        res.json({ success: true, message: '7 Questions Inserted! You can now start the round.' });
    } catch (error) {
        console.error("Seeding error:", error);
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   GET DASHBOARD STATS
   ========================= */
router.get('/dashboard/stats', async (req, res) => {
    try {
        const configResult = await db.query('SELECT round_state FROM round_config ORDER BY id ASC LIMIT 1');
        const roundState = configResult.rows[0]?.round_state || 'LOCKED';

        const totalTeams = (await db.query('SELECT COUNT(*) FROM teams')).rows[0].count;
        const completedTeams = (await db.query('SELECT COUNT(*) FROM team_state WHERE is_completed = true')).rows[0].count;
        const totalSubmissions = (await db.query('SELECT COUNT(*) FROM submissions')).rows[0].count;

        res.json({
            roundState,
            totalTeams: parseInt(totalTeams),
            completedTeams: parseInt(completedTeams),
            totalSubmissions: parseInt(totalSubmissions)
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

/* =========================
   GET ALL SUBMISSIONS
   ========================= */
router.get('/submissions', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT s.*, t.team_name, qb.question_text, qb.question_type, qb.correct_answer
            FROM submissions s
            JOIN teams t ON s.team_id = t.id
            JOIN question_bank qb ON s.question_id = qb.id
            ORDER BY s.submitted_at DESC
        `);
        res.json({ submissions: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

/* =========================
   GET ROUND CONFIG
   ========================= */
router.get('/config', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM round_config ORDER BY id ASC LIMIT 1');
        res.json({ config: result.rows[0] || { round_state: 'LOCKED', is_locked: false } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

/* =========================
   START ROUND
   ========================= */
router.post('/round/start', async (req, res) => {
    try {
        // Ensure config exists
        const configCheck = await db.query('SELECT id FROM round_config ORDER BY id ASC LIMIT 1');
        if (configCheck.rows.length === 0) {
            await db.query("INSERT INTO round_config (round_state, is_locked) VALUES ('LOCKED', false)");
        }

        const teamsResult = await db.query('SELECT id FROM teams');

        for (const team of teamsResult.rows) {
            // Reset Team State
            await db.query(`
                INSERT INTO team_state (team_id, total_score, started_at, is_completed, wrong_answer_count, current_question_position, question_set_number)
                VALUES ($1, 0, CURRENT_TIMESTAMP, false, 0, 1, 1)
                ON CONFLICT (team_id) DO UPDATE SET 
                total_score = 0, started_at = CURRENT_TIMESTAMP, is_completed = false, wrong_answer_count = 0, current_question_position = 1
            `, [team.id]);

            // Clear old questions
            await db.query('DELETE FROM team_questions WHERE team_id = $1', [team.id]);

            // Assign New Questions
            const randomSet = Math.floor(Math.random() * 7) + 1;
            let questionsResult = await db.query('SELECT id FROM question_bank WHERE question_set_id = $1 ORDER BY id LIMIT 7', [randomSet]);
            
            // Fallback: If sets are empty, just grab ANY 7 questions
            if (questionsResult.rows.length === 0) {
                 questionsResult = await db.query('SELECT id FROM question_bank LIMIT 7');
            }

            for (let i = 0; i < questionsResult.rows.length; i++) {
                await db.query('INSERT INTO team_questions (team_id, question_id, question_position) VALUES ($1, $2, $3)', 
                [team.id, questionsResult.rows[i].id, i + 1]);
            }
        }

        await db.query("UPDATE round_config SET round_state = 'ACTIVE', is_locked = true, updated_at = CURRENT_TIMESTAMP");
        res.json({ success: true, message: 'Round started successfully' });
    } catch (error) {
        console.error('Start round error:', error);
        res.status(500).json({ error: 'Failed to start round' });
    }
});

/* =========================
   COMPLETE ROUND
   ========================= */
router.post('/round/complete', async (req, res) => {
    try {
        await db.query("UPDATE round_config SET round_state = 'COMPLETED', updated_at = CURRENT_TIMESTAMP");
        res.json({ success: true, message: 'Round completed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to complete round' });
    }
});

/* =========================
   RESET ROUND
   ========================= */
router.post('/round/reset', async (req, res) => {
    try {
        await db.query('BEGIN');
        await db.query('DELETE FROM submissions');
        await db.query('DELETE FROM team_state');
        await db.query('DELETE FROM team_questions');
        await db.query("UPDATE round_config SET round_state = 'LOCKED', is_locked = false");
        await db.query('COMMIT');
        res.json({ success: true, message: 'Round reset successfully' });
    } catch (error) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: 'Failed to reset round' });
    }
});

module.exports = router;
