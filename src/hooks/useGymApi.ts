import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Gym, GymLink } from '@/lib/gameData';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface CheckInPayload {
    gymId: number;
    qrSecret: string;
    userLocation: {
        lat: number;
        lng: number;
    };
}

export interface CheckInResponse {
    success: boolean;
    message: string;
    auraReward?: number;
    gymLink?: GymLink;
}

export function useGymApi() {
    const { getAccessToken, authenticated, user } = usePrivy();
    const queryClient = useQueryClient();

    const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
        if (!authenticated) {
            throw new Error('User must be authenticated to perform this action.');
        }

        const token = await getAccessToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw {
                status: response.status,
                message: errorData.message || 'An unexpected error occurred',
                ...errorData
            };
        }

        return response.json();
    };

    // 1. Fetch Gym Details
    const useGymDetails = (gymId: number | null) => {
        return useQuery<Gym>({
            queryKey: ['gym', gymId],
            queryFn: () => fetchWithAuth(`/api/gym/${gymId}`),
            enabled: !!gymId && authenticated,
            staleTime: 1000 * 60 * 5, // 5 minutes
        });
    };

    // 2. Fetch User's Gym Link
    const useUserGymLink = () => {
        return useQuery<GymLink | null>({
            queryKey: ['user-gym-link', user?.id],
            queryFn: () => fetchWithAuth(`/api/user/gym-link`),
            enabled: authenticated && !!user?.id,
            retry: false,
        });
    };

    // 3. Fetch All Gyms (for discovery or admin)
    const useAllGyms = () => {
        return useQuery<Gym[]>({
            queryKey: ['gyms'],
            queryFn: () => fetchWithAuth('/api/gyms'),
            enabled: authenticated,
        });
    };

    // 4. Register Gym Mutation
    const registerGymMutation = useMutation<Gym, any, { name: string; address: string }>({
        mutationFn: (payload) => fetchWithAuth('/api/gym/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gyms'] });
            toast.success('Gym registered successfully!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Registration failed');
        }
    });

    // 5. Check-In Mutation
    const checkInMutation = useMutation<CheckInResponse, any, CheckInPayload>({
        mutationFn: (payload) => fetchWithAuth('/api/gym/check-in', {
            method: 'POST',
            body: JSON.stringify({
                ...payload,
                userId: user?.id,
            }),
        }),
        onSuccess: (data) => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['user-gym-link', user?.id] });

            if (data.auraReward) {
                toast.success(`Check-in successful! Gained ${data.auraReward} Aura.`);
            } else {
                toast.success('Successfully linked to gym!');
            }
        },
        onError: (error: any) => {
            console.error('Check-in error:', error);

            const errorMessage = error.message || 'Check-in failed';

            if (error.status === 409) {
                toast.error('You have already checked in today.', {
                    description: 'Come back tomorrow for more rewards!'
                });
            } else if (error.status === 403) {
                toast.error('Location mismatch', {
                    description: 'You must be physically at the gym to check in.'
                });
            } else if (error.status === 401) {
                toast.error('Authentication Error', {
                    description: 'Please log in again.'
                });
            } else {
                toast.error(errorMessage);
            }
        }
    });

    return {
        useGymDetails,
        useUserGymLink,
        checkIn: checkInMutation.mutateAsync,
        isCheckingIn: checkInMutation.isPending,
        checkInError: checkInMutation.error,
        isAuthenticated: authenticated,
    };
}
