import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ConfigPanel = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        mcqPoints: 10,
        descriptivePoints: 15,
        wrongPenalty: -5,
        threeWrongPenalty: -20
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // 🔥 FIXED: Added '/api' prefix
                const response = await api.get('/api/judge/config');
                setConfig(response.data.config);
                
                // Map Backend (snake_case) to Frontend (camelCase)
                setFormData({
                    mcqPoints: response.data.config.mcq_correct_points,
                    descriptivePoints: response.data.config.descriptive_max_points,
                    wrongPenalty: response.data.config.wrong_answer_penalty,
                    threeWrongPenalty: response.data.config.three_wrong_penalty
                });
            } catch (err) {
                console.error('Failed to fetch config:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSave = async () => {
        if (config.is_locked) {
            alert('Configuration is locked because the round has started');
            return;
        }

        setSaving(true);
        try {
            // 🔥 FIXED: Convert CamelCase back to Snake_Case for Backend
            const payload = {
                mcq_correct_points: formData.mcqPoints,
                descriptive_max_points: formData.descriptivePoints,
                wrong_answer_penalty: formData.wrongPenalty,
                three_wrong_penalty: formData.threeWrongPenalty
            };

            // 🔥 FIXED: Use '/api' prefix and POST method
            await api.post('/api/judge/config/update', payload);
            
            alert('Configuration updated successfully!');
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-chakra-darker flex items-center justify-center">
                <div className="text-2xl text-chakra-gold animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-chakra-darker">
            <div className="bg-chakra-dark border-b border-chakra-border py-4 px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-cinzel text-chakra-gold">Scoring Configuration</h1>
                    <Link to="/judge/dashboard" className="btn btn-secondary">
                        ← Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-8 py-8">
                {config?.is_locked && (
                    <div className="card bg-red-900 bg-opacity-20 border-red-500 mb-8">
                        <p className="text-red-400 text-lg">
                            ⚠️ <strong>Configuration is LOCKED</strong> because the round has started. No changes can be made.
                        </p>
                    </div>
                )}

                <div className="card">
                    <h2 className="text-2xl font-cinzel text-white mb-6">Reward Points</h2>

                    <div className="space-y-6 mb-8">
                        <div>
                            <label className="block text-gray-300 mb-2">
                                MCQ Correct Answer Points
                            </label>
                            <input
                                type="number"
                                value={formData.mcqPoints}
                                onChange={(e) => setFormData(prev => ({ ...prev, mcqPoints: parseInt(e.target.value) }))}
                                className="input"
                                disabled={config?.is_locked}
                            />
                            <p className="text-gray-500 text-sm mt-1">
                                Points awarded for each correct MCQ answer
                            </p>
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">
                                Descriptive Maximum Points
                            </label>
                            <input
                                type="number"
                                value={formData.descriptivePoints}
                                onChange={(e) => setFormData(prev => ({ ...prev, descriptivePoints: parseInt(e.target.value) }))}
                                className="input"
                                disabled={config?.is_locked}
                            />
                            <p className="text-gray-500 text-sm mt-1">
                                Maximum points for descriptive answers (judges can award partial marks)
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-cinzel text-red-400 mb-6">Penalties</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-300 mb-2">
                                Wrong Answer Penalty
                            </label>
                            <input
                                type="number"
                                value={formData.wrongPenalty}
                                onChange={(e) => setFormData(prev => ({ ...prev, wrongPenalty: parseInt(e.target.value) }))}
                                className="input"
                                disabled={config?.is_locked}
                            />
                            <p className="text-gray-500 text-sm mt-1">
                                Negative points applied for each wrong MCQ answer (e.g., -5)
                            </p>
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">
                                3 Wrong Answers Heavy Penalty
                            </label>
                            <input
                                type="number"
                                value={formData.threeWrongPenalty}
                                onChange={(e) => setFormData(prev => ({ ...prev, threeWrongPenalty: parseInt(e.target.value) }))}
                                className="input"
                                disabled={config?.is_locked}
                            />
                            <p className="text-gray-500 text-sm mt-1">
                                Heavy penalty when team accumulates 3 wrong answers (e.g., -20)
                            </p>
                        </div>
                    </div>

                    {!config?.is_locked && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-gold w-full mt-8 text-lg disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    )}
                </div>

                <div className="card bg-chakra-gold bg-opacity-10 border-chakra-gold mt-6">
                    <h3 className="text-lg font-bold text-chakra-gold mb-2">ℹ️ Important</h3>
                    <p className="text-gray-300 text-sm">
                        Once you start the round, this configuration will be locked and cannot be changed to ensure fair play for all teams.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConfigPanel;
