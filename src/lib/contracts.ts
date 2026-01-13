import { type Address } from "viem";

// Contract addresses - set in environment variables
export const CONTRACT_ADDRESSES = {
  plankToken: (import.meta.env.VITE_PLANK_TOKEN_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as Address,
  relics: (import.meta.env.VITE_RELICS_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as Address,
} as const;

// PlankToken ERC-20 ABI (relayer-minted, users read-only)
export const plankTokenAbi = [
  // View functions
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalMinted",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "remainingSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
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
  {
    name: "MAX_SUPPLY",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Transfer (users can transfer their tokens)
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
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  // Events
  {
    name: "PlankMinted",
    type: "event",
    inputs: [
      { name: "to", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "reason", type: "bytes32", indexed: true },
    ],
  },
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

// Relics ERC-1155 ABI (signature-based minting)
export const relicsAbi = [
  // View functions
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
    name: "uri",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "hasClaimed",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "nonces",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getClaimedRelics",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "claimed", type: "bool[5]" }],
  },
  {
    name: "getRelicBalances",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "balances", type: "uint256[5]" }],
  },
  {
    name: "tokenRequirements",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "tokenNames",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "signer",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "getMessageHash",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
  // Signature-based mint function (user pays gas)
  {
    name: "mintWithSignature",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  // Events
  {
    name: "RelicMinted",
    type: "event",
    inputs: [
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "nonce", type: "uint256", indexed: false },
    ],
  },
  {
    name: "TransferSingle",
    type: "event",
    inputs: [
      { name: "operator", type: "address", indexed: true },
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "id", type: "uint256", indexed: false },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

// Relic token IDs and their requirements (in seconds)
export const RELIC_TOKENS = {
  BRONZE_SHIELD: {
    id: 1n,
    name: "Bronze Shield",
    requirement: 60, // 1 minute
    description: "Earned after 1 minute of total plank time",
  },
  SILVER_HELMET: {
    id: 2n,
    name: "Silver Helmet",
    requirement: 600, // 10 minutes
    description: "Earned after 10 minutes of total plank time",
  },
  GOLD_SWORD: {
    id: 3n,
    name: "Gold Sword",
    requirement: 3600, // 1 hour
    description: "Earned after 1 hour of total plank time",
  },
  DIAMOND_CROWN: {
    id: 4n,
    name: "Diamond Crown",
    requirement: 36000, // 10 hours
    description: "Earned after 10 hours of total plank time",
  },
  KRONOS_SLAYER: {
    id: 5n,
    name: "Kronos Slayer",
    requirement: 360000, // 100 hours
    description: "Earned after 100 hours of total plank time",
  },
} as const;

// All relic tokens as an array for iteration
export const RELIC_TOKENS_ARRAY = Object.values(RELIC_TOKENS);

// Helper to get eligible relics based on total time
export function getEligibleRelics(totalTimeSeconds: number) {
  return RELIC_TOKENS_ARRAY.filter(
    (relic) => totalTimeSeconds >= relic.requirement
  );
}

// Helper to get next relic to unlock
export function getNextRelic(totalTimeSeconds: number) {
  return RELIC_TOKENS_ARRAY.find(
    (relic) => totalTimeSeconds < relic.requirement
  );
}

// Helper to calculate progress to next relic
export function getRelicProgress(totalTimeSeconds: number) {
  const nextRelic = getNextRelic(totalTimeSeconds);
  if (!nextRelic) return { progress: 100, nextRelic: null };

  const eligibleRelics = getEligibleRelics(totalTimeSeconds);
  const previousRequirement =
    eligibleRelics.length > 0
      ? eligibleRelics[eligibleRelics.length - 1].requirement
      : 0;

  const progress =
    ((totalTimeSeconds - previousRequirement) /
      (nextRelic.requirement - previousRequirement)) *
    100;

  return { progress: Math.min(progress, 100), nextRelic };
}

// Reason constants for PlankToken minting (as bytes32)
export const MINT_REASONS = {
  SESSION_REWARD: "0x" + Buffer.from("SESSION_REWARD").toString("hex").padEnd(64, "0"),
  GYM_BONUS: "0x" + Buffer.from("GYM_BONUS").toString("hex").padEnd(64, "0"),
  STREAK_BONUS: "0x" + Buffer.from("STREAK_BONUS").toString("hex").padEnd(64, "0"),
  REFERRAL_BONUS: "0x" + Buffer.from("REFERRAL_BONUS").toString("hex").padEnd(64, "0"),
  GYM_REFERRAL_SHARE: "0x" + Buffer.from("GYM_REFERRAL_SHARE").toString("hex").padEnd(64, "0"),
} as const;

// Type for signature response from backend
export interface RelicSignatureResponse {
  signature: `0x${string}`;
  deadline: bigint;
  nonce: bigint;
  tokenId: number;
}

// Type for pending reward from relayer queue
export interface PendingReward {
  id: number;
  amount: bigint;
  reason: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  txHash?: string;
}
