import type { PrivyClientConfig } from "@privy-io/react-auth";
import { mantleSepolia } from "./wagmi";

// Privy App ID - set in environment variables
export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || "";

// Privy configuration
export const privyConfig: PrivyClientConfig = {
  // Login methods
  loginMethods: ["email", "wallet", "google", "twitter"],

  // Appearance - Dark theme with gold accent matching the app's Greek theme
  appearance: {
    theme: "dark",
    accentColor: "#C5A572", // Gold accent matching the app's primary color
    showWalletLoginFirst: false,
  },

  // Embedded wallets for non-crypto users
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
  },

  // Default chain
  defaultChain: mantleSepolia,
  supportedChains: [mantleSepolia],
};
