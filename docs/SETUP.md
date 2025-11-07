# 🚀 Complete Setup & Deployment Guide - WebVault3

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Blockchain Setup](#blockchain-setup)
4. [AI Services Configuration](#ai-services-configuration)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ | Frontend development |
| npm/yarn | 9+ | Package management |
| Rust | Latest | Blockchain development |
| WSL2 (Windows) | Latest | Blockchain on Windows |

### Required Accounts (Free Tier)

- ✅ **OpenAI Account** - For AI/NLP features
- ✅ **Supabase Account** - For metadata storage
- ✅ **Infura Account** - For IPFS access
- ✅ **Vercel Account** - For deployment

---

## 🔧 Local Development Setup

### Step 1: Install Node.js & Dependencies

#### Windows:
```powershell
# Download and install Node.js from https://nodejs.org/
node --version  # Should be 18+
npm --version   # Should be 9+

# Navigate to project
cd C:\Users\barat\OneDrive\Desktop\Web3vault\webvault3

# Install dependencies
npm install
```

#### WSL/Linux:
```bash
# Update packages
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Environment Configuration

```powershell
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
notepad .env.local
```

**Required Environment Variables:**

```env
# Blockchain
NEXT_PUBLIC_WS_PROVIDER=ws://127.0.0.1:9944

# IPFS (Get free key from Infura)
NEXT_PUBLIC_IPFS_HOST=ipfs.infura.io
NEXT_PUBLIC_IPFS_PORT=5001
NEXT_PUBLIC_IPFS_PROTOCOL=https

# OpenAI (Get from https://platform.openai.com/)
OPENAI_API_KEY=sk-your-openai-key-here

# Supabase (Get from https://supabase.com/)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://your-database-url

# Security
JWT_SECRET=generate-a-random-32-character-string-here
ENCRYPTION_SALT=another-random-string-for-encryption
```

### Step 3: Install Polkadot.js Wallet

1. Open Chrome/Brave browser
2. Visit: https://polkadot.js.org/extension/
3. Click "Add to Chrome"
4. Create a new wallet account
5. **⚠️ SAVE YOUR SEED PHRASE SECURELY**

---

## ⛓️ Blockchain Setup

### Option A: Quick Start (Local Development Node)

#### Windows (WSL2 Required):

```powershell
# 1. Enable WSL2
wsl --install

# 2. Restart computer

# 3. Open Ubuntu from Start Menu

# 4. Inside WSL, install Rust
curl https://sh.rustup.rs -sSf | sh
source $HOME/.cargo/env

# 5. Install dependencies
sudo apt update && sudo apt install -y \
  git clang curl libssl-dev llvm libudev-dev make protobuf-compiler

# 6. Clone Substrate template
cd /mnt/c/Users/barat/OneDrive/Desktop/Web3vault
git clone https://github.com/substrate-developer-hub/substrate-node-template web3vault-chain
cd web3vault-chain

# 7. Build blockchain (takes 20-30 minutes first time)
cargo build --release

# 8. Run development node
./target/release/node-template --dev
```

#### Linux/Mac:

```bash
# Same commands as above, skip WSL setup
```

### Option B: Production (Polkadot Cloud)

1. Visit: https://cloud.polkadot.network/
2. Create free account
3. Deploy your chain
4. Update `NEXT_PUBLIC_WS_PROVIDER` in `.env.local`

---

## 🤖 AI Services Configuration

### 1. OpenAI Setup

```bash
# Get API key from https://platform.openai.com/api-keys
# Add to .env.local:
OPENAI_API_KEY=sk-your-key-here

# Test with:
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Cost Optimization:**
- Using `gpt-4o-mini` for hackathon (cheap)
- ~$0.15 per 1M tokens
- Budget estimate: $5-10 for entire hackathon

### 2. Supabase Setup

```bash
# 1. Create account at https://supabase.com/
# 2. Create new project
# 3. Get URL and anon key from Settings > API
# 4. Create tables:
```

**SQL Schema:**
```sql
-- Medical records metadata table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_address TEXT NOT NULL,
  cid TEXT NOT NULL,
  file_name TEXT,
  file_hash TEXT,
  record_type TEXT,
  upload_date TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Access tokens table
CREATE TABLE access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT UNIQUE NOT NULL,
  file_id UUID REFERENCES medical_records(id),
  owner_address TEXT NOT NULL,
  granted_to TEXT NOT NULL,
  expires_at TIMESTAMP,
  max_views INT DEFAULT 1,
  current_views INT DEFAULT 0,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Access logs table
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL,
  accessor_address TEXT NOT NULL,
  file_id UUID REFERENCES medical_records(id),
  accessed_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX idx_patient_address ON medical_records(patient_address);
CREATE INDEX idx_cid ON medical_records(cid);
CREATE INDEX idx_token_id ON access_tokens(token_id);
CREATE INDEX idx_access_logs_token ON access_logs(token_id);
```

---

## 🏃 Running the Application

### Terminal 1: Start Blockchain

```bash
# In WSL (Windows) or Terminal (Linux/Mac)
cd /mnt/c/Users/barat/OneDrive/Desktop/Web3vault/web3vault-chain
./target/release/node-template --dev
```

**Expected Output:**
```
2024-11-05 10:00:00 Substrate Node
2024-11-05 10:00:00 ✨ version 4.0.0-dev-xxxxxxx
2024-11-05 10:00:00 💾 Database: RocksDb at /tmp/...
2024-11-05 10:00:00 📦 Highest known block at #0
2024-11-05 10:00:00 🏷  Local node identity is: 12D3KooW...
2024-11-05 10:00:00 Running JSON-RPC server: addr=127.0.0.1:9944
```

### Terminal 2: Start Frontend

```powershell
# In PowerShell (Windows) or Terminal (Linux/Mac)
cd C:\Users\barat\OneDrive\Desktop\Web3vault\webvault3
npm run dev
```

**Expected Output:**
```
   ▲ Next.js 14.1.0
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.3s
```

### Access the Application

1. Open browser: **http://localhost:3000**
2. Click "Connect Wallet"
3. Allow Polkadot.js extension access
4. Select your account
5. Start using WebVault3! 🎉

---

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)

```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd C:\Users\barat\OneDrive\Desktop\Web3vault\webvault3
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Scope: Your account
# - Link to existing project? No
# - Project name: webvault3
# - Directory: ./
# - Override settings? No

# Add environment variables in Vercel dashboard:
# https://vercel.com/your-username/webvault3/settings/environment-variables
```

### Option 2: Netlify

```powershell
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
cd C:\Users\barat\OneDrive\Desktop\Web3vault\webvault3
netlify deploy --prod

# Or connect GitHub repo for auto-deploy
```

### Option 3: GitHub Pages

```powershell
# Build static export
npm run build

# Deploy to GitHub Pages
# (Requires static export - Next.js 14 supports this)
```

### Blockchain Deployment

#### Option A: Polkadot Cloud (Free Tier)

1. Visit: https://cloud.polkadot.network/
2. Sign up for free account
3. Deploy your chain:
   - Select "Substrate Node Template"
   - Choose free tier
   - Deploy
4. Get WebSocket endpoint
5. Update frontend env: `NEXT_PUBLIC_WS_PROVIDER=wss://your-chain.polkadot.cloud`

#### Option B: VPS Deployment

```bash
# On Ubuntu VPS
sudo apt update
sudo apt install -y docker.io docker-compose

# Pull and run blockchain
docker run -d \
  --name web3vault-chain \
  -p 9944:9944 \
  -v chain-data:/data \
  parity/substrate:latest \
  --dev --ws-external
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to blockchain"

**Solution:**
```powershell
# Check if blockchain is running
# In WSL:
ps aux | grep node-template

# Restart blockchain
cd /mnt/c/Users/barat/OneDrive/Desktop/Web3vault/web3vault-chain
./target/release/node-template --dev
```

### Issue: "No Polkadot wallet found"

**Solution:**
1. Install extension: https://polkadot.js.org/extension/
2. Create account
3. Refresh page
4. Try connecting again

### Issue: "IPFS upload fails"

**Solution:**
```javascript
// Check IPFS connection in browser console:
// 1. Open browser DevTools (F12)
// 2. Go to Console tab
// 3. Look for "IPFS connected" message

// If fails, try alternative gateway in .env.local:
NEXT_PUBLIC_IPFS_HOST=ipfs.io
NEXT_PUBLIC_IPFS_PORT=443
NEXT_PUBLIC_IPFS_PROTOCOL=https
```

### Issue: "OpenAI API errors"

**Solution:**
```bash
# Check API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check quota: https://platform.openai.com/account/usage
# Add billing if needed (min $5)
```

### Issue: "Build fails on Windows"

**Solution:**
```powershell
# Clear cache
rm -r node_modules
rm package-lock.json
npm cache clean --force

# Reinstall
npm install

# If still fails, use WSL:
wsl
cd /mnt/c/Users/barat/OneDrive/Desktop/Web3vault/webvault3
npm install
npm run dev
```

---

## 📊 Performance Optimization

### 1. IPFS Optimization

```javascript
// Use local IPFS node for faster uploads
// Install IPFS Desktop: https://docs.ipfs.io/install/ipfs-desktop/

// Update .env.local:
NEXT_PUBLIC_IPFS_HOST=localhost
NEXT_PUBLIC_IPFS_PORT=5001
NEXT_PUBLIC_IPFS_PROTOCOL=http
```

### 2. Blockchain Optimization

```bash
# Use archive node for faster queries
./target/release/node-template \
  --dev \
  --pruning=archive \
  --rpc-cors all
```

### 3. Frontend Optimization

```powershell
# Enable production build
npm run build
npm start

# Much faster than dev mode
```

---

## 🔒 Security Checklist

- [ ] Environment variables not committed to Git
- [ ] HTTPS enabled in production
- [ ] Wallet seed phrase backed up securely
- [ ] API keys rotated regularly
- [ ] CORS configured properly
- [ ] CSP headers set
- [ ] Rate limiting enabled

---

## 📞 Support

- **Documentation**: https://docs.webvault3.dev
- **Discord**: [Join community](#)
- **Issues**: [GitHub Issues](https://github.com/your-username/webvault3/issues)
- **Email**: support@webvault3.dev

---

## ✅ Quick Checklist

Before hackathon demo:

- [ ] Blockchain running
- [ ] Frontend running
- [ ] Wallet connected
- [ ] Test file upload works
- [ ] OCR extraction works
- [ ] Sharing feature works
- [ ] Emergency card displays
- [ ] Demo video recorded
- [ ] Presentation ready

---

**🎉 You're all set! Happy hacking!**
