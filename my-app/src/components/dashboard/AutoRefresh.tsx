'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            // Secretly queries the server for the latest data without a hard reload
            router.refresh();
        }, intervalMs);

        return () => clearInterval(interval);
    }, [router, intervalMs]);

    return null; // This component handles silent background updates and renders nothing
}
