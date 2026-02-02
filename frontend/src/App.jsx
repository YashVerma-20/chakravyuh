import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Public pages
import IntroVideo from './pages/IntroVideo';
import Home from './pages/Home';
import EventOverview from './pages/EventOverview';
import Rules from './pages/Rules';
import RoundDescription from './pages/RoundDescription';

// Participant pages
import ParticipantAccess from './pages/participant/ParticipantAccess';
import WaitingScreen from './pages/participant/WaitingScreen';
import QuestionScreen from './pages/participant/QuestionScreen';
import LockedScreen from './pages/participant/LockedScreen';
import CompletedScreen from './pages/participant/CompletedScreen';
import ParticipantLeaderboard from './pages/participant/ParticipantLeaderboard';

// Judge pages
import JudgeLogin from './pages/judge/JudgeLogin';
import JudgeDashboard from './pages/judge/JudgeDashboard';
import SubmissionsView from './pages/judge/SubmissionsView';
import ScoringView from './pages/judge/ScoringView'; // 🔥 FIXED: Imported the new file
import ConfigPanel from './pages/judge/ConfigPanel';
import LeaderboardManagement from './pages/judge/LeaderboardManagement';

// Protected route wrapper
const ProtectedRoute = ({ children, requireJudge = false }) => {
    const { isAuthenticated, isJudge } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (requireJudge && !isJudge) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/intro" element={<IntroVideo />} />
                <Route path="/" element={<Home />} />
                <Route path="/overview" element={<EventOverview />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/round-description" element={<RoundDescription />} />

                {/* Participant routes */}
                <Route path="/participant/access" element={<ParticipantAccess />} />
                <Route path="/participant/waiting" element={<ProtectedRoute><WaitingScreen /></ProtectedRoute>} />
                <Route path="/participant/question" element={<ProtectedRoute><QuestionScreen /></ProtectedRoute>} />
                <Route path="/participant/locked" element={<ProtectedRoute><LockedScreen /></ProtectedRoute>} />
                <Route path="/participant/completed" element={<ProtectedRoute><CompletedScreen /></ProtectedRoute>} />
                <Route path="/participant/leaderboard" element={<ParticipantLeaderboard />} />

                {/* Judge routes */}
                <Route path="/judge/login" element={<JudgeLogin />} />
                <Route path="/judge/dashboard" element={<ProtectedRoute requireJudge><JudgeDashboard /></ProtectedRoute>} />
                <Route path="/judge/submissions" element={<ProtectedRoute requireJudge><SubmissionsView /></ProtectedRoute>} />
                
                {/* 🔥 FIXED: Updated to use ScoringView */}
                <Route path="/judge/scoring" element={<ProtectedRoute requireJudge><ScoringView /></ProtectedRoute>} />
                
                <Route path="/judge/config" element={<ProtectedRoute requireJudge><ConfigPanel /></ProtectedRoute>} />
                <Route path="/judge/leaderboard" element={<ProtectedRoute requireJudge><LeaderboardManagement /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
