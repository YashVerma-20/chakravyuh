import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const DescriptiveScoringPanel = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scoring, setScoring] = useState({});
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchSubmissions();
        // Auto-refresh every 5 seconds for real-time updates
        const interval = setInterval(fetchSubmissions, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await api.get('/judge/submissions');
            const descriptive = response.data.submissions.filter(
                s => s.question_type === 'DESCRIPTIVE' && !s.evaluated_at
            );
            setSubmissions(descriptive);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleManualRefresh = () => {
        setRefreshing(true);
        fetchSubmissions();
    };

    const handleScore = async (submissionId, maxPoints) => {
        const points = scoring[submissionId];
        if (points === undefined || points < 0 || points > maxPoints) {
            alert(`Please enter a valid score between 0 and ${maxPoints}`);
            return;
        }

        try {
            await api.post('/judge/score', { submissionId, points: parseFloat(points) });
            alert('Score saved successfully!');
            await fetchSubmissions();
            setScoring(prev => ({ ...prev, [submissionId]: '' }));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save score');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-chakra-darker flex items-center justify-center">
                <div className="text-2xl text-chakra-gold animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-chakra-darker">
            <div className="bg-chakra-dark border-b border-chakra-border py-4 px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-cinzel text-chakra-gold">Score Descriptive Answers</h1>
                        {lastUpdated && (
                            <p className="text-gray-500 text-sm mt-1">
                                Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshing every 5s
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleManualRefresh}
                            disabled={refreshing}
                            className="btn btn-secondary"
                        >
                            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
                        </button>
                        <Link to="/judge/dashboard" className="btn btn-secondary">
                            ← Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-8">
                {submissions.length === 0 ? (
                    <div className="card text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-2xl text-gray-400">
                            All descriptive answers have been scored!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {submissions.map((sub) => (
                            <div key={sub.id} className="card">
                                <div className="mb-4">
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {sub.team_name}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        Question {sub.question_position} • Submitted {new Date(sub.submitted_at).toLocaleString()}
                                    </p>
                                </div>

                                <div className="bg-chakra-dark p-4 rounded-lg mb-4">
                                    <p className="text-gray-400 text-sm mb-2">Question:</p>
                                    <p className="text-white text-lg">{sub.question_text}</p>
                                </div>

                                <div className="bg-chakra-darker p-4 rounded-lg mb-4">
                                    <p className="text-gray-400 text-sm mb-2">Team's Answer:</p>
                                    <p className="text-white leading-relaxed">{sub.answer_text}</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-gray-400 text-sm mb-2">
                                            Award Points (0 - {sub.max_points})
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={sub.max_points}
                                            step="0.5"
                                            value={scoring[sub.id] || ''}
                                            onChange={(e) => setScoring(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                            className="input"
                                            placeholder={`Enter points (max: ${sub.max_points})`}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleScore(sub.id, sub.max_points)}
                                        className="btn btn-gold mt-6"
                                    >
                                        Save Score
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DescriptiveScoringPanel;
