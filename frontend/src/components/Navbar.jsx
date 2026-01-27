import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-chakra-dark border-b border-chakra-border py-4 px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <h1 className="text-3xl font-cinzel text-chakra-gold text-glow">
                        CHAKRAVYUH
                    </h1>
                </Link>

                <div className="flex gap-6">
                    <Link to="/overview" className="text-white hover:text-chakra-orange transition">
                        Overview
                    </Link>
                    <Link to="/rules" className="text-white hover:text-chakra-orange transition">
                        Rules
                    </Link>
                    <Link to="/round-description" className="text-white hover:text-chakra-orange transition">
                        Round 3
                    </Link>
                    <Link to="/participant/leaderboard" className="text-white hover:text-chakra-gold transition font-semibold">
                        Leaderboard
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
