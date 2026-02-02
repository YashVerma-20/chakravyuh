const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, judgeOnly } = require('../middleware/auth');

/* =====================================================
   🌱 EMERGENCY SEEDER (PUBLIC ACCESS FOR FIXING)
   Moved to TOP so it works in browser without token
   ===================================================== */
router.get('/seed-defaults', async (req, res) => {
    try {
        console.log("🌱 Attempting to seed REAL questions...");

        // 1. Check if questions exist
        const check = await db.query('SELECT COUNT(*) FROM question_bank');
        if (parseInt(check.rows[0].count) > 0) {
            return res.json({ message: 'Database already has questions! No need to seed.' });
        }

        // 2. THE REAL QUESTIONS ARRAY (42 Questions)
        const questions = [
            // Q1 - Q5
            { text: 'An algorithm performs the following operations on an array of size n: A loop runs n times. Inside the loop, a binary search is performed on a sorted array. What is the overall time complexity?', type: 'MCQ', options: '{"A":"O(n)","B":"O(n log n)","C":"O(log n)","D":"O(n²)"}', answer: 'B', points: 10 },
            { text: 'An algorithm runs a loop n times. Inside the loop, another loop runs i times for the current value of i (starting from 1). What is the overall time complexity?', type: 'MCQ', options: '{"A":"O(n)","B":"O(n log n)","C":"O(n²)","D":"O(n³)"}', answer: 'C', points: 10 },
            { text: 'Which of the following algorithms has different best-case and worst-case time complexities?', type: 'MCQ', options: '{"A":"Merge Sort","B":"Binary Search","C":"Heap Sort","D":"Selection Sort"}', answer: 'B', points: 10 },
            { text: 'You are given an unsorted array of n distinct elements. Which algorithm will take exactly the same number of comparisons, regardless of input order?', type: 'MCQ', options: '{"A":"Bubble Sort","B":"Insertion Sort","C":"Selection Sort","D":"Quick Sort"}', answer: 'C', points: 10 },
            { text: 'A recursive function calls itself once for every element in an array of size n and does constant work each time. What is the time complexity?', type: 'MCQ', options: '{"A":"O(log n)","B":"O(n)","C":"O(n log n)","D":"O(n²)"}', answer: 'B', points: 10 },
            
            // Q6 - Q10
            { text: 'You need to find the second largest element in an unsorted array using the minimum number of comparisons. Which approach is best?', type: 'MCQ', options: '{"A":"Sort the array","B":"Traverse the array twice","C":"Use a tournament method","D":"Use Binary Search"}', answer: 'C', points: 10 },
            { text: 'You need to sort an array where input size is small and nearly all elements are already sorted. Which algorithm is most efficient?', type: 'MCQ', options: '{"A":"Quick Sort","B":"Merge Sort","C":"Insertion Sort","D":"Heap Sort"}', answer: 'C', points: 10 },
            { text: 'A stack is initially empty. Elements 1, 2, 3, 4 are pushed in this order. Which of the following output sequences is NOT possible?', type: 'MCQ', options: '{"A":"3 1 4 2","B":"2 4 3 1","C":"4 3 2 1","D":"3 2 4 1"}', answer: 'A', points: 10 },
            { text: 'In a binary tree: Inorder: D B E A F C G, Preorder: A B D E C F G. What is the left child of C?', type: 'MCQ', options: '{"A":"F","B":"G","C":"E","D":"D"}', answer: 'A', points: 10 },
            { text: 'Given the expression: ((A + (B * C)) - ((D / E) + F)). What is the maximum stack depth required during evaluation?', type: 'MCQ', options: '{"A":"3","B":"4","C":"5","D":"6"}', answer: 'C', points: 10 },
            
            // Q11 - Q15
            { text: 'Input: 1 2 3 4. Rules: Elements move from input → Stack S1 → Stack S2 → Output. You cannot move directly from input to S2. You may pop from either stack at any time. Which sequence is IMPOSSIBLE?', type: 'MCQ', options: '{"A":"2 1 4 3","B":"3 2 1 4","C":"4 3 2 1","D":"3 1 4 2"}', answer: 'D', points: 10 },
            { text: 'Stack and Queue start empty. Operations: 1) Push 1,2,3,4,5 into stack 2) Pop three elements → enqueue 3) Push 6,7 into stack 4) Dequeue one element 5) Pop remaining stack elements → enqueue. Final queue order?', type: 'MCQ', options: '{"A":"5 4 3 7 6 2 1","B":"5 4 3 6 7 2 1","C":"3 4 5 7 6 2 1","D":"5 4 6 7 3 2 1"}', answer: 'A', points: 10 },
            { text: 'Circular queue size = 10. Initial: front = 7, rear = 6, Queue is not empty and not full. Operations: 1) ENQUEUE ×3 2) DEQUEUE ×4 3) ENQUEUE ×2. How many elements remain?', type: 'MCQ', options: '{"A":"5","B":"6","C":"7","D":"8"}', answer: 'B', points: 10 },
            { text: 'A singly linked list contains: 10 → 20 → 30 → 40 → 50 → NULL. Operations: 1) Delete the second node 2) Insert 25 after node containing 30 3) Delete the last node. What is the final list?', type: 'MCQ', options: '{"A":"10 → 30 → 25 → 40","B":"10 → 30 → 25 → 40 → 50","C":"10 → 20 → 30 → 25 → 40","D":"10 → 25 → 30 → 40"}', answer: 'A', points: 10 },
            { text: 'A Binary Search Tree (BST) contains the keys: 15, 10, 20, 8, 12, 17, 25. If you delete the node 10, what is the inorder traversal of the new BST?', type: 'MCQ', options: '{"A":"8, 12, 15, 17, 20, 25","B":"8, 15, 12, 17, 20, 25","C":"8, 12, 15, 20, 17, 25","D":"12, 8, 15, 17, 20, 25"}', answer: 'A', points: 10 },
            
            // Q16 - Q20
            { text: 'If A → B and B → C are functional dependencies, which is always TRUE?', type: 'MCQ', options: '{"A":"C → A","B":"A → C","C":"B → A","D":"C → B"}', answer: 'B', points: 10 },
            { text: 'Which statement is TRUE?', type: 'MCQ', options: '{"A":"A primary key can contain NULL values","B":"A table can have more than one candidate key","C":"A foreign key must reference a primary key only","D":"Candidate keys can have duplicate values"}', answer: 'B', points: 10 },
            { text: 'A relation is in 3NF but not in BCNF. Which of the following MUST be true?', type: 'MCQ', options: '{"A":"It contains partial dependency","B":"It contains transitive dependency","C":"There exists a non-key determinant","D":"It has multivalued dependency"}', answer: 'C', points: 10 },
            { text: 'Which ACID property ensures that partial changes are never saved if a transaction fails?', type: 'MCQ', options: '{"A":"Atomicity","B":"Consistency","C":"Isolation","D":"Durability"}', answer: 'A', points: 10 },
            { text: 'What happens if a referenced primary key value is deleted without cascade rules?', type: 'MCQ', options: '{"A":"The delete always succeeds","B":"Related foreign key values are set to NULL","C":"The delete is rejected","D":"The table is automatically dropped"}', answer: 'C', points: 10 },
            
            // Q21 - Q25
            { text: 'Which of the following is a weak entity?', type: 'MCQ', options: '{"A":"An entity with a composite key","B":"An entity dependent on another entity for identification","C":"An entity with multiple attributes","D":"An entity without relationships"}', answer: 'B', points: 10 },
            { text: 'Table Users has Names: Alice, Alina, Bob. Query: SELECT * FROM Users WHERE Name LIKE \'Al%\'; Output?', type: 'MCQ', options: '{"A":"Alice","B":"Alina","C":"Alice, Alina","D":"Bob"}', answer: 'C', points: 10 },
            { text: 'Transaction T1: UPDATE Account SET Balance=Balance-100 WHERE ID=1. Transaction T2: SELECT Balance FROM Account WHERE ID=1 (simultaneous). Which anomaly can occur if isolation level = READ UNCOMMITTED?', type: 'MCQ', options: '{"A":"Dirty Read","B":"Lost Update","C":"Phantom Read","D":"None"}', answer: 'A', points: 10 },
            { text: 'Table Products: ID=1,Name=Pen,Price=10 and ID=2,Name=Book,Price=50. Query: UPDATE Products SET Price = Price + 10 WHERE Name=\'Pen\'; New price of Book?', type: 'MCQ', options: '{"A":"10","B":"50","C":"60","D":"20"}', answer: 'B', points: 10 },
            { text: 'How many times is "Hello" printed? for(int i = 1; i <= 3; i++){ for(int j = i; j <= 3; j++){ print("Hello"); } }', type: 'MCQ', options: '{"A":"3","B":"4","C":"5","D":"6"}', answer: 'D', points: 10 },
            
            // Q26 - Q30
            { text: 'What is the output? int x = 5; if(true){ int x = 10; } print(x);', type: 'MCQ', options: '{"A":"5","B":"10","C":"Compile-time error","D":"Runtime error"}', answer: 'C', points: 10 },
            { text: 'What is the value of x? int x = 5; x = x++ + ++x;', type: 'MCQ', options: '{"A":"10","B":"11","C":"12","D":"Undefined behavior"}', answer: 'D', points: 10 },
            { text: 'int x = 2, y = 1; for(int i = 1; i <= 4; i++){ y = y + x; x = x + i; } print(x + y);', type: 'MCQ', options: '{"A":"16","B":"18","C":"20","D":"22"}', answer: 'C', points: 10 },
            { text: 'int sum = 0; for(int i = 1; i <= 5; i++){ int x = i; while(x > 0){ sum += x; x = x - 2; } } print(sum);', type: 'MCQ', options: '{"A":"15","B":"20","C":"25","D":"30"}', answer: 'C', points: 10 },
            { text: 'int x = 0, i = 1; while(i <= 10){ if(i % 4 == 0) x += i; else if(i % 3 == 0) x -= i; i++; } print(x);', type: 'MCQ', options: '{"A":"2","B":"4","C":"6","D":"8"}', answer: 'B', points: 10 },
            
            // Q31 - Q35
            { text: 'Which of the following necessarily occurs during a context switch?', type: 'MCQ', options: '{"A":"CPU cache is cleared","B":"Process state is saved","C":"Process code is modified","D":"Hard disk access is required"}', answer: 'B', points: 10 },
            { text: 'A system allows preemption of resources. Which deadlock condition is definitely eliminated?', type: 'MCQ', options: '{"A":"Mutual exclusion","B":"Hold and wait","C":"No preemption","D":"Circular wait"}', answer: 'C', points: 10 },
            { text: 'Which statement is CORRECT?', type: 'MCQ', options: '{"A":"Paging eliminates internal fragmentation","B":"Segmentation eliminates external fragmentation","C":"Paging divides memory into fixed-size blocks","D":"Segmentation uses physical memory addresses only"}', answer: 'C', points: 10 },
            { text: 'Why are user programs not allowed to execute privileged instructions?', type: 'MCQ', options: '{"A":"To improve execution speed","B":"To reduce memory consumption","C":"To ensure system security and stability","D":"To avoid compilation errors"}', answer: 'C', points: 10 },
            { text: 'A program P is stored on disk. It is loaded into memory and execution begins. Later, execution is paused and resumed. Which statement is TRUE?', type: 'MCQ', options: '{"A":"P is a program throughout","B":"P becomes a process only when paused","C":"P is a process during execution and pause","D":"P becomes a process only when resumed"}', answer: 'C', points: 10 },
            
            // Q36 - Q40
            { text: 'During a context switch, which of the following MUST be saved to resume execution correctly?', type: 'MCQ', options: '{"A":"Source code of the process","B":"Process registers and program counter","C":"Entire main memory","D":"Hard disk data"}', answer: 'B', points: 10 },
            { text: 'A system removes the hold and wait condition. What is the strongest conclusion?', type: 'MCQ', options: '{"A":"Deadlock is still possible","B":"Deadlock is impossible","C":"Starvation is impossible","D":"Circular wait is guaranteed"}', answer: 'B', points: 10 },
            { text: 'A process is: Loaded into memory, Given CPU time, Requests I/O, Later resumes execution. Which sequence of states is MOST accurate?', type: 'MCQ', options: '{"A":"New → Ready → Running → Ready → Running","B":"New → Ready → Running → Waiting → Ready → Running","C":"New → Running → Waiting → Terminated","D":"Ready → Running → Waiting → Running"}', answer: 'B', points: 10 },
            { text: 'Increasing cache size indefinitely will eventually:', type: 'MCQ', options: '{"A":"Always improve performance","B":"Increase average memory access time","C":"Show diminishing performance gains","D":"Eliminate need for RAM"}', answer: 'C', points: 10 },
            { text: 'If interrupts are disabled for too long, the MOST serious issue is:', type: 'MCQ', options: '{"A":"Reduced CPU speed","B":"Increased memory usage","C":"Delayed I/O handling","D":"Faster execution"}', answer: 'C', points: 10 },
            
            // Q41 - Q42 (Descriptive)
            { text: 'A program updates a database record and then crashes before commit. Which component ensures the database remains correct?', type: 'MCQ', options: '{"A":"Compiler","B":"Operating System","C":"Transaction Manager","D":"Stack Memory"}', answer: 'C', points: 10 },
            { text: 'Explain the concept of deadlock in operating systems. Describe at least TWO conditions required for deadlock to occur and explain ONE prevention method in detail.', type: 'DESCRIPTIVE', options: null, answer: null, points: 15 }
        ];

        // 3. LOGIC TO INSERT 7 SETS
        console.log('Creating 7 question sets for 7 teams...');
        let totalInserted = 0;

        for (let setId = 1; setId <= 7; setId++) {
            const startIdx = ((setId - 1) * 6) % 41; 
            const selectedSet = [];

            for (let i = 0; i < 6; i++) {
                const idx = (startIdx + i) % 41;
                selectedSet.push(questions[idx]);
            }

            // Always add the same descriptive question at the end (Index 41)
            selectedSet.push(questions[41]);

            for (const q of selectedSet) {
                await db.query(`
                    INSERT INTO question_bank 
                    (question_text, question_type, options, correct_answer, max_points, question_set_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [q.text, q.type, q.options, q.answer, q.points, setId]);
                totalInserted++;
            }
        }

        console.log(`✅ Success! Inserted ${totalInserted} questions.`);
        res.json({ success: true, message: `DB Seeded with ${totalInserted} questions across 7 sets!` });
    } catch (error) {
        console.error("Seeding error:", error);
        res.status(500).json({ error: error.message });
    }
});

/* =====================================================
   🔒 SECURE ROUTES (REQUIRE LOGIN)
   All routes BELOW this line require a token
   ===================================================== */
router.use(authMiddleware, judgeOnly);

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
   UPDATE SCORING CONFIG
   ========================= */
router.post('/config/update', async (req, res) => {
    try {
        const { mcq_correct_points, descriptive_max_points, wrong_answer_penalty, three_wrong_penalty } = req.body;
        
        await db.query(`
            UPDATE round_config 
            SET mcq_correct_points = $1,
                descriptive_max_points = $2,
                wrong_answer_penalty = $3,
                three_wrong_penalty = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = (SELECT id FROM round_config LIMIT 1)
        `, [mcq_correct_points, descriptive_max_points, wrong_answer_penalty, three_wrong_penalty]);

        res.json({ success: true, message: 'Config updated' });
    } catch (error) {
        console.error('Config update error:', error);
        res.status(500).json({ error: 'Failed to update config' });
    }
});

/* =========================
   START ROUND
   ========================= */
router.post('/round/start', async (req, res) => {
    try {
        const configCheck = await db.query('SELECT id FROM round_config ORDER BY id ASC LIMIT 1');
        if (configCheck.rows.length === 0) {
            await db.query("INSERT INTO round_config (round_state, is_locked) VALUES ('LOCKED', false)");
        }

        const teamsResult = await db.query('SELECT id FROM teams');

        for (const team of teamsResult.rows) {
            await db.query(`
                INSERT INTO team_state (team_id, total_score, started_at, is_completed, wrong_answer_count, current_question_position, question_set_number)
                VALUES ($1, 0, CURRENT_TIMESTAMP, false, 0, 1, 1)
                ON CONFLICT (team_id) DO UPDATE SET 
                total_score = 0, started_at = CURRENT_TIMESTAMP, is_completed = false, wrong_answer_count = 0, current_question_position = 1
            `, [team.id]);

            await db.query('DELETE FROM team_questions WHERE team_id = $1', [team.id]);

            const randomSet = Math.floor(Math.random() * 7) + 1;
            let questionsResult = await db.query('SELECT id FROM question_bank WHERE question_set_id = $1 ORDER BY id LIMIT 7', [randomSet]);
            
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

/* =========================
   MANUAL SCORING (DESCRIPTIVE)
   ========================= */
router.post('/score/update', async (req, res) => {
    try {
        const { submissionId, points, isCorrect } = req.body;

        if (!submissionId || points === undefined) {
            return res.status(400).json({ error: 'Missing submission ID or points' });
        }

        // 1. Get the submission to find the team_id
        const subResult = await db.query('SELECT team_id FROM submissions WHERE id = $1', [submissionId]);
        if (subResult.rows.length === 0) return res.status(404).json({ error: 'Submission not found' });
        
        const teamId = subResult.rows[0].team_id;

        // 2. Update the Submission record
        await db.query(`
            UPDATE submissions 
            SET points_awarded = $1, 
                is_correct = $2, 
                evaluated_at = CURRENT_TIMESTAMP 
            WHERE id = $3
        `, [points, isCorrect, submissionId]);

        // 3. Update the Team's Total Score
        await db.query(`
            UPDATE team_state 
            SET total_score = total_score + $1 
            WHERE team_id = $2
        `, [points, teamId]);

        res.json({ success: true, message: 'Score updated successfully' });
    } catch (error) {
        console.error('Scoring error:', error);
        res.status(500).json({ error: 'Failed to update score' });
    }
});

module.exports = router;
