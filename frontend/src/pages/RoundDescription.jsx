import React from 'react';
import Navbar from '../components/Navbar';

const RoundDescription = () => {
    return (
        <div className="min-h-screen bg-chakra-darker">
            <Navbar />

            <div className="max-w-5xl mx-auto px-8 py-16">
                <h1 className="text-5xl font-cinzel text-chakra-gold text-glow mb-8">
                    Round 3: The Final Challenge
                </h1>

                <div className="space-y-6">
                    <div className="card">
                        <h2 className="text-2xl font-cinzel text-chakra-orange mb-4">Structure</h2>
                        <p className="text-gray-300 mb-4">
                            Round 3 consists of <strong className="text-chakra-gold">7 progressive questions</strong>, each representing one of the seven layers of the Chakravyuh. Your team must answer all questions sequentially.
                        </p>
                        <div className="bg-chakra-dark p-4 rounded-lg">
                            <ul className="space-y-2 text-gray-300">
                                <li><strong className="text-chakra-orange">Question Types:</strong> Multiple Choice (MCQ) and Descriptive</li>
                                <li><strong className="text-chakra-orange">Total Questions:</strong> 7 per team</li>
                                <li><strong className="text-chakra-orange">Time Limit:</strong> None (focus on accuracy)</li>
                                <li><strong className="text-chakra-orange">Progression:</strong> Sequential only</li>
                            </ul>
                        </div>
                    </div>

                    <div className="card border-chakra-red">
                        <h2 className="text-2xl font-cinzel text-chakra-red mb-4">What Makes This Different?</h2>
                        <div className="space-y-4 text-gray-300">
                            <p>Unlike traditional quizzes, CHAKRAVYUH Round 3 focuses on resilience and strategic thinking:</p>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-chakra-dark p-4 rounded-lg">
                                    <h3 className="text-chakra-gold font-bold mb-2">❌ No Instant Feedback</h3>
                                    <p className="text-sm">You won't know if your answer is right or wrong—penalties are the only hint.</p>
                                </div>
                                <div className="bg-chakra-dark p-4 rounded-lg">
                                    <h3 className="text-chakra-gold font-bold mb-2">🔒 Score Hidden</h3>
                                    <p className="text-sm">Your total score is invisible during the round to prevent strategic gaming.</p>
                                </div>
                                <div className="bg-chakra-dark p-4 rounded-lg">
                                    <h3 className="text-chakra-gold font-bold mb-2">↩️ Reset Mechanics</h3>
                                    <p className="text-sm">Wrong answers send you back to Question 1, but earned points persist.</p>
                                </div>
                                <div className="bg-chakra-dark p-4 rounded-lg">
                                    <h3 className="text-chakra-gold font-bold mb-2">🎯 New Question Sets</h3>
                                    <p className="text-sm">After 3 wrong answers, you get an entirely new set of questions.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-chakra-gold bg-opacity-10 border-chakra-gold">
                        <h2 className="text-2xl font-cinzel text-chakra-gold mb-4">Flow Diagram</h2>
                        <div className="bg-chakra-dark p-6 rounded-lg">
                            <pre className="text-chakra-gold text-sm font-mono">
                                {`Question 1 → Question 2 → Question 3 → ... → Question 7 ✓
    ↑                                                    
Wrong Answer → Reset + Penalty                           
    ↑                                                     
3 Wrong → Heavy Penalty + NEW QUESTION SET → Q1         `}
                            </pre>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="text-2xl font-cinzel text-chakra-orange mb-4">Judge-Controlled Elements</h2>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Judges manually evaluate descriptive answers with partial marks</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Leaderboard ranks are manually assigned by judges (not auto-sorted)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-chakra-gold">•</span>
                                <span>Scoring config is set before round starts and locked during play</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoundDescription;
