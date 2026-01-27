import React from 'react';
import Navbar from '../components/Navbar';

const EventOverview = () => {
    return (
        <div className="min-h-screen bg-chakra-darker">
            <Navbar />

            <div className="max-w-5xl mx-auto px-8 py-16">
                <h1 className="text-5xl font-cinzel text-chakra-gold text-glow mb-8">
                    About CHAKRAVYUH
                </h1>

                <div className="space-y-8">
                    <div className="card">
                        <h2 className="text-2xl font-cinzel text-chakra-orange mb-4">The Legend</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Chakravyuh, derived from the ancient Sanskrit epic Mahabharata, is a complex military
                            formation designed to trap and confuse enemies. The formation consists of seven layers,
                            each progressively more difficult to penetrate. Only the most skilled warriors could
                            navigate through all seven layers.
                        </p>
                    </div>

                    <div className="card">
                        <h2 className="text-2xl font-cinzel text-chakra-orange mb-4">The Challenge</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Just like the legendary formation, CHAKRAVYUH Round 3 presents seven questions—each
                            representing a layer of the formation. Your team must demonstrate:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>Deep technical knowledge</li>
                            <li>Strategic thinking under pressure</li>
                            <li>Resilience in the face of setbacks</li>
                            <li>Ability to learn from mistakes</li>
                        </ul>
                    </div>

                    <div className="card">
                        <h2 className="text-2xl font-cinzel text-chakra-orange mb-4">The Stakes</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Unlike traditional quizzes, CHAKRAVYUH implements strict penalties for wrong answers.
                            This mirrors the real-world consequences of poor decision-making in software development
                            and system design. Teams must balance speed with accuracy, aggression with caution.
                        </p>
                    </div>

                    <div className="card bg-chakra-red bg-opacity-20 border-chakra-red">
                        <h2 className="text-2xl font-cinzel text-chakra-gold mb-4">The Final Battle</h2>
                        <p className="text-white leading-relaxed">
                            Round 3 is the culmination of your journey. Only the strongest teams have made it this far.
                            The leaderboard will reveal the true champions—those who navigated the Chakravyuh with
                            skill, strategy, and determination.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventOverview;
