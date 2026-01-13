import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useGymApi } from '@/hooks/useGymApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, ShieldCheck, AlertCircle, CheckCircle2, Loader2, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function GymJoin() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, authenticated, ready } = usePrivy();
    const { useGymDetails, checkIn, isCheckingIn } = useGymApi();

    const gymId = searchParams.get('id') ? parseInt(searchParams.get('id')!, 10) : null;
    const qrSecret = searchParams.get('secret') || '';

    const { data: gym, isLoading: isLoadingGym, error: gymError } = useGymDetails(gymId);

    const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');
    const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        if (!gymId) {
            toast.error('Invalid Gym Link', { description: 'Missing gym identification.' });
        }
    }, [gymId]);

    const requestLocation = () => {
        setLocationStatus('requesting');

        // Mock GPS for DEV mode
        if (import.meta.env.DEV && gymId === 1) {
            setTimeout(() => {
                setUserCoords({ lat: 37.9838, lng: 23.7275 }); // Athens coordinates
                setLocationStatus('granted');
                toast.success('Mock GPS Verified (Athens)');
            }, 800);
            return;
        }

        if (!navigator.geolocation) {
            setLocationStatus('error');
            toast.error('Geolocation not supported', { description: 'Your browser doesn\'t support location services.' });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationStatus('granted');
            },
            (error) => {
                console.error('Location error:', error);
                setLocationStatus(error.code === 1 ? 'denied' : 'error');
                toast.error('Location Access Denied', {
                    description: 'We need your location to verify you are at the gym.'
                });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleCheckIn = async () => {
        if (!authenticated) {
            login();
            return;
        }

        if (locationStatus !== 'granted' || !userCoords) {
            requestLocation();
            return;
        }

        if (!gymId || !qrSecret) {
            toast.error('Invalid QR Code', { description: 'The scanned code is missing required information.' });
            return;
        }

        try {
            await checkIn({
                gymId,
                qrSecret,
                userLocation: userCoords
            });
            // Logic for post-success navigation could go here or be handled by the hook's onSuccess
        } catch (err) {
            // Errors are handled by the hook's toast system
        }
    };

    if (!ready || (isLoadingGym && gymId)) {
        return (
            <div className="flex flex-col items-center justify-center min-height-screen p-6 space-y-4 pt-20">
                <Skeleton className="h-12 w-3/4 rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>
        );
    }

    if (gymError || !gymId) {
        return (
            <div className="flex flex-col items-center justify-center min-height-screen p-6 pt-20">
                <Card className="w-full max-w-md border-red-500/20 bg-red-500/5 backdrop-blur-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-red-500/20 p-3 rounded-full w-fit mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <CardTitle className="text-red-500">Gym Not Found</CardTitle>
                        <CardDescription>
                            We couldn't find the gym associated with this QR code.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full bg-[#C5A572] hover:bg-[#A08050] text-[#1a1a2e]" onClick={() => navigate('/')}>
                            Return Home
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-height-screen p-6 pb-20 pt-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-[#C5A572]/30 bg-[#16213e]/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[#C5A572]/20 rounded-full blur-3xl" />

                    <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-[#C5A572]/20 px-3 py-1 rounded-full flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-[#C5A572]" />
                                <span className="text-xs font-bold text-[#C5A572] uppercase tracking-wider">Official Check-In</span>
                            </div>
                            <AnimatePresence mode="wait">
                                {locationStatus === 'granted' ? (
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                        className="flex items-center gap-1 text-green-400 text-xs font-medium"
                                    >
                                        <Navigation className="h-3 w-3" /> {import.meta.env.DEV && gymId === 1 ? 'Mock GPS Active' : 'GPS Verified'}
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                {gym?.name || 'Olympic Gym'}
                            </CardTitle>
                            {import.meta.env.DEV && gymId === 1 && (
                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded border border-yellow-500/30 uppercase tracking-tighter">
                                    Mock Mode
                                </span>
                            )}
                        </div>
                        <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4 shrink-0" />
                            {gym?.address || 'Ancient Greece St, Athens'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="bg-[#1a1a2e]/60 rounded-xl p-4 border border-[#C5A572]/10">
                            <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-widest">Rewards Today</h4>
                            <div className="flex items-center gap-4">
                                <div className="grow text-2xl font-bold text-white">
                                    +{gym?.rewardAuraFixed || 50} <span className="text-[#C5A572] text-sm uppercase">Aura</span>
                                </div>
                                <div className="h-8 w-[1px] bg-[#C5A572]/30" />
                                <div className="grow text-xl font-medium text-gray-300">
                                    <span className="text-sm text-gray-500 block">Daily Limit</span>
                                    1 Check-in
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Requirement</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-300">
                                <div className={`p-2 rounded-lg ${locationStatus === 'granted' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                    {locationStatus === 'granted' ? <CheckCircle2 className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className="font-semibold">{locationStatus === 'granted' ? 'Location Verified' : 'Location Verification Required'}</p>
                                    <p className="text-xs text-gray-500">We must verify you are physically at {gym?.name || 'the gym'}.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        {!authenticated ? (
                            <Button
                                onClick={() => login()}
                                className="w-full bg-[#C5A572] hover:bg-[#A08050] text-[#1a1a2e] font-bold py-6 rounded-xl transition-all"
                            >
                                Log In to Check In
                            </Button>
                        ) : locationStatus !== 'granted' ? (
                            <Button
                                onClick={requestLocation}
                                disabled={locationStatus === 'requesting'}
                                className="w-full border-2 border-[#C5A572] bg-transparent hover:bg-[#C5A572]/10 text-[#C5A572] font-bold py-6 rounded-xl flex items-center gap-2"
                            >
                                {locationStatus === 'requesting' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
                                Enable Location Access
                            </Button>
                        ) : (
                            <Button
                                onClick={handleCheckIn}
                                disabled={isCheckingIn}
                                className="w-full bg-[#C5A572] hover:bg-[#A08050] text-[#1a1a2e] font-bold py-6 rounded-xl relative overflow-hidden group transition-all"
                            >
                                {isCheckingIn && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                                <div className="flex items-center gap-2">
                                    {isCheckingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                    {isCheckingIn ? 'Verifying Check-In...' : 'Confirm Check-In'}
                                </div>
                            </Button>
                        )}

                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
                        >
                            Cancel and Return Home
                        </button>
                    </CardFooter>
                </Card>
            </motion.div>

            <style>{`
        .min-height-screen {
          min-height: 100vh;
        }
      `}</style>
        </div>
    );
}
