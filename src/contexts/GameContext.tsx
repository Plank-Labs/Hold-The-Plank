import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { formatUnits } from "viem";
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
  type PendingReward,
  type RelicSignatureResponse,
} from "@/lib/contracts";

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  completeSession: (validSeconds: number) => Promise<SessionResult>;

  // Pending rewards (relayer-based)
  pendingRewards: PendingReward[];
  totalPendingPlank: bigint;
  fetchPendingRewards: () => Promise<void>;
  isLoadingPendingRewards: boolean;

  // Relic minting (signature-based)
  mintRelic: (tokenId: number) => Promise<boolean>;
  isMintingRelic: boolean;
  mintingRelicId: number | null;

  // Check relic claim status
  claimedRelics: boolean[];
  fetchClaimedRelics: () => Promise<void>;

  // Token balance (on-chain)
  plankBalance: bigint;
  isLoadingBalance: boolean;

  // Onboarding
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    login,
    logout,
    authenticated,
    ready,
    user: privyUser,
    getAccessToken,
  } = usePrivy();
  const { address, isConnected: wagmiConnected } = useAccount();

  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [guilds, setGuilds] = useState<Guild[]>(mockGuilds);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Pending rewards state
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([]);
  const [isLoadingPendingRewards, setIsLoadingPendingRewards] = useState(false);

  // Relic minting state
  const [mintingRelicId, setMintingRelicId] = useState<number | null>(null);
  const [claimedRelics, setClaimedRelics] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  // Contract interactions
  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    reset: resetWriteContract,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // Read PLANK balance from contract
  const {
    data: plankBalanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.plankToken,
    abi: plankTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled:
        !!address &&
        CONTRACT_ADDRESSES.plankToken !==
          "0x0000000000000000000000000000000000000000",
    },
  });

  // Read claimed relics from contract
  const { data: claimedRelicsData, refetch: refetchClaimedRelics } =
    useReadContract({
      address: CONTRACT_ADDRESSES.relics,
      abi: relicsAbi,
      functionName: "getClaimedRelics",
      args: address ? [address] : undefined,
      query: {
        enabled:
          !!address &&
          CONTRACT_ADDRESSES.relics !==
            "0x0000000000000000000000000000000000000000",
      },
    });

  const plankBalance = plankBalanceData ?? 0n;
  const isMintingRelic = isWritePending || isConfirming;

  // Calculate total pending PLANK
  const totalPendingPlank = pendingRewards
    .filter((r) => r.status === "pending" || r.status === "processing")
    .reduce((sum, r) => sum + r.amount, 0n);

  // Derived state - we are "connected" if Privy is authenticated
  const isConnected = authenticated;

  // Find a wallet address from any source
  const getWalletAddress = () => {
    if (address) return address;
    if (privyUser?.wallet?.address) return privyUser.wallet.address;
    const linkedWallet = privyUser?.linkedAccounts?.find(
      (a) => a.type === "wallet"
    );
    if (linkedWallet && "address" in linkedWallet)
      return linkedWallet.address as string;
    return "";
  };

  const walletAddress = getWalletAddress();

  // Watch for PlankMinted events to update balance
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.plankToken,
    abi: plankTokenAbi,
    eventName: "PlankMinted",
    args: { to: address },
    enabled:
      !!address &&
      CONTRACT_ADDRESSES.plankToken !==
        "0x0000000000000000000000000000000000000000",
    onLogs: () => {
      refetchBalance();
      // Also refresh pending rewards since one might have been processed
      fetchPendingRewards();
    },
  });

  // Watch for RelicMinted events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.relics,
    abi: relicsAbi,
    eventName: "RelicMinted",
    args: { to: address },
    enabled:
      !!address &&
      CONTRACT_ADDRESSES.relics !==
        "0x0000000000000000000000000000000000000000",
    onLogs: () => {
      refetchClaimedRelics();
      setMintingRelicId(null);
      resetWriteContract();
    },
  });

  // Sync user profile with wallet connection
  useEffect(() => {
    if (authenticated && walletAddress) {
      setUser((prev) => ({
        ...prev,
        walletAddress: walletAddress,
        username: prev.username || `Warrior_${walletAddress.slice(2, 6)}`,
        plankBalance: Number(formatUnits(plankBalance, 18)),
      }));
    } else if (ready && !authenticated) {
      setUser(defaultUser);
      setPendingRewards([]);
    }
  }, [authenticated, walletAddress, plankBalance, ready]);

  // Sync claimed relics from contract
  useEffect(() => {
    if (claimedRelicsData) {
      setClaimedRelics([...claimedRelicsData]);
    }
  }, [claimedRelicsData]);

  // Refetch balance when transaction confirms
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance();
      refetchClaimedRelics();
    }
  }, [isConfirmed, refetchBalance, refetchClaimedRelics]);

  // Fetch pending rewards from API
  const fetchPendingRewards = useCallback(async () => {
    if (!authenticated || !walletAddress) return;

    setIsLoadingPendingRewards(true);
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_URL}/api/users/pending-rewards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingRewards(
          data.rewards.map((r: { amount: string } & Omit<PendingReward, "amount">) => ({
            ...r,
            amount: BigInt(r.amount),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch pending rewards:", error);
    } finally {
      setIsLoadingPendingRewards(false);
    }
  }, [authenticated, walletAddress, getAccessToken]);

  // Fetch claimed relics
  const fetchClaimedRelics = useCallback(async () => {
    if (address) {
      refetchClaimedRelics();
    }
  }, [address, refetchClaimedRelics]);

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
  const userGuild = user.guildId
    ? guilds.find((g) => g.id === user.guildId) || null
    : null;

  const joinGuild = useCallback(
    (guildId: string) => {
      setUser((prev) => ({ ...prev, guildId }));
      setGuilds((prev) =>
        prev.map((g) =>
          g.id === guildId
            ? {
                ...g,
                memberCount: g.memberCount + 1,
                members: [
                  ...g.members,
                  {
                    username: user.username,
                    walletAddress: user.walletAddress,
                    timeContributed: 0,
                  },
                ],
              }
            : g
        )
      );
    },
    [user.username, user.walletAddress]
  );

  const leaveGuild = useCallback(() => {
    if (user.guildId) {
      setGuilds((prev) =>
        prev.map((g) =>
          g.id === user.guildId
            ? {
                ...g,
                memberCount: g.memberCount - 1,
                members: g.members.filter(
                  (m) => m.walletAddress !== user.walletAddress
                ),
              }
            : g
        )
      );
      setUser((prev) => ({ ...prev, guildId: null }));
    }
  }, [user.guildId, user.walletAddress]);

  const createGuild = useCallback(
    (name: string, emblem: string, description: string) => {
      const newGuild: Guild = {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        emblem,
        description,
        totalTimeConquered: 0,
        memberCount: 1,
        members: [
          {
            username: user.username,
            walletAddress: user.walletAddress,
            timeContributed: 0,
          },
        ],
      };
      setGuilds((prev) => [...prev, newGuild]);
      setUser((prev) => ({ ...prev, guildId: newGuild.id }));
    },
    [user.username, user.walletAddress]
  );

  // Complete a plank session - rewards are now queued by backend relayer
  const completeSession = useCallback(
    async (validSeconds: number): Promise<SessionResult> => {
      const auraPointsGained = calculateAuraPoints(validSeconds);
      const plankReward = calculatePlankReward(validSeconds);
      const lifeTimeGained = calculateLifeTimeGained(validSeconds);
      const today = new Date().toDateString();

      // Call backend to record session and queue rewards
      if (authenticated && walletAddress) {
        try {
          const token = await getAccessToken();
          await fetch(`${API_URL}/api/sessions/complete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              validSeconds,
              auraPoints: auraPointsGained,
            }),
          });

          // Refresh pending rewards after session completes
          setTimeout(() => fetchPendingRewards(), 1000);
        } catch (error) {
          console.error("Failed to record session with backend:", error);
        }
      }

      // Update user stats locally
      setUser((prev) => {
        const isNewDay = prev.lastSessionDate !== today;
        const newStreak = isNewDay
          ? prev.currentStreakDays + 1
          : prev.currentStreakDays;

        return {
          ...prev,
          bestPlankTime: Math.max(prev.bestPlankTime, validSeconds),
          totalTimeConquered: prev.totalTimeConquered + validSeconds,
          auraPoints: prev.auraPoints + auraPointsGained,
          currentStreakDays:
            validSeconds >= 30 ? newStreak : prev.currentStreakDays,
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

      return {
        validTimeSeconds: validSeconds,
        auraPointsGained,
        plankReward,
        lifeTimeGained,
      };
    },
    [
      authenticated,
      walletAddress,
      user.guildId,
      user.walletAddress,
      getAccessToken,
      fetchPendingRewards,
    ]
  );

  // Mint a relic using signature from backend
  const mintRelic = useCallback(
    async (tokenId: number): Promise<boolean> => {
      if (!address || !authenticated) return false;

      // Find the relic and check eligibility
      const relic = Object.values(RELIC_TOKENS).find(
        (r) => Number(r.id) === tokenId
      );
      if (!relic || user.totalTimeConquered < relic.requirement) {
        console.error("Not eligible for this relic");
        return false;
      }

      // Check if already claimed
      if (claimedRelics[tokenId - 1]) {
        console.error("Relic already claimed");
        return false;
      }

      // Check if contracts are deployed
      if (
        CONTRACT_ADDRESSES.relics ===
        "0x0000000000000000000000000000000000000000"
      ) {
        // Fallback to mock behavior if contracts not deployed
        console.warn("Relics contract not deployed. Using mock mint.");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setClaimedRelics((prev) => {
          const newClaimed = [...prev];
          newClaimed[tokenId - 1] = true;
          return newClaimed;
        });
        setUser((prev) => ({ ...prev, hasNFT: true }));
        return true;
      }

      try {
        setMintingRelicId(tokenId);

        // 1. Request signature from backend
        const token = await getAccessToken();
        const signatureResponse = await fetch(
          `${API_URL}/api/relics/request-signature`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ tokenId }),
          }
        );

        if (!signatureResponse.ok) {
          const error = await signatureResponse.json();
          throw new Error(error.message || "Failed to get signature");
        }

        const sigData: RelicSignatureResponse = await signatureResponse.json();

        // 2. Submit to contract
        writeContract({
          address: CONTRACT_ADDRESSES.relics,
          abi: relicsAbi,
          functionName: "mintWithSignature",
          args: [BigInt(tokenId), sigData.deadline, sigData.signature],
        });

        // Transaction confirmation is handled by useWatchContractEvent
        return true;
      } catch (error) {
        console.error("Failed to mint relic:", error);
        setMintingRelicId(null);
        return false;
      }
    },
    [
      address,
      authenticated,
      user.totalTimeConquered,
      claimedRelics,
      writeContract,
      getAccessToken,
    ]
  );

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
        pendingRewards,
        totalPendingPlank,
        fetchPendingRewards,
        isLoadingPendingRewards,
        mintRelic,
        isMintingRelic,
        mintingRelicId,
        claimedRelics,
        fetchClaimedRelics,
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
