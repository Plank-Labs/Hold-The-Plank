# Conquer Plank Smart Contracts

Smart contracts for the Conquer Plank dApp, built with Foundry and OpenZeppelin.

## Contracts

### PlankToken.sol (ERC-20)

The $PLANK token with role-based minting via a backend relayer.

| Property | Value |
|----------|-------|
| Name | Plank Token |
| Symbol | PLANK |
| Decimals | 18 |
| Max Supply | 1,000,000,000 |

**Key Features:**
- `MINTER_ROLE` - Only authorized relayer can mint
- `mint(to, amount, reason)` - Mint with reason tracking
- `mintBatch(recipients[], amounts[], reason)` - Gas-efficient batch minting
- `totalMinted(account)` - Track total minted per user
- `PlankMinted` event for frontend listening

**Mint Reasons:**
- `SESSION_REWARD` - Plank session completion
- `GYM_BONUS` - Gym signup bonus (10 PLANK)
- `STREAK_BONUS` - Streak milestone rewards
- `REFERRAL_BONUS` - User referral rewards
- `GYM_REFERRAL_SHARE` - Gym owner's share

### Relics.sol (ERC-1155)

NFT collection for achievement milestones with signature-based minting.

| Token ID | Name | Requirement |
|----------|------|-------------|
| 1 | Bronze Shield | 1 minute total |
| 2 | Silver Helmet | 10 minutes total |
| 3 | Gold Sword | 1 hour total |
| 4 | Diamond Crown | 10 hours total |
| 5 | Kronos Slayer | 100 hours total |

**Key Features:**
- `mintWithSignature(tokenId, deadline, signature)` - User mints with backend signature
- One claim per relic type per user (enforced on-chain)
- Nonce-based replay protection
- Chain ID in signature for cross-chain protection

## Development

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

### Install Dependencies

```bash
forge install
```

### Build

```bash
forge build
```

### Test

```bash
forge test
```

With verbosity:
```bash
forge test -vvv
```

### Local Deployment (Anvil)

Start local node:
```bash
anvil
```

Deploy:
```bash
forge script script/Deploy.s.sol:DeployLocalScript --rpc-url http://localhost:8545 --broadcast
```

## Deployment to Mantle Sepolia

### Environment Variables

Create a `.env` file:

```env
PRIVATE_KEY=0x...          # Deployer wallet private key
ADMIN_ADDRESS=0x...        # Admin address for both contracts
RELAYER_ADDRESS=0x...      # Backend relayer address (mints PLANK)
SIGNER_ADDRESS=0x...       # Backend signer address (signs relic mints)
BASE_URI=https://api.conquerplank.app/metadata/
MANTLESCAN_API_KEY=...     # Optional, for verification
```

### Deploy

```bash
# Load env vars
source .env

# Dry run
forge script script/Deploy.s.sol --rpc-url mantle_sepolia

# Deploy
forge script script/Deploy.s.sol --rpc-url mantle_sepolia --broadcast

# Deploy and verify
forge script script/Deploy.s.sol --rpc-url mantle_sepolia --broadcast --verify
```

### Post-Deployment

1. **Update frontend `.env`:**
   ```env
   VITE_PLANK_TOKEN_ADDRESS=<deployed-address>
   VITE_RELICS_ADDRESS=<deployed-address>
   ```

2. **Verify contracts on MantleScan** (if not auto-verified):
   ```bash
   forge verify-contract <address> PlankToken --chain mantle-sepolia
   forge verify-contract <address> Relics --chain mantle-sepolia
   ```

## Architecture

```
User Flow (PLANK Rewards):
1. User completes plank session
2. Backend validates session and queues reward in relayer_queue
3. Relayer batches pending rewards and calls mintBatch()
4. Frontend listens for PlankMinted events to update balance

User Flow (Relic NFTs):
1. User reaches time milestone
2. Frontend requests signature from backend API
3. Backend validates eligibility and returns signature
4. User calls mintWithSignature() (pays gas)
5. Frontend listens for RelicMinted events
```

## Security

- **Access Control**: Only `MINTER_ROLE` can mint PLANK tokens
- **Signature Verification**: Relics require valid backend signature
- **Replay Protection**: Nonces prevent signature reuse
- **Max Supply**: PLANK token has hard cap of 1 billion
- **One-Time Claims**: Each relic can only be claimed once per user

## Gas Optimization

- Batch minting reduces gas for multiple recipients
- Unchecked math in loops for counter increments
- Efficient storage patterns

## License

MIT
