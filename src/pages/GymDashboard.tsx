import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useGymApi } from '@/hooks/useGymApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, Plus, Users, TrendingUp, MapPin, QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GymDashboard() {
    const { authenticated, login } = usePrivy();
    const { useAllGyms, registerGymMutation } = useGymApi() as any; // Using cast because I just added it

    const { data: gyms, isLoading: isLoadingGyms } = useAllGyms?.() || { data: [], isLoading: false };
    const [newGymName, setNewGymName] = useState('');
    const [newGymAddress, setNewGymAddress] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGymName || !newGymAddress) {
            toast.error('Missing Information', { description: 'Please provide both name and address.' });
            return;
        }

        try {
            await registerGymMutation.mutateAsync({ name: newGymName, address: newGymAddress });
            setNewGymName('');
            setNewGymAddress('');
            setIsRegistering(false);
        } catch (err) {
            // Handled by hook
        }
    };

    const copyQRLink = (gymId: number) => {
        const link = `https://conquerplank.app/gym/join?id=${gymId}&secret=GYM_${gymId}_SECRET`;
        navigator.clipboard.writeText(link);
        toast.success('Link Copied', { description: 'Gym QR link copied to clipboard.' });
    };

    if (!authenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                <Card className="w-full max-w-md bg-[#16213e]/80 border-[#C5A572]/20 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Gym Owner Dashboard</CardTitle>
                        <CardDescription>Please log in to manage your gym and view stats.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={() => login()} className="w-full bg-[#C5A572] hover:bg-[#A08050] text-[#1a1a2e]">
                            Log In
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl pt-24 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Gym Dashboard
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your gym locations and track member performance.</p>
                </div>
                <Button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="bg-[#C5A572] hover:bg-[#A08050] text-[#1a1a2e] flex items-center gap-2"
                >
                    {isRegistering ? 'Cancel' : <><Plus className="h-4 w-4" /> Register New Gym</>}
                </Button>
            </div>

            {isRegistering && (
                <Card className="mb-8 border-[#C5A572]/30 bg-[#16213e]/60 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Register Gym</CardTitle>
                        <CardDescription>Add a new location to the Conquer Plank network.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleRegister}>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Gym Name</Label>
                                <Input
                                    id="name"
                                    value={newGymName}
                                    onChange={(e) => setNewGymName(e.target.value)}
                                    placeholder="e.g. Spartan Fitness Center"
                                    className="bg-[#1a1a2e] border-gray-700 focus:border-[#C5A572]"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Physical Address</Label>
                                <Input
                                    id="address"
                                    value={newGymAddress}
                                    onChange={(e) => setNewGymAddress(e.target.value)}
                                    placeholder="e.g. 123 Olympia Way, Athens"
                                    className="bg-[#1a1a2e] border-gray-700 focus:border-[#C5A572]"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={registerGymMutation.isPending} className="w-full bg-[#C5A572] hover:bg-[#A08050] text-[#1a1a2e]">
                                {registerGymMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Registration'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoadingGyms ? (
                    [1, 2].map(i => <Card key={i} className="h-64 animate-pulse bg-gray-800/20" />)
                ) : gyms?.length === 0 ? (
                    <div className="col-span-2 text-center py-20 bg-[#16213e]/40 rounded-3xl border border-dashed border-[#C5A572]/20">
                        <QrCode className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-300">No Gyms Registered</h3>
                        <p className="text-gray-500">Register your first gym to start generating QR codes.</p>
                    </div>
                ) : (
                    gyms?.map((gym: any) => (
                        <Card key={gym.id} className="border-[#C5A572]/20 bg-[#16213e]/80 overflow-hidden group hover:border-[#C5A572]/40 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-xl">{gym.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {gym.address}
                                    </CardDescription>
                                </div>
                                <div className="bg-[#C5A572]/10 text-[#C5A572] p-2 rounded-lg">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 my-4">
                                    <div className="bg-[#1a1a2e]/60 p-3 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-1">
                                            <Users className="h-3 w-3" /> Members
                                        </div>
                                        <div className="text-xl font-bold">124</div>
                                    </div>
                                    <div className="bg-[#1a1a2e]/60 p-3 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-1">
                                            <TrendingUp className="h-3 w-3" /> Aura Generated
                                        </div>
                                        <div className="text-xl font-bold">12.4k</div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center bg-white p-4 rounded-xl mb-4 group-hover:scale-[1.02] transition-transform">
                                    <QRCodeSVG
                                        value={`https://conquerplank.app/gym/join?id=${gym.id}&secret=GYM_${gym.id}_SECRET`}
                                        size={160}
                                        level="H"
                                        includeMargin={true}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 font-mono">GYM_ID: {gym.id}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button variant="outline" className="flex-1 gap-2 border-gray-700 hover:bg-gray-800" onClick={() => copyQRLink(gym.id)}>
                                    <Copy className="h-4 w-4" /> Copy Link
                                </Button>
                                <Button variant="secondary" className="flex-1 gap-2 bg-[#C5A572]/10 hover:bg-[#C5A572]/20 text-[#C5A572] border-none">
                                    <Download className="h-4 w-4" /> Download QR
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
