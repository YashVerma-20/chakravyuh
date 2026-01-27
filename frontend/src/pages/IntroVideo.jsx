import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const IntroVideo = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [hasWatched, setHasWatched] = useState(false);

    useEffect(() => {
        // Check if intro was already watched
        const watched = localStorage.getItem('chakravyuh_intro_watched');
        if (watched === 'true') {
            navigate('/');
        }
    }, [navigate]);

    const handleSkip = () => {
        localStorage.setItem('chakravyuh_intro_watched', 'true');
        navigate('/');
    };

    const handleVideoEnd = () => {
        localStorage.setItem('chakravyuh_intro_watched', 'true');
        navigate('/');
    };

    return (
        <div className="fixed inset-0 bg-black z-50">
            {/* Dark cinematic overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

            {/* Video */}
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                onEnded={handleVideoEnd}
            >
                <source src="/assets/intro-video/intro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Skip button */}
            <button
                onClick={handleSkip}
                className="absolute top-8 right-8 z-20 btn btn-secondary text-lg hover:scale-105 transform transition"
            >
                Skip Intro →
            </button>

            {/* Branding overlay */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 text-center">
                <h1 className="text-6xl font-cinzel text-chakra-gold text-glow mb-4 animate-pulse-slow">
                    CHAKRAVYUH
                </h1>
                <p className="text-xl text-white opacity-80">Round 3 - The Final Battle</p>
            </div>
        </div>
    );
};

export default IntroVideo;
