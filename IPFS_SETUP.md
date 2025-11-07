# IPFS Configuration for Web3Vault

## Production Setup (Required for Real IPFS)

### Option 1: Pinata (Recommended - Easy Setup)
1. Sign up at https://www.pinata.cloud/
2. Get your API keys
3. Add to .env.local:

```
NEXT_PUBLIC_IPFS_HOST=api.pinata.cloud
NEXT_PUBLIC_IPFS_PORT=443
NEXT_PUBLIC_IPFS_PROTOCOL=https
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_API_KEY=your_secret_key_here
```

### Option 2: Web3.Storage (Free for Public Good)
1. Sign up at https://web3.storage/
2. Get your API token
3. Add to .env.local:

```
WEB3_STORAGE_TOKEN=your_token_here
```

### Option 3: Infura IPFS (Free Tier)
1. Sign up at https://infura.io/
2. Create an IPFS project
3. Add to .env.local:

```
NEXT_PUBLIC_IPFS_HOST=ipfs.infura.io
NEXT_PUBLIC_IPFS_PORT=5001
NEXT_PUBLIC_IPFS_PROTOCOL=https
INFURA_PROJECT_ID=your_project_id
INFURA_PROJECT_SECRET=your_project_secret
```

### Option 4: Run Your Own IPFS Node (Full Control)
1. Install IPFS: https://docs.ipfs.io/install/
2. Start IPFS daemon: `ipfs daemon`
3. Add to .env.local:

```
NEXT_PUBLIC_IPFS_HOST=localhost
NEXT_PUBLIC_IPFS_PORT=5001
NEXT_PUBLIC_IPFS_PROTOCOL=http
```

## Current Configuration

The system is configured to use Infura IPFS by default:
- Host: ipfs.infura.io
- Port: 5001
- Protocol: https

## Testing IPFS Connection

Run this command to test if IPFS is working:

```bash
npm run dev
```

Then try uploading a file. You should see:
- "🌐 Uploading encrypted file to IPFS..." 
- Progress: 70-100%
- "✅ Uploaded to IPFS! CID: Qm..."

## Troubleshooting

### "IPFS client initialization failed"
- Check your internet connection
- Verify IPFS host/port/protocol in .env.local
- Try switching to a different IPFS provider

### "Failed to upload to IPFS"
- Check if you have an API key (for Pinata/Infura)
- Verify your account has remaining upload quota
- Try using a different IPFS gateway

### "Cannot assign to read only property 'name'"
- This is a known issue with ipfs-http-client
- Use URL format instead of object config
- Already fixed in lib/ipfs/ipfs-client.ts

## Production Deployment

For production, we recommend:
1. **Pinata** - Best for reliability and ease of use
2. **Filecoin/Crust Network** - Best for long-term archival
3. **Multiple Gateways** - Use redundancy for high availability

## File Structure

```
lib/ipfs/
├── ipfs-client.ts      - Real IPFS client (Production)
└── ipfs-client-mock.ts - Mock for development (Not used)
```

## Cost Estimates

- **Pinata Free**: 1GB storage, unlimited bandwidth
- **Infura Free**: 5GB uploads/month
- **Web3.Storage**: Free for public good projects
- **Self-hosted**: Free but requires server maintenance
