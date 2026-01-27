import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const QuestionScreen = () => {
    const [questionData, setQuestionData] = useState(null);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchQuestion = async () => {
        try {
            const response = await api.get('/participant/question/current');

            if (response.data.status === 'LOCKED' || response.data.status === 'COMPLETED') {
                navigate('/participant/waiting');
            } else if (response.data.status === 'ACTIVE') {
                const questionData = response.data;

                // Parse options if it's a string
                if (questionData.question && questionData.question.options) {
                    let parsedOptions = questionData.question.options;

                    // Handle JSON string
                    if (typeof parsedOptions === 'string') {
                        try {
                            parsedOptions = JSON.parse(parsedOptions);
                        } catch (e) {
                            console.error('Failed to parse options:', e);
                            parsedOptions = {};
                        }
                    }

                    questionData.question.options = parsedOptions;
                }

                setQuestionData(questionData);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load question');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestion();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!answer.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            const response = await api.post('/participant/question/submit', { answer });

            if (response.data.action === 'RESET_TO_Q1' || response.data.action === 'RESET_NEW_SET') {
                navigate('/participant/locked', { state: { message: response.data.message } });
            } else if (response.data.action === 'COMPLETED') {
                navigate('/participant/completed');
            } else if (response.data.action === 'NEXT_QUESTION') {
                setAnswer('');
                await fetchQuestion();
            } else if (response.data.action === 'QUEUED_FOR_EVALUATION') {
                // Navigate to waiting screen for judge evaluation
                navigate('/participant/waiting', {
                    state: {
                        message: 'Answer submitted! Waiting for judge evaluation...',
                        isDescriptiveEvaluation: true
                    }
                });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-chakra-darker flex items-center justify-center">
                <div className="text-2xl text-chakra-gold animate-pulse">Loading question...</div>
            </div>
        );
    }

    if (!questionData) {
        return (
            <div className="min-h-screen bg-chakra-darker flex items-center justify-center">
                <div className="card max-w-md">
                    <p className="text-red-400 mb-4">{error || 'Unable to load question'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { question, currentQuestion, totalQuestions } = questionData;

    return (
        <div className="min-h-screen bg-chakra-darker">
            <div className="bg-chakra-dark border-b border-chakra-border py-4 px-8">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-cinzel text-chakra-gold">CHAKRAVYUH</h1>
                    <div className="text-gray-400">
                        Team: <span className="text-white font-semibold">{user?.teamName}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-8 py-16">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-4xl font-cinzel text-chakra-gold">
                            Question {currentQuestion} of {totalQuestions}
                        </h2>
                    </div>
                    <div className="w-full bg-chakra-gray rounded-full h-3">
                        <div
                            className="bg-chakra-red h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="card mb-8">
                    <div className="mb-4">
                        <span className="text-chakra-orange text-sm font-semibold">
                            {question.type === 'MCQ' ? 'Multiple Choice' : 'Descriptive Answer'}
                        </span>
                        <span className="text-gray-500 text-sm ml-4">
                            Max Points: {question.maxPoints}
                        </span>
                    </div>
                    <h3 className="text-2xl text-white mb-6 leading-relaxed">
                        {question.text}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {question.type === 'MCQ' ? (
                            <div className="space-y-3">
                                {Object.entries(question.options).map(([key, value]) => (
                                    <label
                                        key={key}
                                        className="flex items-center gap-3 p-4 bg-chakra-dark rounded-lg cursor-pointer hover:bg-chakra-border transition"
                                    >
                                        <input
                                            type="radio"
                                            name="answer"
                                            value={key}
                                            checked={answer === key}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            className="w-5 h-5"
                                        />
                                        <span className="text-white">
                                            <strong className="text-chakra-orange">{key}.</strong> {value}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="input min-h-[200px]"
                                    placeholder="Enter your detailed answer here..."
                                    required
                                />
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !answer}
                            className="btn btn-primary w-full text-lg disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Answer'}
                        </button>
                    </form>
                </div>

                <div className="card bg-chakra-red bg-opacity-10 border-chakra-red">
                    <p className="text-gray-300 text-sm">
                        <strong className="text-red-400">⚠️ Warning:</strong> Wrong answers result in penalties and will reset your progress to Question 1. Choose carefully!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QuestionScreen;
