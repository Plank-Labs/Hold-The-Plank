// Mock data and game state for Conquer Plank dApp

export interface UserProfile {
  walletAddress: string;
  username: string;
  avatar: string;
  guildId: string | null;
  bestPlankTime: number; // seconds
  totalTimeConquered: number; // seconds this season
  auraPoints: number;
  currentStreakDays: number;
  longestStreakDays: number;
  plankBalance: number; // $PLANK tokens
  hasNFT: boolean;
  lastSessionDate: string | null;
}

export interface Guild {
  id: string;
  name: string;
  emblem: string;
  description: string;
  totalTimeConquered: number; // seconds
  memberCount: number;
  members: GuildMember[];
}

export interface GuildMember {
  username: string;
  walletAddress: string;
  timeContributed: number; // seconds
}

export interface SessionResult {
  validTimeSeconds: number;
  auraPointsGained: number;
  plankReward: number;
  lifeTimeGained: string;
}

// Gym interfaces for QR code referral system (aligned with backend schema)
export interface Gym {
  id: number;              // Numeric ID to match backend
  name: string;
  address: string;         // For display purposes
  rewardAuraFixed: number; // Mapping from reward_aura_fixed
  isActive: boolean;
}

export interface GymLink {
  gymId: number;
  linkedAt: string;        // ISO Date string
  lastCheckin: string;     // ISO Date string for daily validation
}

// Greek-themed guild names
export const mockGuilds: Guild[] = [
  {
    id: "spartans",
    name: "Spartans of Iron",
    emblem: "⚔️",
    description: "We hold the line. We never break. We are Sparta.",
    totalTimeConquered: 48600, // 13.5 hours
    memberCount: 47,
    members: [
      { username: "Leonidas", walletAddress: "0x1234...5678", timeContributed: 3600 },
      { username: "Gorgo", walletAddress: "0x2345...6789", timeContributed: 2400 },
      { username: "Dienekes", walletAddress: "0x3456...7890", timeContributed: 1800 },
      { username: "Othryades", walletAddress: "0x4567...8901", timeContributed: 1500 },
      { username: "Aristodemus", walletAddress: "0x5678...9012", timeContributed: 1200 },
    ],
  },
  {
    id: "olympians",
    name: "Children of Olympus",
    emblem: "⚡",
    description: "Blessed by the gods, we conquer time itself.",
    totalTimeConquered: 41400, // 11.5 hours
    memberCount: 38,
    members: [
      { username: "Heracles", walletAddress: "0x6789...0123", timeContributed: 2700 },
      { username: "Perseus", walletAddress: "0x7890...1234", timeContributed: 2100 },
      { username: "Achilles", walletAddress: "0x8901...2345", timeContributed: 1800 },
    ],
  },
  {
    id: "titans",
    name: "Titan Slayers",
    emblem: "🏛️",
    description: "We strike at the heart of Kronos himself.",
    totalTimeConquered: 36000, // 10 hours
    memberCount: 31,
    members: [
      { username: "Prometheus", walletAddress: "0x9012...3456", timeContributed: 2400 },
      { username: "Atlas", walletAddress: "0x0123...4567", timeContributed: 2100 },
    ],
  },
  {
    id: "athena",
    name: "Athena's Chosen",
    emblem: "🦉",
    description: "Wisdom and strength. Mind and body as one.",
    totalTimeConquered: 28800, // 8 hours
    memberCount: 24,
    members: [
      { username: "Odysseus", walletAddress: "0xabcd...ef01", timeContributed: 1800 },
      { username: "Penelope", walletAddress: "0xbcde...f012", timeContributed: 1500 },
    ],
  },
  {
    id: "oracles",
    name: "Oracles of Delphi",
    emblem: "👁️",
    description: "We see beyond time. We know the path.",
    totalTimeConquered: 21600, // 6 hours
    memberCount: 18,
    members: [
      { username: "Pythia", walletAddress: "0xcdef...0123", timeContributed: 1200 },
    ],
  },
];

export const defaultUser: UserProfile = {
  walletAddress: "",
  username: "",
  avatar: "🏛️",
  guildId: null,
  bestPlankTime: 0,
  totalTimeConquered: 0,
  auraPoints: 0,
  currentStreakDays: 0,
  longestStreakDays: 0,
  plankBalance: 0,
  hasNFT: false,
  lastSessionDate: null,
};

// Mythic quotes for session screen
export const sessionQuotes = [
  "Every second you hold is stolen from Kronos.",
  "Time under tension is time you steal from Kronos.",
  "Hold the $PLANK.",
  "Your pain is Kronos's loss.",
  "The gods watch. Make them proud.",
  "Stay firm. Conquer time.",
  "Don't just pass time. Conquer it.",
  "Pain is temporary. Time conquered is eternal.",
  "Kronos trembles at your resolve.",
];

// Calculate Aura Points from seconds (1 Aura per 10 seconds)
export const calculateAuraPoints = (seconds: number): number => {
  return Math.floor(seconds / 10);
};

// Calculate $PLANK reward from seconds (1 PLANK per 20 seconds)
export const calculatePlankReward = (seconds: number): number => {
  return Math.floor(seconds / 20);
};

// Calculate theoretical life time gained
// Based on: 1.5h/week activity ≈ +3 years of life
// 1.5h = 5400 seconds per week
// 3 years = 3 * 365 * 24 = 26280 hours
// So roughly: 1 second of exercise = 26280 / (5400 * 52) ≈ 0.0936 hours per year
// Simplified: 1 minute of plank ≈ 0.1 hours of life gained (for display purposes)
export const calculateLifeTimeGained = (seconds: number): string => {
  const hoursGained = (seconds / 60) * 0.1;
  if (hoursGained < 1) {
    return `+${Math.round(hoursGained * 60)} minutes`;
  } else if (hoursGained < 24) {
    return `+${hoursGained.toFixed(1)} hours`;
  } else {
    const days = hoursGained / 24;
    return `+${days.toFixed(1)} days`;
  }
};

// Format seconds to mm:ss
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Format seconds to human readable
export const formatTimeReadable = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
};

// Shorten wallet address
export const shortenAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Mock Gym Data for Testing & Development
export const MOCK_GYM: Gym = {
  id: 1,
  name: "Olympus Power Gym",
  address: "777 Mt. Olympus Way, Peak City",
  rewardAuraFixed: 50,
  isActive: true,
};
