import { apiClient } from "./client";

export interface FormMetricsPayload {
  perfectFormTime: number;
  goodFormTime: number;
  needsAdjustmentTime: number;
  poorFormTime: number;
  notDetectedTime: number;
  avgScore: number;
}

export interface CompleteSessionPayload {
  userId: number;
  validSeconds: number;
  totalSeconds?: number;
  auraPoints: number;
  formMetrics?: FormMetricsPayload | null;
}

export interface SessionReward {
  id: number;
  amount: string; // wei string
  status: "pending" | "processing" | "completed" | "failed";
}

export interface CompleteSessionResponse {
  message: string;
  session: {
    validSeconds: number;
    auraPointsGained: number;
    plankReward: string; // wei string
    lifeTimeGained: number; // in minutes
  };
  reward: SessionReward;
  user: {
    totalAuraPoints: number;
    totalTimeConquered: number; // in seconds
  };
}

export interface PendingRewardResponse {
  id: number;
  amount: string; // wei string
  reason: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  processedAt: string | null;
  txHash: string | null;
}

export interface GetPendingRewardsResponse {
  rewards: PendingRewardResponse[];
}

export const sessionsApi = {
  /**
   * Complete a plank session and queue rewards
   */
  completeSession: async (
    payload: CompleteSessionPayload,
    privyToken: string
  ): Promise<CompleteSessionResponse> => {
    console.log("Completing session with payload:", payload);
    const response = await apiClient.post<CompleteSessionResponse>(
      "/api/sessions/complete",
      payload,
      {
        headers: {
          Authorization: `Bearer ${privyToken}`,
        },
      }
    );
    console.log("Complete session response:", response.data);
    return response.data;
  },

  /**
   * Get pending rewards for the authenticated user
   */
  getPendingRewards: async (
    privyToken: string
  ): Promise<GetPendingRewardsResponse> => {
    const response = await apiClient.get<GetPendingRewardsResponse>(
      "/api/users/pending-rewards",
      {
        headers: {
          Authorization: `Bearer ${privyToken}`,
        },
      }
    );
    return response.data;
  },
};
