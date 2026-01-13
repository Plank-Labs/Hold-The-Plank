import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Gym, GymLink, MOCK_GYM, MOCK_GYMS } from '@/lib/gameData';
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

        try {
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
        } catch (error: any) {
            // Check for connection refusal (TypeError: Failed to fetch)
            if (error.name === 'TypeError' || error.message?.includes('fetch')) {
                console.warn(`Connection to ${API_BASE_URL} refused. Mocking ${endpoint}`);
                throw { status: 503, message: 'Backend unavailable' };
            }
            throw error;
        }
    };

    // 1. Fetch Gym Details
    const useGymDetails = (gymId: number | null) => {
        return useQuery<Gym>({
            queryKey: ['gym', gymId],
            queryFn: async () => {
                if (import.meta.env.DEV && gymId === 1) return MOCK_GYM;
                try {
                    return await fetchWithAuth(`/api/gym/${gymId}`);
                } catch (err: any) {
                    if (import.meta.env.DEV || err.status === 503) {
                        const mock = MOCK_GYMS.find(g => g.id === gymId);
                        if (mock) return mock;
                    }
                    throw err;
                }
            },
            enabled: !!gymId && authenticated,
            staleTime: 1000 * 60 * 5,
        });
    };

    // 2. Fetch User's Gym Link
    const useUserGymLink = () => {
        return useQuery<GymLink | null>({
            queryKey: ['user-gym-link', user?.id],
            queryFn: async () => {
                try {
                    return await fetchWithAuth(`/api/user/gym-link`);
                } catch (err: any) {
                    if (import.meta.env.DEV || err.status === 503) return null;
                    throw err;
                }
            },
            enabled: authenticated && !!user?.id,
            retry: false,
        });
    };

    // 3. Fetch All Gyms
    const useAllGyms = () => {
        return useQuery<Gym[]>({
            queryKey: ['gyms'],
            queryFn: async () => {
                try {
                    return await fetchWithAuth('/api/gyms');
                } catch (err: any) {
                    if (import.meta.env.DEV || err.status === 503) return MOCK_GYMS;
                    throw err;
                }
            },
            enabled: authenticated,
        });
    };

    // 4. Register Gym Mutation
    const registerGymMutation = useMutation<Gym, any, { name: string; address: string }>({
        mutationFn: async (payload) => {
            try {
                return await fetchWithAuth('/api/gym/register', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            } catch (err: any) {
                if (import.meta.env.DEV || err.status === 503) {
                    await new Promise(r => setTimeout(r, 1000));
                    return { ...payload, id: Math.floor(Math.random() * 1000), isActive: true } as Gym;
                }
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gyms'] });
            toast.success('Gym registered (Mock Mode)');
        }
    });

    // 5. Check-In Mutation
    const checkInMutation = useMutation<CheckInResponse, any, CheckInPayload>({
        mutationFn: async (payload) => {
            if (import.meta.env.DEV && (payload.qrSecret === 'MOCK_SECRET_ALPHA_77' || payload.gymId === 1)) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                return {
                    success: true,
                    message: "Mock check-in successful",
                    auraReward: 50,
                    gymLink: {
                        gymId: payload.gymId,
                        linkedAt: new Date().toISOString(),
                        lastCheckin: new Date().toISOString()
                    }
                };
            }

            try {
                return await fetchWithAuth('/api/gym/check-in', {
                    method: 'POST',
                    body: JSON.stringify({ ...payload, userId: user?.id }),
                });
            } catch (err: any) {
                if (import.meta.env.DEV || err.status === 503) {
                    await new Promise(r => setTimeout(r, 1500));
                    return {
                        success: true,
                        message: "Mock check-in successful",
                        auraReward: 50,
                        gymLink: {
                            gymId: payload.gymId,
                            linkedAt: new Date().toISOString(),
                            lastCheckin: new Date().toISOString()
                        }
                    };
                }
                throw err;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['user-gym-link', user?.id] });
            if (data.auraReward) {
                toast.success(`Check-in successful! Gained ${data.auraReward} Aura.`);
            } else {
                toast.success('Successfully linked to gym!');
            }
        },
        onError: (error: any) => {
            const errorMessage = error.message || 'Check-in failed';
            if (error.status === 409) {
                toast.error('Already checked in today.');
            } else if (error.status === 403) {
                toast.error('Too far from gym');
            } else {
                toast.error(errorMessage);
            }
        }
    });

    return {
        useGymDetails,
        useUserGymLink,
        useAllGyms,
        registerGym: registerGymMutation.mutateAsync,
        isRegisteringGym: registerGymMutation.isPending,
        checkIn: checkInMutation.mutateAsync,
        isCheckingIn: checkInMutation.isPending,
        checkInError: checkInMutation.error,
        isAuthenticated: authenticated,
    };
}
