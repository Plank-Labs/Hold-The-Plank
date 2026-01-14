import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Relik } from '../hooks/useReliks';
import { Sparkles, Share2, X } from 'lucide-react';

interface RewardRevealProps {
    relik: Relik;
    auraPoints: number;
    onClose: () => void;
    onShare?: () => void;
}

const Particle = ({ delay }: { delay: number }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
        animate={{
            scale: [0, 1, 0.5, 0],
            opacity: [0, 1, 1, 0],
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
        }}
        transition={{
            duration: 2,
            delay,
            repeat: Infinity,
            ease: "easeOut"
        }}
        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
    />
);

export const RewardReveal: React.FC<RewardRevealProps> = ({
    relik,
    auraPoints,
    onClose,
    onShare,
}) => {
    const [displayPoints, setDisplayPoints] = useState(0);

    useEffect(() => {
        const duration = 2000;
        const start = 0;
        const end = auraPoints;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentPoints = Math.floor(progress * (end - start) + start);

            setDisplayPoints(currentPoints);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [auraPoints]);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                {/* Particle Canvas */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <Particle key={i} delay={i * 0.1} />
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    className="relative max-w-md w-full bg-zinc-900 border border-yellow-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(234,179,8,0.2)] overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-bold uppercase tracking-widest mb-2"
                        >
                            <Sparkles size={16} />
                            New Relik Unlocked
                            <Sparkles size={16} />
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl font-serif text-white tracking-tight"
                        >
                            {relik.name}
                        </motion.h2>
                    </div>

                    {/* Relik Image Reveal */}
                    <div className="relative aspect-square w-full max-w-[280px] mx-auto mb-8">
                        <motion.div
                            initial={{ scale: 0, rotate: -180, filter: 'brightness(0) blur(10px)' }}
                            animate={{
                                scale: 1,
                                rotate: 0,
                                filter: 'brightness(1) blur(0px)',
                            }}
                            transition={{
                                type: "spring",
                                damping: 12,
                                stiffness: 100,
                                delay: 0.6
                            }}
                            whileHover={{ scale: 1.05, rotate: 2, transition: { duration: 0.2 } }}
                            className="relative z-10 w-full h-full rounded-2xl overflow-hidden border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.4)] group"
                        >
                            <img
                                src={relik.image}
                                alt={relik.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>

                        {/* Background Glow */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 -z-0 bg-yellow-500/20 blur-[60px] rounded-full"
                        />
                    </div>

                    {/* Aura Points Counter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="text-center mb-8"
                    >
                        <div className="text-zinc-400 text-sm uppercase tracking-widest mb-1">Aura Gained</div>
                        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 animate-gradient-x">
                            +{displayPoints.toLocaleString()}
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onShare}
                            className="flex items-center justify-center gap-2 w-full py-4 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
                        >
                            <Share2 size={20} />
                            Share Achievement
                        </motion.button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-zinc-500 hover:text-white font-medium transition-colors"
                        >
                            Return to Profile
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
