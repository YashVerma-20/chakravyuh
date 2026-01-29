const jwt = require('jsonwebtoken');

/**
 * Generic authentication middleware
 * - Verifies JWT
 * - Attaches decoded user to req.user
 */
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // ✅ Safe check (prevents crashes)
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // decoded contains: { userId, username?, teamId?, role }
        req.user = decoded;

        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Judge-only middleware
 * - Allows both "judge" and "admin"
 * - Case-insensitive
 * - DOES NOT break participant auth
 */
const judgeOnly = (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(403).json({ error: 'Access denied' });
    }

    const role = req.user.role.toLowerCase();

    // ✅ Allow admin + judge
    if (role !== 'judge' && role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Judges only.' });
    }

    next();
};

module.exports = { authMiddleware, judgeOnly };
