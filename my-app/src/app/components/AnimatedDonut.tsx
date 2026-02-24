'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedDonutProps {
    percentage: number;
    duration?: number;
}

export function AnimatedDonut({ percentage, duration = 5000 }: AnimatedDonutProps) {
    const [currentPercent, setCurrentPercent] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Linear easing as requested by user for numbers
            const easing = progress;

            setCurrentPercent(easing * percentage);

            if (progress < 1) {
                window.requestAnimationFrame(animate);
            }
        };

        window.requestAnimationFrame(animate);
    }, [isVisible, percentage, duration]);

    // We keep the same color breakdown as original CSS:
    // Primary color up to currentPercent
    // Secondary color (orange) for 5% after that
    // Background color for the rest
    const primaryEnd = currentPercent;
    const secondaryEnd = currentPercent + (currentPercent > 0 ? 5 : 0);

    return (
        <div
            ref={elementRef}
            className="donut-chart"
            style={{
                background: `conic-gradient(#5c6bc0 ${primaryEnd}%, #ff9800 ${primaryEnd}% ${secondaryEnd}%, #e8eaf6 ${secondaryEnd}% 100%)`
            }}
        >
            <div className="donut-center">
                <h3>{Math.round(currentPercent)}%</h3>
                <p>Balance your<br />expenses</p>
            </div>
        </div>
    );
}
