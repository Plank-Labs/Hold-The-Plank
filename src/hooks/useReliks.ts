import { useState, useMemo } from 'react';

export interface Relik {
    id: number;
    name: string;
    requirement: number; // in seconds
    image: string;
    description: string;
}

export const RELIKS: Relik[] = [
    {
        id: 1,
        name: 'Bronze Shield',
        requirement: 60, // 1 minute
        image: '/reliks/bronze_shield.png',
        description: 'Earned for planking for 1 minute total.',
    },
    {
        id: 2,
        name: 'Silver Helmet',
        requirement: 600, // 10 minutes
        image: '/reliks/silver_helmet.png',
        description: 'Earned for planking for 10 minutes total.',
    },
    {
        id: 3,
        name: 'Gold Sword',
        requirement: 3600, // 1 hour
        image: '/reliks/gold_sword.png',
        description: 'Earned for planking for 1 hour total.',
    },
    {
        id: 4,
        name: 'Diamond Crown',
        requirement: 36000, // 10 hours
        image: '/reliks/diamond_crown.png',
        description: 'Earned for planking for 10 hours total.',
    },
    {
        id: 5,
        name: 'Kronos Slayer',
        requirement: 360000, // 100 hours
        image: '/reliks/kronos_slayer.png',
        description: 'Earned for planking for 100 hours total.',
    },
];

export const useReliks = (totalSeconds: number) => {
    const unlockedReliks = useMemo(() => {
        return RELIKS.filter((relik) => totalSeconds >= relik.requirement);
    }, [totalSeconds]);

    const nextRelik = useMemo(() => {
        return RELIKS.find((relik) => totalSeconds < relik.requirement);
    }, [totalSeconds]);

    const isUnlocked = (id: number) => {
        return unlockedReliks.some((relik) => relik.id === id);
    };

    return {
        allReliks: RELIKS,
        unlockedReliks,
        nextRelik,
        isUnlocked,
    };
};
