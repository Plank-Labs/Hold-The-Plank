import { useState, useMemo } from 'react';

export interface Relic {
    id: number;
    name: string;
    requirement: number; // in seconds
    image: string;
    description: string;
}

export const RELICS: Relic[] = [
    {
        id: 1,
        name: 'Bronze Shield',
        requirement: 60, // 1 minute
        image: '/relics/bronze_shield.png',
        description: 'Earned for planking for 1 minute total.',
    },
    {
        id: 2,
        name: 'Silver Helmet',
        requirement: 600, // 10 minutes
        image: '/relics/silver_helmet.png',
        description: 'Earned for planking for 10 minutes total.',
    },
    {
        id: 3,
        name: 'Gold Sword',
        requirement: 3600, // 1 hour
        image: '/relics/gold_sword.png',
        description: 'Earned for planking for 1 hour total.',
    },
    {
        id: 4,
        name: 'Diamond Crown',
        requirement: 36000, // 10 hours
        image: '/relics/diamond_crown.png',
        description: 'Earned for planking for 10 hours total.',
    },
    {
        id: 5,
        name: 'Kronos Slayer',
        requirement: 360000, // 100 hours
        image: '/relics/kronos_slayer.png',
        description: 'Earned for planking for 100 hours total.',
    },
];

export const useRelics = (totalSeconds: number) => {
    const unlockedRelics = useMemo(() => {
        return RELICS.filter((relic) => totalSeconds >= relic.requirement);
    }, [totalSeconds]);

    const nextRelic = useMemo(() => {
        return RELICS.find((relic) => totalSeconds < relic.requirement);
    }, [totalSeconds]);

    const isUnlocked = (id: number) => {
        return unlockedRelics.some((relic) => relic.id === id);
    };

    return {
        allRelics: RELICS,
        unlockedRelics,
        nextRelic,
        isUnlocked,
    };
};
