import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const LeaderboardManagement = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchLeaderboard = async () => {
        try {
            const res = await api.get('/api/judge/leaderboard');
            setLeaderboard(res.data.leaderboard);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Failed to load leaderboard", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 5000); // Auto-refresh every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-chakra-darker flex items-center justify-center text-chakra-gold animate-pulse">
            Loading Live Leaderboard...
        </div>
    );

    return (
        <div className="min-h-screen bg-chakra-darker text-white font-sans">
            <div className="bg-chakra-dark border-b border-chakra-border py-4 px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-cinzel text-chakra-gold">Live Leaderboard</h1>
                        {lastUpdated && (
                            <p className="text-gray-500 text-sm mt-1">
                                Auto-updating • Last synced: {lastUpdated.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                    <div className="space-x-4">
                        <button 
                            onClick={fetchLeaderboard} 
                            className="px-4 py-2 bg-chakra-blue rounded hover:bg-blue-600 transition"
                        >
                            🔄 Refresh Now
                        </button>
                        <Link to="/judge/dashboard" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition">
                            ← Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8">
                <div className="bg-chakra-dark rounded-lg border border-gray-700 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800 text-chakra-gold uppercase text-sm tracking-wider">
                                <tr>
                                    <th className="p-5">Rank</th>
                                    <th className="p-5">Team Name</th>
                                    <th className="p-5 text-center">Status</th>
                                    <th className="p-5 text-center">Wrong Answers</th>
                                    <th className="p-5 text-right text-lg">Total Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {leaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-400">
                                            No teams have started the round yet.
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboard.map((team, index) => (
                                        <tr 
                                            key={index} 
                                            className={`transition duration-200 hover:bg-gray-800 ${
                                                index === 0 ? 'bg-yellow-900 bg-opacity-20' : ''
                                            }`}
                                        >
                                            <td className="p-5">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                                    index === 0 ? 'bg-chakra-gold text-black' :
                                                    index === 1 ? 'bg-gray-400 text-black' :
                                                    index === 2 ? 'bg-orange-700 text-white' :
                                                    'text-gray-400'
                                                }`}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="p-5 font-bold text-lg text-white">
                                                {team.team_name}
                                                {index === 0 && <span className="ml-2">👑</span>}
                                            </td>
                                            <td className="p-5 text-center">
                                                {team.is_completed ? (
                                                    <span className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                        Active (Q{team.current_question_position})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-5 text-center text-red-400 font-mono">
                                                {team.wrong_answer_count}
                                            </td>
                                            <td className="p-5 text-right font-mono text-2xl text-chakra-orange font-bold">
                                                {team.total_score}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardManagement;
