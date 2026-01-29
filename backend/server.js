require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// ✅ DB INIT
const initDb = require('./init-db');

const app = express();
const PORT = process.env.PORT || 5000;

/* =====================================================
   🔐 HELMET (SAFE CSP FIX)
   ===================================================== */
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                "style-src": ["'self'", "'unsafe-inline'", "https:"],
                "img-src": ["'self'", "data:", "https:"],
            },
        },
    })
);

/* =====================================================
   🌍 CORS (VERCEL + LOCALHOST SAFE)
   ===================================================== */
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (
            origin.startsWith('http://localhost:3000') ||
            origin.startsWith('http://localhost:5173')
        ) {
            return callback(null, true);
        }

        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* =====================================================
   🧩 BODY PARSERS
   ===================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   🚀 INIT DATABASE (SAFE)
   ===================================================== */
initDb();

/* =====================================================
   📜 REQUEST LOGGER
   ===================================================== */
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/* =====================================================
   🧠 ROUTES
   ===================================================== */
const authRoutes = require('./routes/auth');
const participantRoutes = require('./routes/participant');
const judgeRoutes = require('./routes/judge');

app.use('/api/auth', authRoutes);
app.use('/api/participant', participantRoutes);
app.use('/api/judge', judgeRoutes);

/* =====================================================
   ❤️ ROOT + HEALTH (FIXES RENDER HEAD /)
   ===================================================== */
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'CHAKRAVYUH Backend',
        timestamp: new Date().toISOString(),
    });
});

app.head('/', (req, res) => {
    res.status(200).end();
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'CHAKRAVYUH Backend is running',
        timestamp: new Date().toISOString(),
    });
});

/* =====================================================
   ❌ 404 HANDLER
   ===================================================== */
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

/* =====================================================
   💥 ERROR HANDLER (CORS SAFE)
   ===================================================== */
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

/* =====================================================
   ▶️ START SERVER
   ===================================================== */
app.listen(PORT, () => {
    console.log(`\n🚀 CHAKRAVYUH Backend Server`);
    console.log(`📡 Running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
});

module.exports = app;
