import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const DescriptiveScoringPanel = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scoring, setScoring] = useState({});
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(null); // Added submitting state

    useEffect(() => {
        fetchSubmissions();
        const interval = setInterval(fetchSubmissions, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchSubmissions = async () => {
        try {
            // 🔥 FIXED: Correct Route is '/api/judge/submissions'
            const response = await api.get('/api/judge/submissions');
            
            // Filter: Descriptive AND Not Evaluated yet
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
        const points = parseFloat(scoring[submissionId]);
        
        if (isNaN(points) || points < 0 || points > maxPoints) {
            alert(`Please enter a valid score between 0 and ${maxPoints}`);
            return;
        }

        setSubmitting(submissionId); // Disable button while saving

        try {
            // 🔥 FIXED: Correct Route '/api/judge/score/update' and added 'isCorrect'
            await api.post('/api/judge/score/update', { 
                submissionId, 
                points,
                isCorrect: points > 0 // Logic: If points > 0, it counts as correct
            });
            
            alert('Score saved successfully!');
            
            // Remove locally to update UI instantly
            setSubmissions(prev => prev.filter(s => s.id !== submissionId));
            setScoring(prev => {
                const newScoring = { ...prev };
                delete newScoring[submissionId];
                return newScoring;
            });

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to save score');
        } finally {
            setSubmitting(null);
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
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl text-white mb-2">All Caught Up!</h2>
                        <p className="text-gray-400">
                            All descriptive answers have been scored.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {submissions.map((sub) => (
                            <div key={sub.id} className="card border border-gray-700">
                                <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1">
                                            {sub.team_name}
                                        </h3>
                                        <p className="text-gray-500 text-sm">
                                            Question {sub.question_position} • Submitted {new Date(sub.submitted_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="bg-purple-900 text-purple-200 px-3 py-1 rounded text-sm font-bold">
                                        Max: {sub.max_points}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-gray-800 p-4 rounded-lg">
                                        <p className="text-gray-400 text-xs uppercase font-bold mb-2">Question</p>
                                        <p className="text-white text-lg">{sub.question_text}</p>
                                    </div>
                                    <div className="bg-gray-900 p-4 rounded-lg border border-chakra-gold border-opacity-30">
                                        <p className="text-chakra-gold text-xs uppercase font-bold mb-2">Team's Answer</p>
                                        <p className="text-white leading-relaxed whitespace-pre-wrap">{sub.answer_text}</p>
                                    </div>
                                </div>

                                <div className="flex items-end gap-4 bg-chakra-darker p-4 rounded-lg">
                                    <div className="flex-1">
                                        <label className="block text-gray-400 text-sm mb-2">
                                            Award Points (0 - {sub.max_points})
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={sub.max_points}
                                            step="1"
                                            value={scoring[sub.id] || ''}
                                            onChange={(e) => setScoring(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                            className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-chakra-gold focus:outline-none"
                                            placeholder={`Enter points...`}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleScore(sub.id, sub.max_points)}
                                        disabled={submitting === sub.id}
                                        className="btn btn-gold h-12 px-8"
                                    >
                                        {submitting === sub.id ? 'Saving...' : 'Save Score'}
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
