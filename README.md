# Chakravyuh - Round 3 Quiz Platform

A full-stack quiz management system for competitive coding events with real-time scoring, judge evaluation, and penalty mechanics.

## 🚀 Features

### For Participants
- **Secure Access**: Token-based authentication system
- **Dynamic Questions**: 7 questions per team (6 MCQ + 1 Descriptive)
- **Real-time Feedback**: Instant evaluation for MCQ answers
- **Progressive Difficulty**: Advance through questions on correct answers
- **Penalty System**: Wrong answers reset progress with score penalties

### For Judges
- **Dashboard**: Monitor all team submissions and progress
- **Manual Evaluation**: Score descriptive answers
- **Round Control**: Start, pause, complete, and reset rounds
- **Leaderboard Management**: Manual ranking with notes
- **Configuration**: Customize points and penalties

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- SQLite (better-sqlite3)
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React
- Vite
- React Router
- Axios

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd chakravyuh
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Initialize Database**
```bash
cd ../backend
node init-db.js
node add-questions.js
```

## 🎮 Running the Application

### Start Backend Server
```bash
cd backend
npm start
```
Server runs on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173` (or 3000)

## 🔐 Default Credentials

### Judge Login
- **URL**: `/judge/login`
- **Username**: `admin` or `judge1`
- **Password**: `admin123`

### Participant Access
- **URL**: `/participant/access`
- **Test Token**: `DUMMY_TEST_001_2026`

### Teams
- 16 Real teams (TEAM_BB, TEAM_TI, etc.)
- 8 Dummy teams for testing (DUMMY_01 to DUMMY_08)

## 📊 Database Schema

- **teams**: Team credentials and access tokens
- **judges**: Judge accounts
- **question_bank**: All questions (41 MCQ + 1 Descriptive × 7 sets)
- **team_questions**: Question assignments per team
- **team_state**: Current progress and scores
- **submissions**: All answers submitted
- **leaderboard**: Final rankings
- **round_config**: Round settings and state

## 🎯 Game Mechanics

### Scoring
- **MCQ Correct**: +10 points (configurable)
- **Wrong Answer**: -5 points + reset to Q1
- **3 Wrong Answers**: -20 points + new question set
- **Descriptive**: Judge-evaluated (max 15 points)

### Round States
1. `LOCKED`: Pre-round (configuration allowed)
2. `ACTIVE`: Round in progress
3. `COMPLETED`: Round ended
4. `LEADERBOARD_PUBLISHED`: Results visible to participants

## 📁 Project Structure

```
chakravyuh/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API endpoints
│   ├── init-db.js       # Database initialization
│   ├── add-questions.js # Question seeding
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Route pages
│   │   └── App.jsx      # Main app
│   └── vite.config.js
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/judge/login` - Judge login
- `POST /api/auth/participant/access` - Participant access

### Participant Routes (Protected)
- `GET /api/participant/question/current` - Get current question
- `POST /api/participant/question/submit` - Submit answer
- `GET /api/participant/status` - Get team status
- `GET /api/participant/leaderboard` - View published leaderboard

### Judge Routes (Protected)
- `GET /api/judge/submissions` - View all submissions
- `POST /api/judge/score` - Score descriptive answers
- `POST /api/judge/round/start` - Start round
- `POST /api/judge/round/complete` - Complete round
- `POST /api/judge/round/reset` - Reset round
- `GET /api/judge/leaderboard` - View leaderboard
- `PUT /api/judge/leaderboard/rank` - Assign ranks

## 🐛 Known Issues & Fixes

If participants can't access questions:
```bash
cd backend
node fix-assign-questions.js
```

## 📝 License

This project is created for academic/event purposes.

## 👥 Contributors

Created for Chakravyuh Round 3 coding competition.
