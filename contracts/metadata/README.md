# Conquer Plank Relics Metadata

NFT metadata for the 5 Relic achievement tiers.

## Relic Tiers

| Token ID | Name | Requirement | Rarity |
|----------|------|-------------|--------|
| 1 | Bronze Shield | 1 minute | Common |
| 2 | Silver Helmet | 10 minutes | Uncommon |
| 3 | Gold Sword | 1 hour | Rare |
| 4 | Diamond Crown | 10 hours | Epic |
| 5 | Kronos Slayer | 100 hours | Legendary |

## Folder Structure

```
metadata/
├── 1.json          # Bronze Shield metadata
├── 2.json          # Silver Helmet metadata
├── 3.json          # Gold Sword metadata
├── 4.json          # Diamond Crown metadata
├── 5.json          # Kronos Slayer metadata
├── images/         # Place artwork here
│   ├── 1.png       # Bronze Shield image
│   ├── 2.png       # Silver Helmet image
│   ├── 3.png       # Gold Sword image
│   ├── 4.png       # Diamond Crown image
│   └── 5.png       # Kronos Slayer image
└── README.md
```

## Upload to IPFS

### Option 1: Pinata (Recommended)

1. Create account at [pinata.cloud](https://pinata.cloud)
2. Upload `images/` folder first:
   ```bash
   # Using Pinata CLI
   pinata upload ./images
   # Returns: ipfs://Qm...IMAGES_CID
   ```
3. Update all JSON files replacing `CID_ROOT` with `IMAGES_CID`
4. Upload metadata folder:
   ```bash
   pinata upload ./metadata
   # Returns: ipfs://Qm...METADATA_CID
   ```
5. Set base URI on contract:
   ```bash
   cast send $RELICS_ADDRESS "setURI(string)" "ipfs://METADATA_CID/" --rpc-url mantle_sepolia --private-key $PRIVATE_KEY
   ```

### Option 2: NFT.Storage (Free)

1. Create account at [nft.storage](https://nft.storage)
2. Use their web interface or CLI to upload

### Option 3: IPFS Desktop

1. Install [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/)
2. Import `images/` folder → copy CID
3. Update JSON files with image CID
4. Import `metadata/` folder → copy CID
5. Pin both CIDs to ensure persistence

## After Upload

Update the base URI in the Relics contract:

```solidity
// The contract expects URIs in format: {baseURI}{tokenId}.json
// Example: ipfs://QmXYZ.../1.json

relics.setURI("ipfs://YOUR_METADATA_CID/");
```

Or via cast:
```bash
cast send $RELICS_ADDRESS "setURI(string)" "ipfs://YOUR_METADATA_CID/" \
  --rpc-url mantle_sepolia \
  --private-key $OWNER_PRIVATE_KEY
```

## Image Specifications

Recommended image specs for marketplace compatibility:

- **Format**: PNG or SVG (PNG recommended for photos)
- **Resolution**: 1000x1000 pixels minimum
- **Aspect Ratio**: 1:1 (square)
- **File Size**: Under 5MB each
- **Style**: Greek mythology themed, matching tier colors

### Color Palette Suggestions

| Tier | Primary Color | Accent |
|------|---------------|--------|
| Bronze | #CD7F32 | #8B4513 |
| Silver | #C0C0C0 | #A9A9A9 |
| Gold | #FFD700 | #DAA520 |
| Diamond | #B9F2FF | #00CED1 |
| Legendary | #9B30FF | #4B0082 |

## Verification

After setting the URI, verify metadata loads correctly:

```bash
# Get URI for token 1
cast call $RELICS_ADDRESS "uri(uint256)" 1 --rpc-url mantle_sepolia

# Should return: ipfs://YOUR_CID/1.json
```

Test in browser:
- https://ipfs.io/ipfs/YOUR_CID/1.json
- https://YOUR_CID.ipfs.nftstorage.link/1.json
