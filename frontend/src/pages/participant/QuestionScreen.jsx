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
            setLoading(true);
            setError('');

            const res = await api.get('/participant/question/current');

            const data = res.data;

            // Round not active yet
            if (data?.status === 'LOCKED') {
                navigate('/participant/waiting');
                return;
            }

            // Round completed
            if (data?.status === 'COMPLETED') {
                navigate('/participant/completed');
                return;
            }

            if (!data?.question) {
                throw new Error('No question received');
            }

            // Parse MCQ options safely
            if (data.question.type === 'MCQ' && data.question.options) {
                let options = data.question.options;

                if (typeof options === 'string') {
                    try {
                        options = JSON.parse(options);
                    } catch {
                        options = {};
                    }
                }

                data.question.options = options;
            }

            setQuestionData(data);
        } catch (err) {
            console.error('Fetch question error:', err);
            setError(err.response?.data?.error || 'Question not found');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!answer.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            const res = await api.post('/participant/question/submit', { answer });

            const action = res.data?.action;

            if (action === 'RESET_TO_Q1' || action === 'RESET_NEW_SET') {
                navigate('/participant/locked', {
                    state: { message: res.data.message }
                });
            } else if (action === 'COMPLETED') {
                navigate('/participant/completed');
            } else if (action === 'QUEUED_FOR_EVALUATION') {
                navigate('/participant/waiting', {
                    state: {
                        message: 'Answer submitted! Waiting for judge evaluation...',
                        isDescriptiveEvaluation: true
                    }
                });
            } else {
                // NEXT_QUESTION or default
                setAnswer('');
                fetchQuestion();
            }
        } catch (err) {
            console.error('Submit answer error:', err);
            setError(err.response?.data?.error || 'Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-chakra-darker flex items-center justify-center">
                <div className="text-2xl text-chakra-gold animate-pulse">
                    Loading question...
                </div>
            </div>
        );
    }

    if (!questionData) {
        return (
            <div className="min-h-screen bg-chakra-darker flex items-center justify-center">
                <div className="card max-w-md text-center">
                    <p className="text-red-400 mb-4">
                        {error || 'Unable to load question'}
                    </p>
                    <button
                        onClick={fetchQuestion}
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
            {/* Header */}
            <div className="bg-chakra-dark border-b border-chakra-border py-4 px-8">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-cinzel text-chakra-gold">
                        CHAKRAVYUH
                    </h1>
                    <div className="text-gray-400">
                        Team:{' '}
                        <span className="text-white font-semibold">
                            {user?.teamName}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-8 py-16">
                {/* Progress */}
                <div className="mb-8">
                    <h2 className="text-4xl font-cinzel text-chakra-gold mb-4">
                        Question {currentQuestion} of {totalQuestions}
                    </h2>
                    <div className="w-full bg-chakra-gray rounded-full h-3">
                        <div
                            className="bg-chakra-red h-3 rounded-full transition-all"
                            style={{
                                width: `${(currentQuestion / totalQuestions) * 100}%`
                            }}
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="card mb-8">
                    <div className="mb-4">
                        <span className="text-chakra-orange text-sm font-semibold">
                            {question.type === 'MCQ'
                                ? 'Multiple Choice'
                                : 'Descriptive Answer'}
                        </span>
                        <span className="text-gray-500 text-sm ml-4">
                            Max Points: {question.maxPoints}
                        </span>
                    </div>

                    <h3 className="text-2xl text-white mb-6">
                        {question.text}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {question.type === 'MCQ' ? (
                            <div className="space-y-3">
                                {Object.entries(question.options).map(
                                    ([key, value]) => (
                                        <label
                                            key={key}
                                            className="flex items-center gap-3 p-4 bg-chakra-dark rounded-lg cursor-pointer hover:bg-chakra-border"
                                        >
                                            <input
                                                type="radio"
                                                name="answer"
                                                value={key}
                                                checked={answer === key}
                                                onChange={(e) =>
                                                    setAnswer(e.target.value)
                                                }
                                            />
                                            <span className="text-white">
                                                <strong className="text-chakra-orange">
                                                    {key}.
                                                </strong>{' '}
                                                {value}
                                            </span>
                                        </label>
                                    )
                                )}
                            </div>
                        ) : (
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="input min-h-[200px]"
                                placeholder="Enter your detailed answer here..."
                                required
                            />
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
                            {submitting
                                ? 'Submitting...'
                                : 'Submit Answer'}
                        </button>
                    </form>
                </div>

                <div className="card bg-chakra-red bg-opacity-10 border-chakra-red">
                    <p className="text-gray-300 text-sm">
                        <strong className="text-red-400">⚠️ Warning:</strong>{' '}
                        Wrong answers may reset your progress.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QuestionScreen;
