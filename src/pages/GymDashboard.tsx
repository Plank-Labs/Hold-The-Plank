import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useGymApi } from '@/hooks/useGymApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import {
    Copy,
    Download,
    Plus,
    Users,
    TrendingUp,
    MapPin,
    QrCode,
    Loader2,
    Printer,
    Calendar,
    ChevronRight,
    ExternalLink,
    Award
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_MEMBERS } from '@/lib/gameData';
import { motion, AnimatePresence } from 'framer-motion';

export default function GymDashboard() {
    const navigate = useNavigate();
    const { authenticated, login } = usePrivy();
    const { useAllGyms, registerGym, isRegisteringGym } = useGymApi();
    const { data: gyms, isLoading: isLoadingGyms } = useAllGyms() || { data: [], isLoading: false };

    const [newGymName, setNewGymName] = useState('');
    const [newGymAddress, setNewGymAddress] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [printingGymId, setPrintingGymId] = useState<number | null>(null);

    const qrRefs = useRef<Record<number, SVGSVGElement | null>>({});

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGymName || !newGymAddress) {
            toast.error('Missing Information', { description: 'Please provide both name and address.' });
            return;
        }

        try {
            await registerGym({ name: newGymName, address: newGymAddress });
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

    const downloadQR = (gymId: number, gymName: string) => {
        const svg = qrRefs.current[gymId];
        if (!svg) {
            toast.error('Failed to generate PNG', { description: 'QR element not found.' });
            return;
        }

        const canvas = document.createElement('canvas');
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const image = new Image();

        image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        image.onload = () => {
            canvas.width = 1000;
            canvas.height = 1000;
            const context = canvas.getContext('2d');
            if (context) {
                context.fillStyle = 'white';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 50, 50, 900, 900);

                const url = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `QR_${gymName.replace(/\s+/g, '_')}.png`;
                link.href = url;
                link.click();
                toast.success('QR Downloaded', { description: 'PNG file saved to your device.' });
            }
        };
        image.onerror = () => {
            toast.error('Failed to download QR', { description: 'Image conversion error.' });
        }
    };

    const printFlyer = (gymId: number) => {
        setPrintingGymId(gymId);
        setTimeout(() => {
            window.print();
            setPrintingGymId(null);
        }, 500);
    };

    if (!authenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#0a0a1a]">
                <Card className="w-full max-w-md bg-[#16213e]/80 border-[#C5A572]/20 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#C5A572] to-[#E8D5B7] bg-clip-text text-transparent text-center">Owner Access</CardTitle>
                        <CardDescription className="text-center">Secure management portal for gym partners.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-8">
                        <QrCode className="h-16 w-16 text-[#C5A572]/30 mb-6" />
                        <p className="text-sm text-gray-400 text-center mb-6">
                            Join the Conquer Plank ecosystem. Track your members and offer exclusive rewards.
                        </p>
                        <Button onClick={() => login()} className="w-full bg-[#C5A572] hover:bg-[#A08050] text-[#1a1a2e] font-bold h-12">
                            Log In to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (printingGymId) {
        const gym = gyms?.find((g: any) => g.id === printingGymId);
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-20 text-black z-[9999]">
                <div className="text-center w-full max-w-2xl border-4 border-black p-12 rounded-[3rem]">
                    <h1 className="text-6xl font-black mb-4 uppercase tracking-tighter">Conquer Plank</h1>
                    <div className="w-full h-1 bg-black mb-12" />
                    <h2 className="text-4xl font-bold mb-8 uppercase tracking-widest">{gym?.name}</h2>
                    <div className="bg-white p-6 inline-block border-4 border-black rounded-[2rem] mb-12">
                        <QRCodeSVG
                            value={`https://conquerplank.app/gym/join?id=${gym?.id}&secret=GYM_${gym?.id}_SECRET`}
                            size={400}
                            level="H"
                            includeMargin={false}
                        />
                    </div>
                    <p className="text-2xl font-medium mb-2 flex justify-center gap-3 items-center">
                        <MapPin className="h-8 w-8" /> {gym?.address}
                    </p>
                    <div className="w-full h-1 bg-black mt-12 mb-4" />
                    <p className="text-2xl font-black italic uppercase tracking-[0.3em] text-gray-400">Scan to Conquer Time</p>
                </div>
                <style>{`
                    @media screen { body > *:not(.z-[9999]) { display: none; } }
                    @page { margin: 0; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] pb-20 overflow-x-hidden">
            <div className="container mx-auto p-6 max-w-6xl pt-24">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-[#C5A572]/20 p-2 rounded-lg">
                                <Award className="h-6 w-6 text-[#C5A572]" />
                            </div>
                            <span className="text-[#C5A572] font-bold text-sm uppercase tracking-widest">Partner Portal</span>
                        </div>
                        <h1 className="text-5xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent tracking-tighter">
                            Gym Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg">Growth analytics and member engagement suite.</p>
                    </motion.div>

                    <Button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className={`${isRegistering ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 px-8' : 'bg-[#C5A572] hover:bg-[#A08050] text-[#1a1a2e] shadow-[0_0_20px_rgba(197,165,114,0.3)] px-10'} font-bold h-12 transition-all flex items-center gap-2 rounded-xl`}
                    >
                        {isRegistering ? 'Cancel' : <><Plus className="h-5 w-5" /> Register New Location</>}
                    </Button>
                </header>

                <AnimatePresence>
                    {isRegistering && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="mb-12"
                        >
                            <Card className="border-[#C5A572]/30 bg-[#16213e]/40 backdrop-blur-xl shadow-2xl overflow-hidden">
                                <CardHeader className="bg-[#C5A572]/5">
                                    <CardTitle>Gym Registration</CardTitle>
                                    <CardDescription>Your location will be immediately discoverable by users scanning for bonuses.</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleRegister}>
                                    <CardContent className="grid md:grid-cols-2 gap-8 pt-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="name" className="text-[#C5A572] font-bold text-xs uppercase tracking-widest">Gym Name</Label>
                                            <Input
                                                id="name"
                                                value={newGymName}
                                                onChange={(e) => setNewGymName(e.target.value)}
                                                placeholder="e.g. Spartan Fitness Center"
                                                className="bg-[#0a0a1a] border-gray-800 focus:border-[#C5A572] h-14 rounded-xl px-5 text-lg"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="address" className="text-[#C5A572] font-bold text-xs uppercase tracking-widest">Physical Address</Label>
                                            <Input
                                                id="address"
                                                value={newGymAddress}
                                                onChange={(e) => setNewGymAddress(e.target.value)}
                                                placeholder="e.g. 123 Olympia Way, Athens"
                                                className="bg-[#0a0a1a] border-gray-800 focus:border-[#C5A572] h-14 rounded-xl px-5 text-lg"
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pb-8">
                                        <Button type="submit" disabled={isRegisteringGym} className="w-full bg-[#C5A572] hover:bg-[#A08050] text-[#1a1a2e] font-black h-14 rounded-xl text-lg shadow-xl uppercase tracking-widest">
                                            {isRegisteringGym ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Confirm Registration'}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-20">
                    {isLoadingGyms ? (
                        [1].map(i => <div key={i} className="h-[600px] animate-pulse bg-[#16213e]/40 rounded-[2rem] border border-white/5" />)
                    ) : gyms?.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-40 bg-[#16213e]/10 rounded-[4rem] border-2 border-dashed border-[#C5A572]/10 flex flex-col items-center"
                        >
                            <div className="bg-[#C5A572]/5 p-8 rounded-full mb-8">
                                <QrCode className="h-20 w-20 text-[#C5A572]/20" />
                            </div>
                            <h3 className="text-4xl font-black text-gray-300 tracking-tighter">Expand Your Empire</h3>
                            <p className="text-gray-500 max-w-lg mx-auto mt-4 text-lg font-medium leading-relaxed">
                                Join the network of premium training facilities. Register your first physical location to start onboarding members and generating Aura.
                            </p>
                            <Button onClick={() => setIsRegistering(true)} variant="link" className="text-[#C5A572] font-bold mt-6 hover:scale-105 transition-transform uppercase tracking-widest text-sm">
                                Register your first gym now <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </motion.div>
                    ) : (
                        gyms?.map((gym: any) => (
                            <motion.div
                                key={gym.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid lg:grid-cols-3 gap-8"
                            >
                                <Card className="border-white/5 bg-[#16213e]/20 overflow-hidden flex flex-col shadow-2xl">
                                    <CardHeader className="bg-white/5 p-6 border-b border-white/5">
                                        <div className="flex items-center justify-between">
                                            <div className="bg-[#C5A572]/20 px-3 py-1 rounded-full text-[10px] font-black text-[#C5A572] uppercase tracking-[0.2em]">
                                                Active QR
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => downloadQR(gym.id, gym.name)} title="Download PNG" className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-[#C5A572]">
                                                    <Download className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => printFlyer(gym.id)} title="Print Flyer" className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">
                                                    <Printer className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10 flex flex-col items-center justify-center grow">
                                        <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] mb-8 transform hover:scale-105 transition-all duration-700 relative group">
                                            <QRCodeSVG
                                                ref={(el) => (qrRefs.current[gym.id] = el as any)}
                                                value={`https://conquerplank.app/gym/join?id=${gym.id}&secret=GYM_${gym.id}_SECRET`}
                                                size={200}
                                                level="H"
                                                includeMargin={true}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[2.5rem] cursor-pointer" onClick={() => copyQRLink(gym.id)}>
                                                <Copy className="h-10 w-10 text-white" />
                                            </div>
                                        </div>
                                        <h2 className="text-3xl font-black text-white text-center tracking-tight leading-tight">{gym.name}</h2>
                                        <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                                            <MapPin className="h-3.5 w-3.5 text-[#C5A572]" /> {gym.address}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="bg-[#1a1a2e]/50 flex gap-2 p-6 border-t border-white/5">
                                        <Button variant="ghost" className="flex-1 h-12 text-gray-400 hover:bg-white/5 rounded-xl font-bold" onClick={() => copyQRLink(gym.id)}>
                                            <Copy className="h-4 w-4 mr-2" /> Link
                                        </Button>
                                        <Button variant="ghost" className="flex-1 h-12 text-[#C5A572] hover:bg-[#C5A572]/10 rounded-xl font-bold border border-[#C5A572]/10" onClick={() => navigate(`/gym/join?id=${gym.id}&secret=PREVIEW`)}>
                                            <ExternalLink className="h-4 w-4 mr-2" /> Live
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <div className="lg:col-span-2 space-y-8 flex flex-col">
                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <Card className="border-[#C5A572]/20 bg-gradient-to-br from-[#1c2a4e] to-[#0a0a1a] shadow-xl relative overflow-hidden group">
                                            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Award className="h-40 w-40 text-[#C5A572]" />
                                            </div>
                                            <CardHeader className="pb-3">
                                                <CardDescription className="uppercase tracking-[0.25em] text-[10px] font-black text-[#C5A572]">Cumulative Aura Yield</CardDescription>
                                                <CardTitle className="text-5xl font-black text-white flex items-end gap-3 mt-1">
                                                    {(gym.totalAuraGenerated || 12450).toLocaleString()}
                                                    <span className="text-sm font-black text-[#C5A572] mb-1.5 uppercase tracking-tighter">pts</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 w-fit px-3 py-1 rounded-lg text-green-400 text-[10px] font-black uppercase tracking-widest">
                                                    <TrendingUp className="h-3 w-3" /> Growth +12.4%
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-white/5 bg-[#16213e]/30 shadow-xl overflow-hidden relative group">
                                            <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Users className="h-32 w-32 text-gray-400" />
                                            </div>
                                            <CardHeader className="pb-3">
                                                <CardDescription className="uppercase tracking-[0.25em] text-[10px] font-black text-gray-500">Active Legion</CardDescription>
                                                <CardTitle className="text-5xl font-black text-white flex items-end gap-3 mt-1">
                                                    {gym.totalMembers || 86}
                                                    <Users className="h-6 w-6 text-gray-700 mb-1.5" />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                                    <Calendar className="h-3 w-3" /> Since Start
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card className="border-white/5 bg-[#16213e]/20 grow flex flex-col shadow-2xl rounded-[1.5rem] overflow-hidden">
                                        <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
                                            <div>
                                                <CardTitle className="text-xl font-bold text-white uppercase tracking-tight">Member Directory</CardTitle>
                                                <CardDescription className="text-xs font-medium text-gray-500 mt-0.5 uppercase tracking-widest">Activity Audit & Aura Attribution</CardDescription>
                                            </div>
                                            <Button variant="outline" className="h-10 px-6 border-white/10 bg-white/5 text-gray-400 font-bold text-xs hover:bg-white/10 rounded-xl">
                                                EXPORT DATA
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-0 grow bg-black/10">
                                            <div className="overflow-auto max-h-[400px] custom-scrollbar">
                                                <table className="w-full text-left border-collapse">
                                                    <thead className="sticky top-0 bg-[#0a0a1a] z-10 shadow-lg shadow-black/40">
                                                        <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                                                            <th className="px-8 py-5">Officer (User)</th>
                                                            <th className="px-8 py-5">Aura Attribution</th>
                                                            <th className="px-8 py-5 text-right">Latest Deployment</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/[0.03]">
                                                        {(gym.members || MOCK_MEMBERS).map((member: any) => (
                                                            <tr key={member.userId} className="hover:bg-white/[0.04] transition-all group">
                                                                <td className="px-8 py-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#16213e] to-[#C5A572]/20 border border-white/10 flex items-center justify-center text-xs font-black text-[#C5A572]">
                                                                            {member.username.substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black text-gray-200 group-hover:text-white transition-colors">{member.username}</p>
                                                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">ID: {member.userId}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-black text-lg text-white tabular-nums tracking-tighter">+{member.auraEarned}</span>
                                                                        <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-gradient-to-r from-[#C5A572] to-[#E8D5B7]"
                                                                                style={{ width: `${Math.min((member.auraEarned / 1000) * 100, 100)}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    <div className="flex flex-col items-end">
                                                                        <span className="text-sm font-bold text-gray-400 group-hover:text-gray-200">
                                                                            {new Date(member.lastCheckin).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                                        </span>
                                                                        <span className="text-[10px] font-medium text-gray-600">
                                                                            {new Date(member.lastCheckin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-5 border-t border-white/5 bg-white/[0.02] flex justify-center">
                                            <button className="text-[11px] text-[#C5A572] font-black uppercase tracking-[0.2em] hover:text-white flex items-center gap-2 transition-all hover:gap-3">
                                                Unlock Full Member Analytics <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 165, 114, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(197, 165, 114, 0.4); }
                
                @media print {
                    .fixed.inset-0.bg-white { visibility: visible !important; position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
                    body { overflow: hidden; height: auto; }
                    .container { display: none !important; }
                    button { display: none !important; }
                }
            `}</style>
        </div>
    );
}
