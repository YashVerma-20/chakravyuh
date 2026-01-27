import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';

const ParticipantLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/participant/leaderboard');
                setLeaderboard(response.data.leaderboard);
            } catch (err) {
                if (err.response?.status === 403) {
                    setError('Leaderboard has not been published yet');
                } else {
                    setError(err.response?.data?.error || 'Failed to load leaderboard');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-chakra-darker">
                <Navbar />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-2xl text-chakra-gold animate-pulse">Loading leaderboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-chakra-darker">
            <Navbar />

            <div className="max-w-5xl mx-auto px-8 py-16">
                <h1 className="text-5xl font-cinzel text-chakra-gold text-glow mb-12 text-center">
                    Final Leaderboard
                </h1>

                {error ? (
                    <div className="card text-center">
                        <div className="text-6xl mb-6">🔒</div>
                        <p className="text-2xl text-gray-400 mb-4">{error}</p>
                        <p className="text-gray-500">
                            The judges will publish the leaderboard after Round 3 is complete.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-secondary mt-6"
                        >
                            Return Home
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leaderboard.map((entry, index) => (
                            <div
                                key={entry.team_name}
                                className={`card flex items-center justify-between ${entry.manual_rank === 1 ? 'border-chakra-gold bg-chakra-gold bg-opacity-10 shadow-gold-glow' :
                                        entry.manual_rank === 2 ? 'border-gray-400 bg-gray-400 bg-opacity-5' :
                                            entry.manual_rank === 3 ? 'border-orange-700 bg-orange-700 bg-opacity-5' :
                                                ''
                                    }`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${entry.manual_rank === 1 ? 'bg-chakra-gold text-black' :
                                            entry.manual_rank === 2 ? 'bg-gray-400 text-black' :
                                                entry.manual_rank === 3 ? 'bg-orange-700 text-white' :
                                                    'bg-chakra-dark text-white'
                                        }`}>
                                        {entry.manual_rank}
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-bold ${entry.manual_rank === 1 ? 'text-chakra-gold' : 'text-white'
                                            }`}>
                                            {entry.team_name}
                                        </h3>
                                        {entry.manual_rank === 1 && (
                                            <p className="text-chakra-gold text-sm">🏆 Champions</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-chakra-orange">
                                        {entry.final_score}
                                    </div>
                                    <div className="text-gray-500 text-sm">points</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!error && leaderboard.length === 0 && (
                    <div className="card text-center">
                        <p className="text-gray-400">No entries yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParticipantLeaderboard;
