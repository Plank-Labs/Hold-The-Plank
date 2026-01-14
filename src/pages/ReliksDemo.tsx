import React, { useState } from 'react';
import { ReliksGallery } from '@/components/ReliksGallery';
import { RewardReveal } from '@/components/RewardReveal';
import { useReliks } from '@/hooks/useReliks';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const ReliksDemo = () => {
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [showReward, setShowReward] = useState(false);
    const { allReliks } = useReliks(totalSeconds);

    // For demo: trigger reward for the Bronze Shield (1 minute)
    const demoRelik = allReliks[0];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
            {/* Header / Nav Demo */}
            <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl rotate-12 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                            <Trophy className="text-black" size={20} />
                        </div>
                        <span className="text-xl font-serif font-bold tracking-tight">RELIKS OF TIME</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-tighter">Current Progress</span>
                            <span className="text-sm font-mono text-yellow-500">{Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s</span>
                        </div>
                        <button
                            onClick={() => setShowReward(true)}
                            className="px-6 py-2.5 bg-yellow-500 text-black text-xs font-bold rounded-full hover:bg-yellow-400 transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                        >
                            TRIGGER REVEAL
                        </button>
                    </div>
                </div>
            </nav>

            <main className="py-12">
                {/* Controls Section */}
                <div className="max-w-6xl mx-auto px-4 mb-20">
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                        <h2 className="text-sm uppercase tracking-[0.2em] font-black text-zinc-500 mb-6">Simulation Engine</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[0, 60, 600, 3600, 36000, 360000].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setTotalSeconds(s)}
                                    className={`px-4 py-8 rounded-2xl border-2 transition-all group ${totalSeconds === s
                                            ? 'border-yellow-500/50 bg-yellow-500/5'
                                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                                        }`}
                                >
                                    <div className={`text-2xl font-serif mb-1 ${totalSeconds === s ? 'text-yellow-500' : 'text-zinc-400'}`}>
                                        {s < 60 ? `${s}s` : s < 3600 ? `${s / 60}m` : `${s / 3600}h`}
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-zinc-600 group-hover:text-zinc-500 transition-colors">
                                        Set Milestone
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* The Gallery Component */}
                <ReliksGallery totalSeconds={totalSeconds} />
            </main>

            {/* Reward Reveal Modal */}
            {showReward && (
                <RewardReveal
                    relik={demoRelik}
                    auraPoints={1250}
                    onClose={() => setShowReward(false)}
                    onShare={() => alert('Sharing your achievement!')}
                />
            )}

            {/* Footer */}
            <footer className="border-t border-zinc-900 py-20 bg-zinc-950">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <div className="text-zinc-500 text-sm mb-4">Reliks of Time System &copy; 2026</div>
                    <div className="flex justify-center gap-8 mt-4">
                        {['Terms', 'Privacy', 'Support'].map(f => (
                            <a key={f} href="#" className="text-zinc-700 hover:text-zinc-400 text-xs uppercase font-bold tracking-widest">{f}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ReliksDemo;
