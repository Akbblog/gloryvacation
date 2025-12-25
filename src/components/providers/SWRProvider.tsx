"use client";

import { SWRConfig } from 'swr';
import fetcher from '@/lib/fetcher';

export function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig value={{ 
            fetcher, 
            revalidateOnFocus: true,  // Revalidate when window regains focus
            revalidateOnReconnect: true,  // Revalidate when network reconnects
            shouldRetryOnError: true,  // Enable retry on error
            errorRetryCount: 3,  // Retry up to 3 times
            errorRetryInterval: 1000,  // Start with 1s delay
            dedupingInterval: 2000,  // Dedupe requests within 2 seconds
        }}>
            {children}
        </SWRConfig>
    );
}

export default SWRProvider;
