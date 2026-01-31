import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';

const ParticipantAccess = () => {
    const [accessToken, setAccessToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            /**
             * axios baseURL already includes `/api`
             * so DO NOT prefix `/api` here
             */
            const response = await api.post('/api/auth/participant/access', {
                accessToken: accessToken.trim()
            });

            // Store token + participant info
            login(response.data.token, {
                ...response.data.team,
                role: 'participant'
            });

            navigate('/participant/question');
        } catch (err) {
            console.error('Participant access error:', err);
            setError(
                err.response?.data?.error ||
                'Invalid or expired access token'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-chakra-darker">
            <Navbar />

            <div className="flex items-center justify-center min-h-[80vh] px-4">
                <div className="card max-w-md w-full">
                    <h1 className="text-4xl font-cinzel text-chakra-gold text-glow mb-6 text-center">
                        Team Access
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 mb-2">
                                Access Token
                            </label>
                            <input
                                type="text"
                                value={accessToken}
                                onChange={(e) => setAccessToken(e.target.value)}
                                className="input"
                                placeholder="Enter your team access token"
                                required
                            />
                            <p className="text-gray-500 text-sm mt-2">
                                Only team leaders should access this portal
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary text-lg disabled:opacity-50"
                        >
                            {loading ? 'Accessing...' : 'Enter Round 3'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Don't have an access token? Contact the organizers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParticipantAccess;
