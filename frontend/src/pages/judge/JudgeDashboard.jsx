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
                    // ❗ NO /api here
                    api.get('/judge/dashboard/stats'),
                    api.get('/judge/config')
                ]);

                setStats(statsRes.data);
                setConfig(configRes.data.config);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
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
        if (!window.confirm('This will DELETE all round data. Continue?')) return;

        try {
            await api.post('/judge/round/reset');
            alert('Round reset successfully');
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.error || 'Reset failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-chakra-gold">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-chakra-darker">
            <div className="bg-chakra-dark border-b py-4 px-8 flex justify-between">
                <h1 className="text-3xl text-chakra-gold">Judge Dashboard</h1>
                <div>
                    Welcome, <b>{user?.username}</b>
                    <button onClick={logout} className="ml-4 btn btn-secondary">
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="card mb-8">
                    <h2 className="text-xl text-chakra-gold mb-2">Round Control</h2>
                    <p className="text-white text-2xl">{stats?.roundState}</p>

                    <div className="mt-4 flex gap-4">
                        {stats?.roundState === 'LOCKED' && (
                            <button
                                onClick={() => handleRoundControl('start')}
                                className="btn btn-gold"
                            >
                                Start Round
                            </button>
                        )}

                        {stats?.roundState === 'ACTIVE' && (
                            <button
                                onClick={() => handleRoundControl('complete')}
                                className="btn btn-primary"
                            >
                                Complete Round
                            </button>
                        )}

                        {(stats?.roundState === 'COMPLETED' ||
                            stats?.roundState === 'LEADERBOARD_PUBLISHED') && (
                            <button
                                onClick={handleResetRound}
                                className="btn bg-red-600 text-white"
                            >
                                Reset Round
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="card text-center">
                        <div className="text-4xl text-chakra-orange">
                            {stats?.totalTeams}
                        </div>
                        Total Teams
                    </div>

                    <div className="card text-center">
                        <div className="text-4xl text-chakra-orange">
                            {stats?.completedTeams}
                        </div>
                        Completed Teams
                    </div>

                    <div className="card text-center">
                        <div className="text-4xl text-chakra-orange">
                            {stats?.totalSubmissions}
                        </div>
                        Submissions
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Link to="/judge/submissions" className="card">
                        View Submissions
                    </Link>
                    <Link to="/judge/scoring" className="card">
                        Score Answers
                    </Link>
                    <Link to="/judge/config" className="card">
                        Scoring Config
                    </Link>
                    <Link to="/judge/leaderboard" className="card">
                        Leaderboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default JudgeDashboard;
