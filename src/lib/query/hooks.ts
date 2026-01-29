import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientApi from '../axios/client';

export interface User {
    id: string;
    email: string;
    name: string;
    memberCode: number;
}

/**
 * Hook to fetch current user information.
 * Returns null if not authenticated.
 */
export function useUser() {
    return useQuery<User | null>({
        queryKey: ['user', 'me'],
        queryFn: async () => {
            try {
                const response = await clientApi.get<User>('/auth/me');
                return response.data;
            } catch {
                return null;
            }
        },
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Hook to handle logout.
 */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await clientApi.post('/auth/logout');
        },
        onSuccess: () => {
            queryClient.clear();
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        },
    });
}
