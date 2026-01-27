import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if intro should be shown
        const watched = localStorage.getItem('chakravyuh_intro_watched');
        if (!watched || watched !== 'true') {
            navigate('/intro');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-chakra-darker">
            <Navbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, #8b0000 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-8 py-24 text-center">
                    <h1 className="text-7xl font-cinzel text-chakra-gold text-glow mb-6 animate-fade-in">
                        CHAKRAVYUH
                    </h1>
                    <h2 className="text-4xl font-cinzel text-white mb-4">Round 3</h2>
                    <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                        The ultimate battle of strategy, knowledge, and resilience.
                        Seven questions. Seven warriors. One team.
                    </p>

                    <div className="flex gap-6 justify-center mb-16">
                        <Link to="/participant/access" className="btn btn-primary text-xl px-10 py-4">
                            Team Login
                        </Link>
                        <Link to="/judge/login" className="btn btn-gold text-xl px-10 py-4">
                            Judge Portal
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
                        <div className="card text-center">
                            <div className="text-4xl font-bold text-chakra-orange mb-2">7</div>
                            <div className="text-gray-400">Questions</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-4xl font-bold text-chakra-orange mb-2">∞</div>
                            <div className="text-gray-400">No Time Limit</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-4xl font-bold text-chakra-orange mb-2">⚔️</div>
                            <div className="text-gray-400">Strategic Penalties</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-chakra-dark py-16">
                <div className="max-w-7xl mx-auto px-8">
                    <h3 className="text-3xl font-cinzel text-white text-center mb-12">
                        Important Information
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Link to="/overview" className="card hover:border-chakra-red transition group">
                            <h4 className="text-xl font-bold text-chakra-gold mb-3 group-hover:text-chakra-orange transition">
                                Event Overview
                            </h4>
                            <p className="text-gray-400">
                                Learn about CHAKRAVYUH and its historical significance
                            </p>
                        </Link>

                        <Link to="/rules" className="card hover:border-chakra-red transition group">
                            <h4 className="text-xl font-bold text-chakra-gold mb-3 group-hover:text-chakra-orange transition">
                                Rules & Regulations
                            </h4>
                            <p className="text-gray-400">
                                Understand the rules, penalties, and scoring system
                            </p>
                        </Link>

                        <Link to="/round-description" className="card hover:border-chakra-red transition group">
                            <h4 className="text-xl font-bold text-chakra-gold mb-3 group-hover:text-chakra-orange transition">
                                Round 3 Details
                            </h4>
                            <p className="text-gray-400">
                                Detailed description of the final round structure
                            </p>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-chakra-darker border-t border-chakra-border py-8">
                <div className="max-w-7xl mx-auto px-8 text-center text-gray-500">
                    <p>© 2026 CHAKRAVYUH Tech Event. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
