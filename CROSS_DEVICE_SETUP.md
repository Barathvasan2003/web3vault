# Cross-Device File Sharing Setup

## Current Status

Your medical vault is working, but files are currently stored **locally only** (in browser localStorage). This means:

✅ **Works on same device/browser** where you uploaded  
❌ **Doesn't work across different devices/browsers**

## Why This Happens

The public IPFS endpoints we tried are either:
- Rate-limited without API keys
- Require authentication
- Not available for public uploads

## Solution: Set Up Real IPFS

Choose one of these options to enable **true cross-device access**:

---

## Option 1: NFT.Storage (Recommended - FREE & Easy)

### Steps:

1. **Get API Key** (Free, 2 minutes)
   - Go to: https://nft.storage
   - Click "Sign Up" (use GitHub or email)
   - Go to "API Keys" section
   - Click "New API Key"
   - Copy your API key

2. **Add to Your Project**
   - Create `.env.local` file in project root:
   ```bash
   NEXT_PUBLIC_NFT_STORAGE_KEY=your_api_key_here
   ```

3. **Update Code**
   - Open `lib/ipfs/ipfs-client.ts`
   - In `uploadViaHTTP()` function, add:
   ```typescript
   // Try NFT.Storage with API key
   if (process.env.NEXT_PUBLIC_NFT_STORAGE_KEY) {
       const response = await fetch('https://api.nft.storage/upload', {
           method: 'POST',
           headers: {
               'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NFT_STORAGE_KEY}`
           },
           body: formData,
       });
       
       if (response.ok) {
           const result = await response.json();
           return result.value.cid;
       }
   }
   ```

4. **Benefits**
   - ✅ Free forever (up to 100GB)
   - ✅ Files stored permanently
   - ✅ Accessible from anywhere
   - ✅ Fast global CDN

---

## Option 2: Pinata (Alternative - FREE Tier)

### Steps:

1. **Get API Key**
   - Go to: https://pinata.cloud
   - Sign up (free)
   - Go to "API Keys" → "New Key"
   - Give it "Pin File to IPFS" permission
   - Copy API Key and Secret

2. **Add to Project**
   ```bash
   NEXT_PUBLIC_PINATA_API_KEY=your_api_key
   NEXT_PUBLIC_PINATA_SECRET=your_secret
   ```

3. **Update Code**
   ```typescript
   const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
       method: 'POST',
       headers: {
           'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
           'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET!
       },
       body: formData,
   });
   ```

4. **Benefits**
   - ✅ Free tier: 1GB storage
   - ✅ Easy to use
   - ✅ Good documentation
   - ✅ Analytics dashboard

---

## Option 3: Run Local IPFS Node (For Developers)

### Steps:

1. **Install IPFS**
   ```bash
   # Windows (using Chocolatey)
   choco install ipfs
   
   # Or download from: https://ipfs.tech/install/
   ```

2. **Initialize and Start**
   ```bash
   ipfs init
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://localhost:3001"]'
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
   ipfs daemon
   ```

3. **Update Config**
   ```bash
   NEXT_PUBLIC_IPFS_HOST=localhost
   NEXT_PUBLIC_IPFS_PORT=5001
   NEXT_PUBLIC_IPFS_PROTOCOL=http
   ```

4. **Benefits**
   - ✅ Full control
   - ✅ No rate limits
   - ✅ Private network option
   - ✅ No third-party dependency

---

## Option 4: Web3.Storage (FREE)

### Steps:

1. **Get API Token**
   - Go to: https://web3.storage
   - Sign up (free)
   - Get API token

2. **Add to Project**
   ```bash
   NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token
   ```

3. **Benefits**
   - ✅ Free forever
   - ✅ IPFS + Filecoin backup
   - ✅ 5GB per account
   - ✅ Very reliable

---

## Comparison Table

| Service | Free Storage | Speed | Setup Time | Best For |
|---------|-------------|--------|-----------|----------|
| **NFT.Storage** | 100GB | Fast | 2 min | Most users |
| **Pinata** | 1GB | Fast | 3 min | Small projects |
| **Local IPFS** | Unlimited | Fastest | 10 min | Developers |
| **Web3.Storage** | 5GB | Fast | 2 min | Reliability |

---

## Testing Cross-Device Access

After setup:

1. **Upload a file** on Device A
2. **Copy the share link**
3. **Open on Device B** (different browser/device)
4. **Should work!** ✅

Example share URL:
```
http://localhost:3001/view?cid=QmRealIPFSCID&meta=QmMetadataCID&token=abc123
```

---

## Quick Start (NFT.Storage)

Copy-paste ready commands:

```bash
# 1. Get API key from: https://nft.storage

# 2. Add to .env.local
echo "NEXT_PUBLIC_NFT_STORAGE_KEY=eyJhbGc..." > .env.local

# 3. Restart dev server
npm run dev

# 4. Upload file - will now go to real IPFS!
```

---

## Troubleshooting

### "Failed to download share metadata"
- ✅ **Solution**: File is local-only, set up one of the options above

### "All HTTP upload endpoints failed"
- ✅ **Solution**: Add API key to `.env.local`

### "CORS error"
- ✅ **Solution**: If using local IPFS, configure CORS (see Option 3)

### Files disappear after browser clear
- ✅ **Solution**: Use real IPFS (any option above)

---

## Current Workaround

Until you set up real IPFS, files work on:
- ✅ Same browser
- ✅ Same device  
- ✅ Same browser profile

To share across devices NOW:
1. Upload file
2. Copy the CID
3. **Manually transfer the file** (email, USB, etc.)
4. Recipient can use the share link with the encryption key

---

## Next Steps

1. Choose an option (recommend NFT.Storage)
2. Get API key (2 minutes)
3. Add to `.env.local`
4. Restart server
5. Test upload → share → access from another device

**Need help?** Check the official docs:
- NFT.Storage: https://nft.storage/docs
- Pinata: https://docs.pinata.cloud
- IPFS: https://docs.ipfs.tech
