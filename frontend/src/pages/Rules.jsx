import React from 'react';
import Navbar from '../components/Navbar';

const Rules = () => {
    return (
        <div className="min-h-screen bg-chakra-darker">
            <Navbar />

            <div className="max-w-5xl mx-auto px-8 py-16">
                <h1 className="text-5xl font-cinzel text-chakra-gold text-glow mb-8">
                    Rules & Regulations
                </h1>

                <div className="space-y-6">
                    <div className="card">
                        <h2 className="text-2xl font-cinzel text-chakra-orange mb-4">Basic Rules</h2>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Only team leaders can access the participant portal</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Each team must answer 7 questions sequentially</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Questions consist of MCQs (auto-evaluated) and descriptive answers (judge-evaluated)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>No time limit—accuracy matters more than speed</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Teams cannot see their scores during the round</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Teams cannot see if their answers are correct or wrong (except through penalties)</span>
                            </li>
                        </ul>
                    </div>

                    <div className="card border-chakra-red">
                        <h2 className="text-2xl font-cinzel text-chakra-red mb-4">⚠️ Penalty System</h2>
                        <div className="space-y-4 text-gray-300">
                            <div className="bg-chakra-dark p-4 rounded-lg">
                                <h3 className="text-chakra-orange font-bold mb-2">Wrong Answer Penalty</h3>
                                <p className="mb-2">When you submit a wrong MCQ answer:</p>
                                <ul className="ml-6 space-y-1">
                                    <li>• Points are deducted (based on judge configuration)</li>
                                    <li>• Team is reset to Question 1</li>
                                    <li>• Questions 2-7 are locked again</li>
                                    <li>• Previous earned points remain (minus penalty)</li>
                                </ul>
                            </div>

                            <div className="bg-chakra-red bg-opacity-20 p-4 rounded-lg border border-chakra-red">
                                <h3 className="text-red-400 font-bold mb-2">3 Wrong Answers = Heavy Penalty</h3>
                                <p className="mb-2">After 3 wrong answers total:</p>
                                <ul className="ml-6 space-y-1">
                                    <li>• Heavy penalty applied</li>
                                    <li>• <strong>New set of 7 questions assigned</strong></li>
                                    <li>• Wrong answer counter resets to 0</li>
                                    <li>• Team restarts from Question 1</li>
                                    <li>• All previous points remain (minus penalties)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="text-2xl font-cinzel text-chakra-orange mb-4">Scoring</h2>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>MCQs: Fixed points for correct answers (configured by judges)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Descriptive: Partial marks possible, evaluated by judges</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Judges can apply manual penalties for rule violations</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Time taken per question is recorded for tie-breaking</span>
                            </li>
                        </ul>
                    </div>

                    <div className="card bg-chakra-gold bg-opacity-10 border-chakra-gold">
                        <h2 className="text-2xl font-cinzel text-chakra-gold mb-4">Leaderboard</h2>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Leaderboard is NOT visible during the round</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Judges manually assign ranks based on scores and other factors</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Leaderboard is published only after round completion</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Once published, rankings are final and read-only</span>
                            </li>
                        </ul>
                    </div>

                    <div className="card border-red-500 bg-red-900 bg-opacity-10">
                        <h2 className="text-2xl font-cinzel text-red-400 mb-4">Prohibited Actions</h2>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex gap-3">
                                <span className="text-red-500">✗</span>
                                <span>Using external help or collaboration with other teams</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-red-500">✗</span>
                                <span>Attempting to manipulate the system or bypass security</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-red-500">✗</span>
                                <span>Multiple submissions for the same question</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-red-500">✗</span>
                                <span>Refreshing or reopening the page to avoid penalties</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rules;
