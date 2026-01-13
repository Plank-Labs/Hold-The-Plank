import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  UserProfile,
  Guild,
  defaultUser,
  mockGuilds,
  calculateAuraPoints,
  calculatePlankReward,
  calculateLifeTimeGained,
  SessionResult,
} from "@/lib/gameData";
import {
  CONTRACT_ADDRESSES,
  plankTokenAbi,
  relicsAbi,
  RELIC_TOKENS,
} from "@/lib/contracts";

interface GameContextType {
  // Wallet state
  isConnected: boolean;
  walletAddress: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;

  // User state
  user: UserProfile;
  updateUsername: (name: string) => void;

  // Guild state
  guilds: Guild[];
  userGuild: Guild | null;
  joinGuild: (guildId: string) => void;
  leaveGuild: () => void;
  createGuild: (name: string, emblem: string, description: string) => void;

  // Session state
  completeSession: (validSeconds: number) => SessionResult;
  claimPlank: () => Promise<boolean>;
  pendingPlankReward: number;
  isClaimingPlank: boolean;

  mintNFT: (relicId?: bigint) => Promise<boolean>;
  isMintingNFT: boolean;

  // Token balance (on-chain)
  plankBalance: bigint;
  isLoadingBalance: boolean;

  // Onboarding
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { login, logout, authenticated, ready, user: privyUser } = usePrivy();
  const { address, isConnected: wagmiConnected } = useAccount();

  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [guilds, setGuilds] = useState<Guild[]>(mockGuilds);
  const [pendingPlankReward, setPendingPlankReward] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Contract interactions
  const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Read PLANK balance from contract
  const { data: plankBalanceData, isLoading: isLoadingBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.plankToken,
    abi: plankTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && CONTRACT_ADDRESSES.plankToken !== "0x0000000000000000000000000000000000000000",
    },
  });

  const plankBalance = plankBalanceData ?? 0n;
  const isClaimingPlank = isWritePending || isConfirming;
  const isMintingNFT = isWritePending || isConfirming;

  // Derived state - more robust connection check
  // We are "connected" if Privy is authenticated
  const isConnected = authenticated;

  // Find a wallet address from any source
  const getWalletAddress = () => {
    if (address) return address;
    if (privyUser?.wallet?.address) return privyUser.wallet.address;
    const linkedWallet = privyUser?.linkedAccounts?.find(a => a.type === 'wallet');
    if (linkedWallet && 'address' in linkedWallet) return linkedWallet.address as string;
    return "";
  };

  const walletAddress = getWalletAddress();

  // Sync user profile with wallet connection
  useEffect(() => {
    if (authenticated && walletAddress) {
      setUser((prev) => ({
        ...prev,
        walletAddress: walletAddress,
        username: prev.username || `Warrior_${walletAddress.slice(2, 6)}`,
        // Convert on-chain balance to display format (assuming 18 decimals)
        plankBalance: Number(formatUnits(plankBalance, 18)),
      }));
    } else if (ready && !authenticated) {
      setUser(defaultUser);
      setPendingPlankReward(0);
    }
  }, [authenticated, walletAddress, plankBalance, ready]);

  // Refetch balance when transaction confirms
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance();
    }
  }, [isConfirmed, refetchBalance]);

  // Connect wallet using Privy
  const connectWallet = useCallback(async () => {
    if (!ready) return;
    await login();
  }, [login, ready]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    logout();
  }, [logout]);

  const updateUsername = useCallback((name: string) => {
    setUser((prev) => ({ ...prev, username: name }));
  }, []);

  // Get user's guild
  const userGuild = user.guildId ? guilds.find((g) => g.id === user.guildId) || null : null;

  const joinGuild = useCallback((guildId: string) => {
    setUser((prev) => ({ ...prev, guildId }));
    setGuilds((prev) =>
      prev.map((g) =>
        g.id === guildId
          ? {
            ...g,
            memberCount: g.memberCount + 1,
            members: [
              ...g.members,
              { username: user.username, walletAddress: user.walletAddress, timeContributed: 0 },
            ],
          }
          : g
      )
    );
  }, [user.username, user.walletAddress]);

  const leaveGuild = useCallback(() => {
    if (user.guildId) {
      setGuilds((prev) =>
        prev.map((g) =>
          g.id === user.guildId
            ? {
              ...g,
              memberCount: g.memberCount - 1,
              members: g.members.filter((m) => m.walletAddress !== user.walletAddress),
            }
            : g
        )
      );
      setUser((prev) => ({ ...prev, guildId: null }));
    }
  }, [user.guildId, user.walletAddress]);

  const createGuild = useCallback((name: string, emblem: string, description: string) => {
    const newGuild: Guild = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      emblem,
      description,
      totalTimeConquered: 0,
      memberCount: 1,
      members: [{ username: user.username, walletAddress: user.walletAddress, timeContributed: 0 }],
    };
    setGuilds((prev) => [...prev, newGuild]);
    setUser((prev) => ({ ...prev, guildId: newGuild.id }));
  }, [user.username, user.walletAddress]);

  // Complete a plank session
  const completeSession = useCallback((validSeconds: number): SessionResult => {
    const auraPointsGained = calculateAuraPoints(validSeconds);
    const plankReward = calculatePlankReward(validSeconds);
    const lifeTimeGained = calculateLifeTimeGained(validSeconds);
    const today = new Date().toDateString();

    // Update user stats
    setUser((prev) => {
      const isNewDay = prev.lastSessionDate !== today;
      const newStreak = isNewDay ? prev.currentStreakDays + 1 : prev.currentStreakDays;

      return {
        ...prev,
        bestPlankTime: Math.max(prev.bestPlankTime, validSeconds),
        totalTimeConquered: prev.totalTimeConquered + validSeconds,
        auraPoints: prev.auraPoints + auraPointsGained,
        currentStreakDays: validSeconds >= 30 ? newStreak : prev.currentStreakDays,
        longestStreakDays: Math.max(prev.longestStreakDays, newStreak),
        lastSessionDate: today,
      };
    });

    // Update guild stats
    if (user.guildId) {
      setGuilds((prev) =>
        prev.map((g) =>
          g.id === user.guildId
            ? {
              ...g,
              totalTimeConquered: g.totalTimeConquered + validSeconds,
              members: g.members.map((m) =>
                m.walletAddress === user.walletAddress
                  ? { ...m, timeContributed: m.timeContributed + validSeconds }
                  : m
              ),
            }
            : g
        )
      );
    }

    setPendingPlankReward(plankReward);

    return {
      validTimeSeconds: validSeconds,
      auraPointsGained,
      plankReward,
      lifeTimeGained,
    };
  }, [user.guildId, user.walletAddress]);

  // Claim $PLANK reward via smart contract
  const claimPlank = useCallback(async (): Promise<boolean> => {
    if (pendingPlankReward <= 0 || !address) return false;

    // Check if contracts are deployed
    if (CONTRACT_ADDRESSES.plankToken === "0x0000000000000000000000000000000000000000") {
      // Fallback to mock behavior if contracts not deployed
      console.warn("PlankToken contract not deployed. Using mock claim.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setUser((prev) => ({
        ...prev,
        plankBalance: prev.plankBalance + pendingPlankReward,
      }));
      setPendingPlankReward(0);
      return true;
    }

    try {
      // Call mint function on PlankToken contract
      // Note: In production, this would be called by an authorized minter (backend/relayer)
      writeContract({
        address: CONTRACT_ADDRESSES.plankToken,
        abi: plankTokenAbi,
        functionName: "mint",
        args: [address, parseUnits(pendingPlankReward.toString(), 18)],
      });

      // Wait for confirmation is handled by useWaitForTransactionReceipt
      // The useEffect above will refetch balance on confirmation
      setPendingPlankReward(0);
      return true;
    } catch (error) {
      console.error("Failed to claim PLANK:", error);
      return false;
    }
  }, [pendingPlankReward, address, writeContract]);

  // Mint NFT (Relic) via smart contract
  const mintNFT = useCallback(async (relicId: bigint = RELIC_TOKENS.BRONZE_SHIELD.id): Promise<boolean> => {
    if (!address) return false;

    // Find the relic and check eligibility
    const relic = Object.values(RELIC_TOKENS).find((r) => r.id === relicId);
    if (!relic || user.totalTimeConquered < relic.requirement) {
      return false;
    }

    // Check if contracts are deployed
    if (CONTRACT_ADDRESSES.relics === "0x0000000000000000000000000000000000000000") {
      // Fallback to mock behavior if contracts not deployed
      console.warn("Relics contract not deployed. Using mock mint.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setUser((prev) => ({ ...prev, hasNFT: true }));
      return true;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.relics,
        abi: relicsAbi,
        functionName: "mint",
        args: [address, relicId, 1n, "0x"],
      });

      setUser((prev) => ({ ...prev, hasNFT: true }));
      return true;
    } catch (error) {
      console.error("Failed to mint NFT:", error);
      return false;
    }
  }, [address, user.totalTimeConquered, writeContract]);

  return (
    <GameContext.Provider
      value={{
        isConnected,
        walletAddress,
        connectWallet,
        disconnectWallet,
        user,
        updateUsername,
        guilds,
        userGuild,
        joinGuild,
        leaveGuild,
        createGuild,
        completeSession,
        claimPlank,
        pendingPlankReward,
        isClaimingPlank,
        mintNFT,
        isMintingNFT,
        plankBalance,
        isLoadingBalance,
        hasSeenOnboarding,
        setHasSeenOnboarding,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
