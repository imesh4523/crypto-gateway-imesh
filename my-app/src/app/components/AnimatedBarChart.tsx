'use client';

import { useEffect, useState, useRef } from 'react';

export function AnimatedBarChart() {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const [heights, setHeights] = useState([0, 0, 0, 0]);
    const targetHeights = [50, 80, 45, 60]; // Percentage heights for the bars
    const duration = 5000;

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

            const easing = progress; // Linear as requested

            const currentHeights = targetHeights.map(target => easing * target);
            setHeights(currentHeights);

            if (progress < 1) {
                window.requestAnimationFrame(animate);
            }
        };

        window.requestAnimationFrame(animate);
    }, [isVisible]);

    return (
        <div ref={elementRef} className="bar-chart-container">
            <div className="chart-bg-bar">
                <div className="chart-active-bar blue-purple-gradient" style={{ height: `${heights[0]}%` }}></div>
            </div>
            <div className="chart-bg-bar">
                <div className="chart-active-bar blue-purple-gradient" style={{ height: `${heights[1]}%` }}></div>
            </div>
            <div className="chart-bg-bar">
                <div className="chart-active-bar blue-purple-gradient" style={{ height: `${heights[2]}%` }}></div>
            </div>
            <div className="chart-bg-bar">
                <div className="chart-active-bar blue-purple-gradient" style={{ height: `${heights[3]}%` }}></div>
            </div>
        </div>
    );
}
