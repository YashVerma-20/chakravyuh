import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const JudgeLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        // ✅ DO NOT add /api here
        const response = await api.post('/api/auth/judge/login', {
            username,
            password
        });

        login(response.data.token, response.data.user);
        navigate('/judge/dashboard');
    } catch (err) {
        setError(err.response?.data?.error || 'Login failed');
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="min-h-screen bg-chakra-darker flex items-center justify-center px-4">
            <div className="card max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-cinzel text-chakra-gold text-glow mb-2">
                        Judge Portal
                    </h1>
                    <p className="text-gray-400">CHAKRAVYUH Round 3</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-300 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input"
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-gold text-lg disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-500 hover:text-chakra-orange transition text-sm"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JudgeLogin;
