import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ScoringView = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({}); // Stores input values
    const [submitting, setSubmitting] = useState(null);

    // Fetch only UNEVALUATED Descriptive answers
    const fetchPending = async () => {
        try {
            const res = await api.get('/api/judge/submissions');
            const descriptivePending = res.data.submissions.filter(
                s => s.question_type === 'DESCRIPTIVE' && !s.evaluated_at
            );
            setPending(descriptivePending);
        } catch (err) {
            console.error("Failed to load pending", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleScoreChange = (id, value) => {
        setScores({ ...scores, [id]: value });
    };

    const submitScore = async (submissionId, maxPoints) => {
        const points = parseInt(scores[submissionId]);

        if (isNaN(points) || points < 0 || points > maxPoints) {
            alert(`Please enter a valid score between 0 and ${maxPoints}`);
            return;
        }

        setSubmitting(submissionId);
        try {
            // Send score to backend
            await api.post('/api/judge/score/update', {
                submissionId,
                points,
                isCorrect: points > 0 // If points > 0, we mark it as "Correct"
            });
            
            // Remove from list locally to update UI instantly
            setPending(prev => prev.filter(s => s.id !== submissionId));
            alert('Score saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save score.');
        } finally {
            setSubmitting(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-chakra-darker flex items-center justify-center text-chakra-gold animate-pulse">
            Loading pending answers...
        </div>
    );

    return (
        <div className="min-h-screen bg-chakra-darker text-white">
            <div className="bg-chakra-dark border-b border-chakra-border py-4 px-8">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-cinzel text-chakra-gold">Manual Scoring</h1>
                    <Link to="/judge/submissions" className="btn btn-secondary">
                        ← Back to Submissions
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-8">
                {pending.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-4xl mb-4">🎉</div>
                        <h2 className="text-2xl text-chakra-gold mb-2">All Caught Up!</h2>
                        <p className="text-gray-400">There are no pending descriptive answers to score.</p>
                        <Link to="/judge/dashboard" className="btn btn-primary mt-6 inline-block">
                            Return to Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {pending.map(item => (
                            <div key={item.id} className="card border border-gray-700">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{item.team_name}</h3>
                                        <p className="text-gray-500 text-sm">Submitted at: {new Date(item.submitted_at).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="bg-purple-900 text-purple-200 px-3 py-1 rounded text-sm font-bold">
                                        Max Points: {item.max_points || 15}
                                    </div>
                                </div>

                                {/* Question & Answer */}
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-gray-800 p-4 rounded">
                                        <p className="text-gray-400 text-xs uppercase font-bold mb-2">Question</p>
                                        <p className="text-gray-200">{item.question_text}</p>
                                    </div>
                                    <div className="bg-gray-900 p-4 rounded border border-chakra-gold border-opacity-30">
                                        <p className="text-chakra-gold text-xs uppercase font-bold mb-2">Student's Answer</p>
                                        <p className="text-white whitespace-pre-wrap">{item.answer_text}</p>
                                    </div>
                                </div>

                                {/* Scoring Input */}
                                <div className="flex items-end gap-4 bg-chakra-darker p-4 rounded">
                                    <div className="flex-1">
                                        <label className="block text-gray-400 text-sm mb-1">Points Awarded (0 - {item.max_points || 15})</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            max={item.max_points || 15}
                                            className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-chakra-gold focus:outline-none"
                                            placeholder="Enter score..."
                                            value={scores[item.id] || ''}
                                            onChange={(e) => handleScoreChange(item.id, e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => submitScore(item.id, item.max_points || 15)}
                                        disabled={submitting === item.id || !scores[item.id]}
                                        className="btn btn-gold h-11 px-8"
                                    >
                                        {submitting === item.id ? 'Saving...' : 'Submit Score'}
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

export default ScoringView;
