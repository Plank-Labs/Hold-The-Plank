import { http, createConfig } from "wagmi";
import { defineChain } from "viem";

// Define Mantle Sepolia Testnet
export const mantleSepolia = defineChain({
  id: 5003,
  name: "Mantle Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MNT",
    symbol: "MNT",
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_MANTLE_RPC_URL || "https://rpc.sepolia.mantle.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "MantleScan",
      url: "https://sepolia.mantlescan.xyz",
    },
  },
  testnet: true,
});

// Wagmi config for use with Privy
export const wagmiConfig = createConfig({
  chains: [mantleSepolia],
  transports: {
    [mantleSepolia.id]: http(),
  },
});
