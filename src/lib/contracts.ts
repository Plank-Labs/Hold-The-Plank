import { type Address } from "viem";

// Contract addresses - set in environment variables or use placeholders for testnet
export const CONTRACT_ADDRESSES = {
  plankToken: (import.meta.env.VITE_PLANK_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000") as Address,
  relics: (import.meta.env.VITE_RELICS_ADDRESS || "0x0000000000000000000000000000000000000000") as Address,
  gymRegistry: (import.meta.env.VITE_GYM_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000") as Address,
} as const;

// PlankToken ERC-20 ABI (minimal)
export const plankTokenAbi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

// Relics ERC-1155 ABI (minimal)
export const relicsAbi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOfBatch",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "accounts", type: "address[]" },
      { name: "ids", type: "uint256[]" },
    ],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "uri",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

// GymRegistry ABI
export const gymRegistryAbi = [
  {
    name: "registerGym",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "name", type: "string" }],
    outputs: [{ name: "gymId", type: "uint256" }],
  },
  {
    name: "linkUserToGym",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "gymId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claimSignupBonus",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "recordSession",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "plankReward", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getGym",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "gymId", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "owner", type: "address" },
      { name: "totalPoints", type: "uint256" },
      { name: "memberCount", type: "uint256" },
    ],
  },
  {
    name: "getUserGym",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "gymId", type: "uint256" }],
  },
  {
    name: "hasClaimed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  // Events
  {
    name: "GymRegistered",
    type: "event",
    inputs: [
      { name: "gymId", type: "uint256", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "owner", type: "address", indexed: true },
    ],
  },
  {
    name: "UserLinked",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "gymId", type: "uint256", indexed: true },
    ],
  },
  {
    name: "SessionRecorded",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "gymId", type: "uint256", indexed: true },
      { name: "reward", type: "uint256", indexed: false },
    ],
  },
  {
    name: "BonusClaimed",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

// Relic token IDs and their requirements
export const RELIC_TOKENS = {
  BRONZE_SHIELD: { id: 1n, name: "Bronze Shield", requirement: 60 }, // 1 minute
  SILVER_HELMET: { id: 2n, name: "Silver Helmet", requirement: 600 }, // 10 minutes
  GOLD_SWORD: { id: 3n, name: "Gold Sword", requirement: 3600 }, // 1 hour
  DIAMOND_CROWN: { id: 4n, name: "Diamond Crown", requirement: 36000 }, // 10 hours
  KRONOS_SLAYER: { id: 5n, name: "Kronos Slayer", requirement: 360000 }, // 100 hours
} as const;

// Helper to get eligible relics based on total time
export function getEligibleRelics(totalTimeSeconds: number) {
  return Object.values(RELIC_TOKENS).filter(
    (relic) => totalTimeSeconds >= relic.requirement
  );
}
