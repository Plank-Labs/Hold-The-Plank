import React from 'react';
import { motion } from 'framer-motion';
import { useRelics, Relic } from '../hooks/useRelics';
import { Lock, Share2, Plus } from 'lucide-react';

interface RelicCardProps {
    relic: Relic;
    isUnlocked: boolean;
    onShare?: () => void;
}

const RelicCard: React.FC<RelicCardProps> = ({ relic, isUnlocked, onShare }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative group bg-zinc-900/50 rounded-2xl border ${isUnlocked
                ? 'border-yellow-500/20 hover:border-yellow-500/50 shadow-lg hover:shadow-yellow-500/10'
                : 'border-zinc-800'
                } p-4 transition-all duration-500`}
        >
            {/* Image Container */}
            <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-zinc-950">
                <img
                    src={relic.image}
                    alt={relic.name}
                    className={`w-full h-full object-cover transition-all duration-700 ${isUnlocked
                        ? 'grayscale-0 group-hover:scale-110'
                        : 'grayscale opacity-30 brightness-50 contrast-125'
                        }`}
                />

                {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/60 backdrop-blur-md p-3 rounded-full border border-white/10">
                            <Lock className="text-zinc-500" size={24} />
                        </div>
                    </div>
                )}

                {isUnlocked && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <button
                            onClick={onShare}
                            className="w-full py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/10"
                        >
                            <Share2 size={14} />
                            SHARE RELIC
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <h3 className={`font-serif text-lg ${isUnlocked ? 'text-white' : 'text-zinc-600'}`}>
                        {relic.name}
                    </h3>
                    {isUnlocked && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                    )}
                </div>
                <p className={`text-xs uppercase tracking-widest font-bold ${isUnlocked ? 'text-yellow-500/70' : 'text-zinc-700'
                    }`}>
                    {isUnlocked ? 'Achievement Reached' : `Requirement: ${Math.floor(relic.requirement / 60)}m`}
                </p>
            </div>

            {/* Hover Glow Effect */}
            {isUnlocked && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />
            )}
        </motion.div>
    );
};

export const RelicsGallery: React.FC<{ totalSeconds: number }> = ({ totalSeconds }) => {
    const { allRelics, isUnlocked } = useRelics(totalSeconds);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                    <h2 className="text-4xl font-serif text-white tracking-tight">The Relics of Time</h2>
                    <p className="text-zinc-400 max-w-xl">
                        Ancient treasures awarded to those who master the art of the plank.
                        Keep pushing your boundaries to unlock divine artifacts.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl px-6 py-4 backdrop-blur-md">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Total Power</div>
                    <div className="text-3xl font-serif text-yellow-500">{Math.floor(totalSeconds / 10)} Aura</div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {allRelics.map((relic) => (
                    <RelicCard
                        key={relic.id}
                        relic={relic}
                        isUnlocked={isUnlocked(relic.id)}
                        onShare={() => console.log('Sharing', relic.name)}
                    />
                ))}

                {/* Coming Soon / Infinite Progress Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.5 }}
                    className="relative aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl p-6 text-center"
                >
                    <div className="w-12 h-12 rounded-full border-2 border-zinc-800 flex items-center justify-center mb-4">
                        <Plus className="text-zinc-700" size={24} />
                    </div>
                    <div className="text-zinc-700 font-serif text-lg">Future Legends</div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-800 mt-2">More Relics Await</p>
                </motion.div>
            </div>
        </div>
    );
};
