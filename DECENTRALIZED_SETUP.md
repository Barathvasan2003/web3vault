# Decentralized Storage Setup (2 Minutes)

## Quick Setup: NFT.Storage (FREE)

### Step 1: Get API Key (1 minute)

1. Go to: **https://nft.storage**
2. Click **"Sign Up"** (use GitHub or email)
3. Verify your email
4. Go to **"API Keys"** in dashboard
5. Click **"New Key"**
6. Copy your API key

### Step 2: Add to Project (30 seconds)

Create `.env.local` file in project root:

```bash
NEXT_PUBLIC_NFT_STORAGE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_key_here
```

### Step 3: Restart Server (30 seconds)

```bash
npm run dev
```

### ✅ Done!

Now when you upload files:
```
✅ Uploaded to decentralized IPFS: QmXxxx...
🌐 Accessible globally: https://ipfs.io/ipfs/QmXxxx...
🔗 CID will be registered on Polkadot blockchain
```

---

## How It Works

### Upload Flow (Decentralized)
```
File → Encrypt → Upload to IPFS (NFT.Storage)
                        ↓
                  Real IPFS CID generated
                        ↓
                  CID stored on Polkadot blockchain
                        ↓
                  File pinned on IPFS network
                        ↓
                  Accessible from any IPFS gateway worldwide
```

### Share Flow (Decentralized)
```
User shares link → Recipient anywhere in world
                        ↓
                  Downloads from IPFS network
                        ↓
                  Decrypts with encryption key
                        ↓
                  Verifies CID on Polkadot blockchain
```

---

## Architecture

### Without NFT.Storage (Current)
```
┌──────────┐     ┌──────────────┐
│  Upload  │────▶│ Server RAM   │ ❌ Centralized
└──────────┘     └──────────────┘ ❌ Lost on restart
                        │
                        ▼
                 ┌──────────────┐
                 │  Polkadot    │ ✅ CID on-chain
                 │  Blockchain  │
                 └──────────────┘
```

### With NFT.Storage (Recommended)
```
┌──────────┐     ┌──────────────┐
│  Upload  │────▶│ IPFS Network │ ✅ Decentralized
└──────────┘     └──────────────┘ ✅ Permanent
                        │          ✅ Global access
                        ▼
                 ┌──────────────┐
                 │  Polkadot    │ ✅ CID on-chain
                 │  Blockchain  │ ✅ Verified
                 └──────────────┘
```

---

## Benefits

### ✅ Truly Decentralized
- No central server
- Files on global IPFS network
- Censorship-resistant
- No single point of failure

### ✅ Perfect for Hackathon
- Aligns with Web3 philosophy
- Works with Polkadot blockchain
- Shows full decentralization
- Production-ready architecture

### ✅ Free Forever
- 100GB storage (NFT.Storage)
- Unlimited downloads
- Permanent storage
- No credit card required

### ✅ Global Access
- Access from any device
- Any location worldwide
- Multiple IPFS gateways
- Fast CDN delivery

---

## Testing

### Test 1: Upload File
```
1. Upload medical file
2. Check console: "✅ Uploaded to decentralized IPFS"
3. Copy CID: QmXxxx...
4. Verify on blockchain
```

### Test 2: Access Globally
```
1. Open: https://ipfs.io/ipfs/YOUR_CID
2. File should load (encrypted)
3. Try different gateway: https://cloudflare-ipfs.com/ipfs/YOUR_CID
4. Works from anywhere! ✅
```

### Test 3: Share Link
```
1. Share file with someone
2. They open link on different device
3. Downloads from IPFS network
4. Decrypts with encryption key
5. Verifies CID on blockchain ✅
```

---

## Alternative Options

### Option 2: Pinata (Also FREE)

1. Get API key: https://pinata.cloud
2. Add to `.env.local`:
```bash
NEXT_PUBLIC_PINATA_API_KEY=your_key
NEXT_PUBLIC_PINATA_SECRET=your_secret
```

### Option 3: Web3.Storage

1. Get token: https://web3.storage
2. Add to `.env.local`:
```bash
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token
```

---

## For Hackathon Demo

### What to Say:

**"Our medical vault uses a fully decentralized architecture:"**

1. ✅ **Files encrypted client-side** (AES-256-GCM)
2. ✅ **Uploaded to IPFS network** (distributed storage)
3. ✅ **CIDs registered on Polkadot blockchain** (immutable proof)
4. ✅ **Access control via smart contracts** (token-based)
5. ✅ **Zero central servers** (fully decentralized)

**"Anyone with the share link and encryption key can access files from anywhere in the world, while the blockchain ensures integrity and access control."**

---

## Comparison: Centralized vs Decentralized

| Feature | Server Storage | IPFS (Decentralized) |
|---------|----------------|---------------------|
| **Storage** | Central server | Distributed network |
| **Persistence** | Lost on restart | Permanent |
| **Access** | Server must be online | Always available |
| **Censorship** | Single point of control | Resistant |
| **Cost** | Server fees | Free (with pinning) |
| **Speed** | Single location | Global CDN |
| **Philosophy** | Web2 | Web3 ✅ |

---

## Production Deployment

For production, you can also:

1. **Run your own IPFS node**
   - Full control
   - Private network option
   - No third-party dependency

2. **Use multiple pinning services**
   - Redundancy
   - Higher availability
   - Load balancing

3. **Integrate with Filecoin**
   - Long-term archival
   - Paid storage deals
   - Proof of storage

---

## Quick Commands

```bash
# Get NFT.Storage key
open https://nft.storage

# Add to .env.local
echo "NEXT_PUBLIC_NFT_STORAGE_KEY=your_key_here" >> .env.local

# Restart server
npm run dev

# Test upload
# Upload a file and check console for:
# "✅ Uploaded to decentralized IPFS: QmXxxx..."
```

---

## Support

- NFT.Storage Docs: https://nft.storage/docs
- IPFS Docs: https://docs.ipfs.tech
- Polkadot Docs: https://wiki.polkadot.network

---

**Ready to go decentralized? Just add your NFT.Storage API key!** 🚀
