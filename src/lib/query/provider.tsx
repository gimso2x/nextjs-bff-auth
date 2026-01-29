'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: (failureCount, error) => {
                            if (error instanceof Error && 'status' in error) {
                                const status = (error as { status: number }).status;
                                if (status === 401 || status === 403) {
                                    return false;
                                }
                            }
                            return failureCount < 3;
                        },
                        staleTime: 5 * 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                    mutations: {
                        onError: (error) => {
                            console.error('Mutation error:', error);

                            // Handle session expired - redirect to error page
                            if (error instanceof Error && 'status' in error) {
                                const status = (error as { status: number }).status;
                                if (status === 401) {
                                    if (typeof window !== 'undefined') {
                                        window.location.href = '/error-page?code=session_expired';
                                    }
                                }
                            }
                        },
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
