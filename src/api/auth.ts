import { apiClient } from "./client";

export interface BackendUser {
  id: number;
  email: string;
  username: string | null;
  walletAddress: string | null;
  guildId: number | null;
  balancePlank: string;
  auraPoints: number;
  minutesOfLifeGained: number;
  isActive: boolean;
}

export interface VerifyAuthResponse {
  user: BackendUser;
}

export const authApi = {
  /**
   * Verify Privy auth token with backend and get/create user
   */
  verifyAuth: async (privyToken: string): Promise<VerifyAuthResponse> => {
    const response = await apiClient.post<VerifyAuthResponse>(
      "/auth/verify",
      {},
      {
        headers: {
          Authorization: `Bearer ${privyToken}`,
        },
      }
    );
    return response.data;
  },
};
