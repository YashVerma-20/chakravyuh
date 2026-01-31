import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const WaitingScreen = () => {
    const [roundState, setRoundState] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isDescriptiveEvaluation = location.state?.isDescriptiveEvaluation || false;
    const customMessage = location.state?.message || '';

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await api.get('/api/participant/status');
                setRoundState(response.data.roundState);

                // If waiting for descriptive evaluation, check if we can move to next question
                if (isDescriptiveEvaluation && response.data.roundState === 'ACTIVE') {
                    if (response.data.isCompleted) {
                        navigate('/participant/completed');
                    } else if (response.data.canProceed) {
                        // Descriptive answer has been evaluated, move to next question
                        navigate('/participant/question');
                    }
                    // Otherwise, keep waiting for judge evaluation
                } else if (response.data.roundState === 'ACTIVE' && !response.data.isCompleted) {
                    navigate('/participant/question');
                } else if (response.data.isCompleted) {
                    navigate('/participant/completed');
                }
            } catch (err) {
                console.error('Status check failed:', err);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [navigate, isDescriptiveEvaluation]);

    if (loading) {
        return (
            <div className="min-h-screen bg-chakra-darker flex items-center justify-center">
                <div className="text-2xl text-chakra-gold animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-chakra-darker flex items-center justify-center px-4">
            <div className="card max-w-2xl text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 bg-chakra-red rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                        <span className="text-4xl">⏳</span>
                    </div>
                    <h1 className="text-4xl font-cinzel text-chakra-gold mb-4">
                        {isDescriptiveEvaluation ? 'Answer Submitted!' : 'Round Not Active'}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Team: <span className="text-white font-semibold">{user?.teamName}</span>
                    </p>
                </div>

                {isDescriptiveEvaluation && roundState === 'ACTIVE' && (
                    <div className="bg-chakra-orange bg-opacity-10 border border-chakra-orange p-6 rounded-lg">
                        <p className="text-white text-lg mb-4">
                            🎯 Your descriptive answer has been submitted successfully!
                        </p>
                        <p className="text-gray-400 mb-4">
                            A judge is currently reviewing your answer. You will automatically proceed to the next question once the evaluation is complete.
                        </p>
                        <p className="text-chakra-gold text-sm">
                            Please wait... This page will auto-refresh.
                        </p>
                    </div>
                )}

                {!isDescriptiveEvaluation && roundState === 'LOCKED' && (
                    <div className="bg-chakra-dark p-6 rounded-lg">
                        <p className="text-white text-lg mb-4">
                            The round has not started yet. Please wait for judges to begin Round 3.
                        </p>
                        <p className="text-gray-500">
                            This page will automatically refresh when the round becomes active.
                        </p>
                    </div>
                )}

                {roundState === 'COMPLETED' && (
                    <div className="bg-chakra-gold bg-opacity-10 border border-chakra-gold p-6 rounded-lg">
                        <p className="text-white text-lg mb-4">
                            Round 3 has been completed by the judges.
                        </p>
                        <p className="text-gray-400 mb-4">
                            Leaderboard will be published soon.
                        </p>
                        <button
                            onClick={() => navigate('/participant/leaderboard')}
                            className="btn btn-gold"
                        >
                            Check Leaderboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaitingScreen;
