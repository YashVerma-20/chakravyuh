const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        /**
         * Normalize user object
         * This prevents breaking old tokens or different DB schemas
         */
        req.user = {
            id: decoded.id || decoded.userId,
            username: decoded.username,
            role: decoded.role || decoded.userType || decoded.type || null
        };

        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// ✅ Judge-only middleware (safe + explicit)
const judgeOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'judge') {
        return res.status(403).json({
            error: 'Access denied. Judges only.'
        });
    }
    next();
};

module.exports = { authMiddleware, judgeOnly };
