const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

/* =====================================================
   TOKEN VERIFICATION
   ===================================================== */
router.get('/verify', authMiddleware, async (req, res) => {
    try {
        res.json({ valid: true, user: req.user });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(401).json({ valid: false });
    }
});

/* =====================================================
   JUDGE LOGIN
   ===================================================== */
router.post('/judge/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

        const result = await db.query('SELECT * FROM judges WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const judge = result.rows[0];
        const isValid = await bcrypt.compare(password, judge.password_hash);
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: judge.id, username: judge.username, role: 'judge' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: judge.id, username: judge.username, role: 'judge' } });
    } catch (error) {
        console.error('Judge login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/* =====================================================
   PARTICIPANT LOGIN (ROBUST VERSION)
   ===================================================== */
const handleParticipantLogin = async (req, res) => {
    try {
        const accessToken = req.body.accessToken || req.body.token || req.body.password;
        if (!accessToken) return res.status(400).json({ error: 'Access token required' });

        const result = await db.query('SELECT * FROM teams WHERE access_token = $1', [accessToken]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid access token' });
        }

        const team = result.rows[0];
        
        // Ensure we have a valid ID (Check for id, ID, Id)
        const realId = team.id || team.ID || team.Id;

        if (!realId) {
            console.error("❌ CRITICAL: Team object has no 'id' field!", team);
            return res.status(500).json({ error: 'Database error: Team ID missing' });
        }

        // Correctly structure the payload
        const tokenPayload = { 
            userId: realId, 
            teamId: team.team_id, 
            teamName: team.team_name, 
            role: 'participant' 
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, team: { id: realId, teamId: team.team_id, teamName: team.team_name } });
    } catch (error) {
        console.error('Participant access error:', error);
        res.status(500).json({ error: 'Access failed' });
    }
};

router.post('/participant/access', handleParticipantLogin);
router.post('/participant/login', handleParticipantLogin);

module.exports = router;
