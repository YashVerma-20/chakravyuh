import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LockedScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const message = location.state?.message || 'Wrong answer! You have been reset to Question 1.';

    useEffect(() => {
        // Auto-redirect after 5 seconds
        const timer = setTimeout(() => {
            navigate('/participant/question');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-chakra-darker flex items-center justify-center px-4">
            <div className="card max-w-2xl text-center border-red-500 bg-red-900 bg-opacity-10">
                <div className="mb-8">
                    <div className="w-32 h-32 bg-red-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                        <span className="text-6xl">⚠️</span>
                    </div>
                    <h1 className="text-4xl font-cinzel text-red-400 mb-4">
                        Penalty Applied
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Team: <span className="text-white font-semibold">{user?.teamName}</span>
                    </p>
                </div>

                <div className="bg-chakra-darker p-6 rounded-lg mb-6">
                    <p className="text-white text-xl mb-4">
                        {message}
                    </p>
                    <p className="text-gray-400">
                        Your progress has been reset, but earned points (minus penalties) remain.
                    </p>
                </div>

                <div className="text-gray-500">
                    <p>Redirecting to Question 1 in a moment...</p>
                </div>

                <button
                    onClick={() => navigate('/participant/question')}
                    className="btn btn-primary mt-6"
                >
                    Continue to Question 1
                </button>
            </div>
        </div>
    );
};

export default LockedScreen;
