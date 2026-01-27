import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const LeaderboardManagement = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roundState, setRoundState] = useState('');
    const [ranks, setRanks] = useState({});
    const [notes, setNotes] = useState({});

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const [lbRes, configRes] = await Promise.all([
                api.get('/judge/leaderboard'),
                api.get('/judge/config')
            ]);
            setLeaderboard(lbRes.data.leaderboard);
            setRoundState(configRes.data.config.round_state);

            // Initialize ranks and notes
            const initialRanks = {};
            const initialNotes = {};
            lbRes.data.leaderboard.forEach(entry => {
                initialRanks[entry.team_id] = entry.manual_rank || '';
                initialNotes[entry.team_id] = entry.notes || '';
            });
            setRanks(initialRanks);
            setNotes(initialNotes);
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRank = async (teamId) => {
        const rank = ranks[teamId];
        if (!rank || rank < 1) {
            alert('Please enter a valid rank');
            return;
        }

        try {
            await api.put('/judge/leaderboard/rank', {
                teamId,
                rank: parseInt(rank),
                notes: notes[teamId] || ''
            });
            alert('Rank assigned successfully!');
            await fetchLeaderboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to assign rank');
        }
    };

    const handlePublish = async () => {
        if (!window.confirm('Are you sure you want to publish the leaderboard? This action is FINAL and cannot be undone.')) {
            return;
        }

        try {
            await api.post('/judge/leaderboard/publish');
            alert('Leaderboard published successfully!');
            await fetchLeaderboard();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to publish leaderboard');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-chakra-darker flex items-center justify-center">
                <div className="text-2xl text-chakra-gold animate-pulse">Loading...</div>
            </div>
        );
    }

    const isPublished = roundState === 'LEADERBOARD_PUBLISHED';
    const allRanked = leaderboard.every(entry => entry.manual_rank !== null);

    return (
        <div className="min-h-screen bg-chakra-darker">
            <div className="bg-chakra-dark border-b border-chakra-border py-4 px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-cinzel text-chakra-gold">Leaderboard Management</h1>
                    <Link to="/judge/dashboard" className="btn btn-secondary">
                        ← Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-8">
                {/* Status Banner */}
                {isPublished ? (
                    <div className="card bg-green-900 bg-opacity-20 border-green-500 mb-8">
                        <p className="text-green-400 text-lg">
                            ✅ <strong>Leaderboard is PUBLISHED</strong> and read-only. Rankings are final.
                        </p>
                    </div>
                ) : (
                    <div className="card bg-chakra-gold bg-opacity-10 border-chakra-gold mb-8">
                        <p className="text-white mb-4">
                            <strong>Manual Ranking Required:</strong> Assign ranks to all teams before publishing.
                        </p>
                        <p className="text-gray-400 text-sm">
                            The leaderboard does NOT auto-sort. You must manually assign each team's rank based on scores and other factors.
                        </p>
                    </div>
                )}

                {/* Leaderboard */}
                <div className="space-y-4 mb-8">
                    {leaderboard
                        .sort((a, b) => (a.manual_rank || 999) - (b.manual_rank || 999))
                        .map((entry) => (
                            <div key={entry.team_id} className="card">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {entry.team_name}
                                        </h3>
                                        <p className="text-gray-400 text-sm">Team ID: {entry.team_id}</p>
                                        <p className="text-chakra-orange text-2xl font-bold mt-2">
                                            {entry.final_score} points
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Assign Rank</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={ranks[entry.team_id] || ''}
                                            onChange={(e) => setRanks(prev => ({ ...prev, [entry.team_id]: e.target.value }))}
                                            className="input"
                                            placeholder="Enter rank (1, 2, 3...)"
                                            disabled={isPublished}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Notes (Optional)</label>
                                        <textarea
                                            value={notes[entry.team_id] || ''}
                                            onChange={(e) => setNotes(prev => ({ ...prev, [entry.team_id]: e.target.value }))}
                                            className="input h-20 resize-none"
                                            placeholder="Judge notes..."
                                            disabled={isPublished}
                                        />
                                    </div>
                                </div>

                                {!isPublished && (
                                    <button
                                        onClick={() => handleAssignRank(entry.team_id)}
                                        className="btn btn-secondary mt-4"
                                    >
                                        Save Rank
                                    </button>
                                )}

                                {entry.manual_rank && (
                                    <div className="mt-4 text-green-400 text-sm">
                                        ✓ Rank assigned: <strong>#{entry.manual_rank}</strong>
                                    </div>
                                )}
                            </div>
                        ))}

                    {leaderboard.length === 0 && (
                        <div className="card text-center text-gray-400">
                            No teams have completed the round yet
                        </div>
                    )}
                </div>

                {/* Publish Button */}
                {!isPublished && allRanked && leaderboard.length > 0 && (
                    <div className="card bg-chakra-gold bg-opacity-10 border-chakra-gold">
                        <h3 className="text-2xl font-cinzel text-chakra-gold mb-4">
                            Ready to Publish
                        </h3>
                        <p className="text-gray-300 mb-6">
                            All teams have been ranked. Once published, the leaderboard will be visible to participants and rankings become final.
                        </p>
                        <button
                            onClick={handlePublish}
                            className="btn btn-gold text-lg w-full"
                        >
                            🏆 Publish Leaderboard
                        </button>
                    </div>
                )}

                {!isPublished && !allRanked && leaderboard.length > 0 && (
                    <div className="card bg-red-900 bg-opacity-20 border-red-500">
                        <p className="text-red-400">
                            ⚠️ Not all teams have been ranked. Please assign ranks to all teams before publishing.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardManagement;
