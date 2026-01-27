import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const SubmissionsView = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, mcq, descriptive
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSubmissions = async () => {
        try {
            const response = await api.get('/judge/submissions');
            setSubmissions(response.data.submissions);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
        // Auto-refresh every 5 seconds for real-time updates
        const interval = setInterval(fetchSubmissions, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredSubmissions = submissions.filter(s => {
        if (filter === 'mcq') return s.question_type === 'MCQ';
        if (filter === 'descriptive') return s.question_type === 'DESCRIPTIVE';
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-chakra-darker flex items-center justify-center">
                <div className="text-2xl text-chakra-gold animate-pulse">Loading submissions...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-chakra-darker">
            <div className="bg-chakra-dark border-b border-chakra-border py-4 px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-cinzel text-chakra-gold">Submissions</h1>
                        {lastUpdated && (
                            <p className="text-gray-500 text-sm mt-1">
                                Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshing every 5s
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setRefreshing(true); fetchSubmissions(); }}
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

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Filter */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        All ({submissions.length})
                    </button>
                    <button
                        onClick={() => setFilter('mcq')}
                        className={`btn ${filter === 'mcq' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        MCQ ({submissions.filter(s => s.question_type === 'MCQ').length})
                    </button>
                    <button
                        onClick={() => setFilter('descriptive')}
                        className={`btn ${filter === 'descriptive' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Descriptive ({submissions.filter(s => s.question_type === 'DESCRIPTIVE').length})
                    </button>
                </div>

                {/* Submissions List */}
                <div className="space-y-4">
                    {filteredSubmissions.map((sub) => (
                        <div key={sub.id} className="card">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {sub.team_name}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        {new Date(sub.submitted_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-sm ${sub.question_type === 'MCQ' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
                                        }`}>
                                        {sub.question_type}
                                    </span>
                                    {sub.is_correct !== null && (
                                        <div className={`mt-2 text-sm ${sub.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                                            {sub.is_correct ? '✓ Correct' : '✗ Wrong'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-chakra-dark p-4 rounded-lg mb-3">
                                <p className="text-gray-400 text-sm mb-1">Question:</p>
                                <p className="text-white">{sub.question_text}</p>
                                {sub.question_type === 'MCQ' && (
                                    <p className="text-chakra-gold text-sm mt-2">
                                        Correct Answer: <strong>{sub.correct_answer}</strong>
                                    </p>
                                )}
                            </div>

                            <div className="bg-chakra-darker p-4 rounded-lg mb-3">
                                <p className="text-gray-400 text-sm mb-1">Team's Answer:</p>
                                <p className="text-white">{sub.answer_text}</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-chakra-orange text-lg font-bold">
                                    Points: {sub.points_awarded}
                                </div>
                                {sub.question_type === 'DESCRIPTIVE' && !sub.evaluated_at && (
                                    <Link
                                        to="/judge/scoring"
                                        className="btn btn-gold text-sm"
                                    >
                                        Score This Answer →
                                    </Link>
                                )}
                                {sub.evaluated_at && (
                                    <div className="text-green-400 text-sm">
                                        ✓ Evaluated
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredSubmissions.length === 0 && (
                        <div className="card text-center text-gray-400">
                            No submissions found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmissionsView;
