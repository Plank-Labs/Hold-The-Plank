# Conquer Plank - Implementation Plan

> **Target**: Mantle Sepolia Testnet | **Auth**: Privy (Social + Wallets) | **Detection**: Backend WebSocket

## Overview

This plan covers four major integrations for the Conquer Plank (kronos-hold) dApp:

| Phase | Feature | Priority |
|-------|---------|----------|
| 1 | Privy + Viem/Wagmi Integration | HIGH |
| 2 | Plank Detector Backend | HIGH |
| 3 | Gym QR Code Referral System | MEDIUM |
| 4 | Smart Contracts | HIGH |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Privy SDK   │  │ Wagmi/Viem  │  │ WebSocket Client    │  │
│  │ (Auth)      │  │ (Contracts) │  │ (Plank Detection)   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼───────────────────┼──────────────┘
          │                │                   │
          ▼                ▼                   ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐
   │ Privy Cloud  │  │ Mantle      │  │ FastAPI Backend      │
   │ (Social Auth)│  │ Sepolia RPC │  │ (plank_detector.py)  │
   └──────────────┘  └──────────────┘  └──────────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │ Smart Contracts  │
                    │ • PlankToken.sol │
                    │ • Relics.sol     │
                    │ • GymRegistry.sol│
                    └──────────────────┘
```

---

# PHASE 1: Privy + Wagmi Integration

## 1.1 Dependencies

```bash
npm install @privy-io/react-auth @privy-io/wagmi viem@2.x wagmi@2.x
```

## 1.2 New Files to Create

### `src/lib/wagmi.ts` - Chain Configuration
- Define Mantle Sepolia chain (chainId: 5003)
- RPC URL: `https://rpc.sepolia.mantle.xyz`
- Block explorer: `https://sepolia.mantlescan.xyz`

### `src/lib/privy.ts` - Privy Configuration
- Login methods: email, wallet, google, twitter
- Dark theme with gold accent (#C5A572)
- Embedded wallets for non-crypto users
- Default chain: Mantle Sepolia

### `src/lib/contracts.ts` - Contract ABIs and Addresses
- PlankToken (ERC-20): mint, transfer, balanceOf
- Relics (ERC-1155): mint, balanceOf, uri
- GymRegistry: registerGym, linkUserToGym, recordSession, claimSignupBonus

## 1.3 Files to Modify

### `src/App.tsx`
- Wrap with providers in order: QueryClientProvider > PrivyProvider > WagmiProvider > GameProvider

### `src/contexts/GameContext.tsx`
- Replace mock `connectWallet()` with Privy's `login()`
- Replace mock `claimPlank()` with real contract write using `useWriteContract`
- Replace mock `mintNFT()` with Relics ERC-1155 mint call
- Use `useAccount()` for real wallet address
- Add contract read hooks for token balances

### `src/components/WalletButton.tsx`
- Use `usePrivy()` hook for `login`, `logout`, `authenticated`, `user`
- Display linked accounts (email, social, wallet)
- Show Mantle network status

## 1.4 Verification
- [ ] Connect via social login (Google/Twitter/Email)
- [ ] Connect via MetaMask/WalletConnect
- [ ] Verify wallet address appears in UI
- [ ] Verify correct network (Mantle Sepolia)

---

# PHASE 2: Plank Detector Backend

## 2.1 Backend Structure

```
backend/
├── main.py           # FastAPI app with WebSocket endpoint
├── plank_detector.py # Copy from /plank-detection (modified)
├── models.py         # Pydantic response models
├── requirements.txt  # mediapipe, opencv-python, fastapi, uvicorn
└── Dockerfile
```

## 2.2 WebSocket Protocol

| Direction | Message Type | Payload |
|-----------|-------------|---------|
| Client → Server | `frame` | `{ type: "frame", frame: "<base64>" }` at ~15 FPS |
| Server → Client | `metrics` | `{ state, score, feedback, good_form_time, total_time, landmarks_visible }` |
| Client → Server | `end_session` | `{ type: "end_session" }` |
| Server → Client | `summary` | Session summary with final stats |

**Endpoint**: `ws://localhost:8000/ws/plank/{session_id}`

## 2.3 New Files to Create (Frontend)

### `src/hooks/usePlankDetection.ts`
- WebSocket connection management
- Video stream capture (640x480, front camera)
- Canvas for frame encoding (JPEG, 70% quality)
- Frame streaming at 15 FPS
- Real-time metrics state updates

### `src/components/CameraPreview.tsx`
- Video element for camera feed (can be hidden)
- Canvas for frame capture
- Connection status indicator

## 2.4 Files to Modify

### `src/pages/PlankSession.tsx`
- Replace simulated posture detection with real WebSocket-based detection
- Add camera permission request
- Use `usePlankDetection` hook for real metrics
- Display actual score, feedback, and form state from backend
- Handle connection errors gracefully

## 2.5 Verification
- [ ] Camera permission request works
- [ ] WebSocket connects to backend
- [ ] Metrics update in real-time (~15 FPS)
- [ ] Form feedback displays correctly
- [ ] Session summary returned on end

---

# PHASE 3: Gym QR Code Referral System

## 3.1 Data Model

Add to `src/lib/gameData.ts`:

```typescript
interface Gym {
  id: string;          // Smart contract gym ID
  name: string;
  ownerAddress: string;
  qrCode: string;      // QR code data URL
  totalPoints: number;
  memberCount: number;
}

interface GymLink {
  gymId: string;
  linkedAt: string;
  bonusClaimed: boolean;
}
```

## 3.2 QR Code Format

```
https://conquerplank.app/gym/join?id={gymId}&ref={referralCode}
```

## 3.3 New Files to Create

### `src/pages/GymJoin.tsx`
- Parse URL params for gym ID
- Fetch gym details from contract
- "Link to Gym" button (calls `linkUserToGym`)
- "Claim Bonus" button (calls `claimSignupBonus`)

### `src/pages/GymDashboard.tsx`
- For gym owners to view their gym
- Display linked users count
- Show accumulated points
- Generate QR codes

### `src/components/GymQRScanner.tsx`
- Camera-based QR scanning (use `@yudiel/react-qr-scanner`)
- Parse URL and extract gym ID
- Redirect to GymJoin page

## 3.4 Router Update

Add to `src/App.tsx`:
- Route: `/gym/join` → GymJoin
- Route: `/gym/dashboard` → GymDashboard

## 3.5 Verification
- [ ] Scan QR code successfully
- [ ] Link user to gym on-chain
- [ ] Claim signup bonus (10 PLANK)
- [ ] Gym points increase after user sessions

---

# PHASE 4: Smart Contracts

## 4.1 Contract Directory

```
contracts/
├── PlankToken.sol    # ERC-20 $PLANK token
├── Relics.sol        # ERC-1155 NFT collection
├── GymRegistry.sol   # Gym referral system
└── scripts/
    └── deploy.ts     # Deployment script
```

## 4.2 PlankToken.sol (ERC-20)

| Property | Value |
|----------|-------|
| Name | Plank Token |
| Symbol | PLANK |
| Decimals | 18 |
| Max Supply | 1,000,000,000 |
| Access Control | MINTER_ROLE |

## 4.3 Relics.sol (ERC-1155)

| Token ID | Name | Requirement |
|----------|------|-------------|
| 1 | Bronze Shield | 1 minute total |
| 2 | Silver Helmet | 10 minutes total |
| 3 | Gold Sword | 1 hour total |
| 4 | Diamond Crown | 10 hours total |
| 5 | Kronos Slayer | 100 hours total |

- One mint per relic type per user
- URI pattern: `{baseURI}/{id}.json`

## 4.4 GymRegistry.sol

| Function | Description |
|----------|-------------|
| `registerGym(name)` | Create new gym, returns gymId |
| `linkUserToGym(gymId)` | Link caller to gym (one-time) |
| `claimSignupBonus()` | Mint 10 PLANK to linked user (one-time) |
| `recordSession(user, plankReward)` | Track session, give gym 10% share |

**Events**: GymRegistered, UserLinked, SessionRecorded, BonusClaimed

## 4.5 Deployment

- Network: Mantle Sepolia (chainId: 5003)
- Framework: Hardhat with `@nomicfoundation/hardhat-toolbox`
- Post-deploy: Grant MINTER_ROLE to GymRegistry for bonus minting

## 4.6 Verification
- [ ] PlankToken deployed and verified
- [ ] Relics deployed and verified
- [ ] GymRegistry deployed and verified
- [ ] MINTER_ROLE granted correctly
- [ ] Test mint/transfer on testnet

---

# Environment Variables

```env
# Frontend (.env)
VITE_PRIVY_APP_ID=<your-privy-app-id>
VITE_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
VITE_PLANK_TOKEN_ADDRESS=<deployed-address>
VITE_RELICS_ADDRESS=<deployed-address>
VITE_GYM_REGISTRY_ADDRESS=<deployed-address>
VITE_WS_URL=ws://localhost:8000/ws/plank

# Backend (.env)
ALLOWED_ORIGINS=http://localhost:8080,https://conquerplank.app
```

---

# Implementation Timeline

## Week 1: Foundation

| Day | Tasks |
|-----|-------|
| 1-2 | Phase 1: Privy + Wagmi setup |
| 3-4 | Phase 4: Write and test smart contracts |
| 5 | Phase 1 + 4: Contract integration with frontend |

## Week 2: Detection System

| Day | Tasks |
|-----|-------|
| 1-2 | Phase 2: Backend FastAPI WebSocket server |
| 3-4 | Phase 2: Frontend detection hook + PlankSession update |
| 5 | Integration testing |

## Week 3: Gym System + Polish

| Day | Tasks |
|-----|-------|
| 1-2 | Phase 3: Gym pages and QR scanner |
| 3-5 | End-to-end testing and polish |

---

# Token Economics

| Metric | Value |
|--------|-------|
| $PLANK Max Supply | 1,000,000,000 |
| Reward Rate | 1 PLANK per 20 seconds good form |
| Gym Referral Bonus | 10 PLANK (one-time) |
| Gym Session Share | 10% of user rewards |
| Aura Points | 1 per 10 seconds (off-chain) |

---

# Critical Files Summary

| File | Phase | Changes |
|------|-------|---------|
| `src/App.tsx` | 1, 3 | Add providers, add gym routes |
| `src/contexts/GameContext.tsx` | 1 | Replace mock with real wallet/contract calls |
| `src/components/WalletButton.tsx` | 1 | Use Privy for multi-auth login |
| `src/pages/PlankSession.tsx` | 2 | WebSocket integration for real detection |
| `src/pages/PlankResult.tsx` | 1 | Real token claiming via contract |
| `src/lib/gameData.ts` | 3 | Add Gym interface and types |
| `src/lib/wagmi.ts` | 1 | NEW - Chain configuration |
| `src/lib/privy.ts` | 1 | NEW - Privy configuration |
| `src/lib/contracts.ts` | 1 | NEW - Contract ABIs |
| `src/hooks/usePlankDetection.ts` | 2 | NEW - WebSocket hook |
| `src/pages/GymJoin.tsx` | 3 | NEW - QR landing page |
| `src/pages/GymDashboard.tsx` | 3 | NEW - Gym owner dashboard |
| `backend/main.py` | 2 | NEW - FastAPI server |
| `contracts/*.sol` | 4 | NEW - Smart contracts |
