import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const CompletedScreen = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [restarting, setRestarting] = useState(false);

    const handleRestart = async () => {
        if (!window.confirm('Are you sure you want to restart the quiz? This will reset all your progress.')) {
            return;
        }

        setRestarting(true);
        try {
            await api.post('/api/participant/restart');
            navigate('/participant/question');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to restart quiz');
        } finally {
            setRestarting(false);
        }
    };

    return (
        <div className="min-h-screen bg-chakra-darker flex items-center justify-center px-4">
            <div className="card max-w-2xl text-center border-chakra-gold bg-chakra-gold bg-opacity-5">
                <div className="mb-8">
                    <div className="w-32 h-32 bg-chakra-gold rounded-full mx-auto mb-6 flex items-center justify-center shadow-gold-glow">
                        <span className="text-6xl">✓</span>
                    </div>
                    <h1 className="text-5xl font-cinzel text-chakra-gold text-gold-glow mb-4">
                        Congratulations!
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Team: <span className="text-white font-semibold">{user?.teamName}</span>
                    </p>
                </div>

                <div className="bg-chakra-darker p-6 rounded-lg mb-6">
                    <p className="text-white text-xl mb-4">
                        You have completed all 7 questions of CHAKRAVYUH Round 3!
                    </p>
                    <p className="text-gray-400 mb-4">
                        Your journey through the Chakravyuh formation is complete.
                    </p>
                    <p className="text-gray-500">
                        Judges are evaluating the submissions. The leaderboard will be published soon.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/participant/leaderboard')}
                        className="btn btn-gold w-full text-lg"
                    >
                        Check Leaderboard
                    </button>
                    <button
                        onClick={handleRestart}
                        disabled={restarting}
                        className="btn btn-primary w-full disabled:opacity-50"
                    >
                        {restarting ? 'Restarting...' : 'Restart Quiz'}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-secondary w-full"
                    >
                        Return Home
                    </button>
                </div>

                <div className="mt-8 text-gray-500 text-sm">
                    <p>Thank you for participating in CHAKRAVYUH Round 3!</p>
                </div>
            </div>
        </div>
    );
};

export default CompletedScreen;
