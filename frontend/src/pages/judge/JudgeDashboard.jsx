import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const JudgeDashboard = () => {
    const [stats, setStats] = useState(null);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, configRes] = await Promise.all([
                    api.get('/judge/dashboard/stats'),
                    api.get('/judge/config')
                ]);
                setStats(statsRes.data);
                setConfig(configRes.data.config);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s

        return () => clearInterval(interval);
    }, []);

    const handleRoundControl = async (action) => {
        try {
            await api.post(`/judge/round/${action}`);
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed');
        }
    };

    const handleResetRound = async () => {
        const confirmed = window.confirm(
            '⚠️ WARNING: This will DELETE all team progress, submissions, and leaderboard data!\n\n' +
            'Are you absolutely sure you want to reset the round and start fresh?\n\n' +
            'This action CANNOT be undone!'
        );

        if (!confirmed) return;

        try {
            await api.post('/judge/round/reset');
            alert('✅ Round reset successfully! All data cleared.');
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to reset round');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-chakra-darker flex items-center justify-center">
                <div className="text-2xl text-chakra-gold animate-pulse">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-chakra-darker">
            {/* Header */}
            <div className="bg-chakra-dark border-b border-chakra-border py-4 px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-cinzel text-chakra-gold">Judge Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">
                            Welcome, <span className="text-white font-semibold">{user?.username}</span>
                        </span>
                        <button onClick={logout} className="btn btn-secondary text-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Round Control */}
                <div className="card mb-8 bg-chakra-gold bg-opacity-5 border-chakra-gold">
                    <h2 className="text-2xl font-cinzel text-chakra-gold mb-4">Round Control</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 mb-2">Current State:</p>
                            <p className="text-3xl font-bold text-white">{stats?.roundState}</p>
                        </div>
                        <div className="flex gap-4">
                            {stats?.roundState === 'LOCKED' && (
                                <button
                                    onClick={() => handleRoundControl('start')}
                                    className="btn btn-gold text-lg"
                                >
                                    🚀 Start Round
                                </button>
                            )}
                            {stats?.roundState === 'ACTIVE' && (
                                <button
                                    onClick={() => handleRoundControl('complete')}
                                    className="btn btn-primary text-lg"
                                >
                                    🏁 Complete Round
                                </button>
                            )}
                            {(stats?.roundState === 'COMPLETED' || stats?.roundState === 'LEADERBOARD_PUBLISHED') && (
                                <button
                                    onClick={handleResetRound}
                                    className="btn bg-red-600 hover:bg-red-700 text-white text-lg"
                                >
                                    🔄 Reset Round (Start Fresh)
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card text-center">
                        <div className="text-5xl font-bold text-chakra-orange mb-2">
                            {stats?.totalTeams}
                        </div>
                        <div className="text-gray-400">Total Teams</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-5xl font-bold text-chakra-orange mb-2">
                            {stats?.completedTeams}
                        </div>
                        <div className="text-gray-400">Completed Teams</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-5xl font-bold text-chakra-orange mb-2">
                            {stats?.totalSubmissions}
                        </div>
                        <div className="text-gray-400">Total Submissions</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link to="/judge/submissions" className="card hover:border-chakra-orange transition group">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-chakra-orange transition">
                            📝 View Submissions
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Review all team submissions and answers
                        </p>
                    </Link>

                    <Link to="/judge/scoring" className="card hover:border-chakra-orange transition group">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-chakra-orange transition">
                            ✍️ Score Descriptive Answers
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Manually evaluate and assign partial marks
                        </p>
                    </Link>

                    <Link to="/judge/config" className="card hover:border-chakra-orange transition group">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-chakra-orange transition">
                            ⚙️ Scoring Configuration
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Set points and penalties {config?.is_locked && '(Locked)'}
                        </p>
                    </Link>

                    <Link to="/judge/leaderboard" className="card hover:border-chakra-gold transition group">
                        <h3 className="text-xl font-bold text-chakra-gold mb-2 group-hover:text-yellow-500 transition">
                            🏆 Leaderboard Management
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Manually assign ranks and publish results
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default JudgeDashboard;
