"use client";

import { useState, useEffect } from 'react';
import './HeroTypewriter.css';

const phrases = [
    "Accept Payments Globally",
    "Borderless Crypto Gateway",
    "Fast & Secure Transactions",
    "The Future of Payments"
];

export function HeroTypewriter() {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(100);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        const currentPhrase = phrases[currentPhraseIndex];

        if (!isDeleting && currentText === currentPhrase) {
            // Pause at end
            timer = setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && currentText === '') {
            setIsDeleting(false);
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
            // Pause before starting next
            timer = setTimeout(() => { }, 500);
        } else {
            timer = setTimeout(() => {
                const delta = isDeleting ? -1 : 1;
                setCurrentText(currentPhrase.substring(0, currentText.length + delta));
                setTypingSpeed(isDeleting ? 40 : 80);
            }, typingSpeed);
        }

        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentPhraseIndex, typingSpeed]);

    return (
        <span className="typewriter-container">
            <span className="typewriter-text">{currentText}</span>
            <span className="cursor-blink">|</span>
        </span>
    );
}
