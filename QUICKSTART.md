# ⚡ Quick Start Guide - WebVault3

Get WebVault3 running in under 10 minutes!

---

## 🎯 30-Second Overview

**WebVault3** is a decentralized medical vault where you:
1. Login with Polkadot wallet (no email needed)
2. Upload medical files → AI extracts info automatically
3. Files encrypted + stored on IPFS
4. Share with doctors using time-limited tokens
5. Emergency QR card for critical health info

**Stack:** Next.js + Polkadot + IPFS + GPT-4 + AES-256

---

## ⚡ Fast Track Setup (Development)

### Step 1: Prerequisites (5 min)

```powershell
# Check Node.js (need 18+)
node --version

# If not installed: Download from https://nodejs.org/

# Install Polkadot wallet extension
# https://polkadot.js.org/extension/
```

### Step 2: Get API Keys (5 min)

1. **OpenAI** (for AI features)
   - Visit: https://platform.openai.com/api-keys
   - Create key → Copy it

2. **Infura IPFS** (for file storage)
   - Visit: https://infura.io/ → Sign up free
   - Create project → Get credentials

### Step 3: Install & Run (2 min)

```powershell
# Clone or navigate to project
cd C:\Users\barat\OneDrive\Desktop\Web3vault\webvault3

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit with your keys
notepad .env.local
```

**Minimum Required in `.env.local`:**
```env
OPENAI_API_KEY=sk-your-openai-key-here
NEXT_PUBLIC_IPFS_HOST=ipfs.infura.io
NEXT_PUBLIC_IPFS_PORT=5001
NEXT_PUBLIC_IPFS_PROTOCOL=https
```

```powershell
# Start app
npm run dev
```

### Step 4: Access (1 min)

1. Open: **http://localhost:3000**
2. Click **"Connect Wallet"**
3. Select your Polkadot account
4. Done! 🎉

---

## 🎓 First-Time User Guide

### Create Your First Medical Record

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Authorize Polkadot.js extension
   - Select account

2. **Upload File**
   - Click "Upload File" tab
   - Drag & drop prescription/report image
   - Wait for AI extraction (10-20 seconds)
   - Review extracted info
   - Click "Save to Vault"

3. **View Records**
   - Click "My Records" tab
   - See your encrypted files
   - Download anytime

4. **Share with Doctor**
   - Click on any record
   - Click "Share"
   - Set expiry time
   - Copy link → Send to doctor

5. **Emergency Card**
   - Click "Emergency" tab
   - Fill in: Blood type, allergies, contacts
   - Save QR code
   - Show QR in emergencies

---

## 🔧 Troubleshooting

### "Cannot connect to wallet"
→ Install Polkadot.js extension: https://polkadot.js.org/extension/

### "IPFS upload fails"
→ Check your Infura credentials in `.env.local`

### "AI extraction not working"
→ Verify OpenAI API key is valid

### "Blockchain not connected"
→ For MVP, this is OK! Files still work with local storage

---

## 🚀 Running with Blockchain (Optional)

### Windows (WSL Required)

```powershell
# 1. Install WSL
wsl --install

# 2. Restart computer

# 3. Open Ubuntu terminal

# 4. Install Rust
curl https://sh.rustup.rs -sSf | sh
source $HOME/.cargo/env

# 5. Install dependencies
sudo apt update && sudo apt install -y \
  git clang curl libssl-dev llvm libudev-dev make protobuf-compiler

# 6. Clone Substrate
cd /mnt/c/Users/barat/OneDrive/Desktop/Web3vault
git clone https://github.com/substrate-developer-hub/substrate-node-template web3vault-chain
cd web3vault-chain

# 7. Build (takes 20-30 min)
cargo build --release

# 8. Run
./target/release/node-template --dev
```

Now your blockchain is running on `ws://127.0.0.1:9944`!

---

## 📦 What You Get

### Features Included in MVP

✅ **Authentication**
- Polkadot wallet login
- No email/password needed

✅ **File Management**
- Upload medical files
- AES-256 encryption
- IPFS storage
- Download anytime

✅ **AI Intelligence**
- OCR text extraction
- Medical NLP parsing
- Auto-categorization
- Medication extraction

✅ **Sharing**
- Time-limited access tokens
- Share with doctors
- Revoke anytime
- View access logs

✅ **Emergency Card**
- QR code with critical info
- Blood type, allergies
- Emergency contacts
- Scan with any phone

---

## 📚 Learn More

| Resource | Link |
|----------|------|
| Full Setup Guide | [docs/SETUP.md](./SETUP.md) |
| Architecture | [docs/ARCHITECTURE.md](./ARCHITECTURE.md) |
| Demo Script | [docs/DEMO_SCRIPT.md](./DEMO_SCRIPT.md) |
| API Documentation | Coming soon |

---

## 🎯 Next Steps

After getting it running:

1. ✅ Upload a test prescription image
2. ✅ Try AI extraction
3. ✅ Create emergency card
4. ✅ Test sharing feature
5. ✅ Record demo video
6. ✅ Deploy to Vercel
7. ✅ Submit to hackathon!

---

## 💡 Pro Tips

### For Hackathon Demo

1. **Prepare Test Data**
   - Have 2-3 sample prescription images ready
   - Create emergency card beforehand
   - Test sharing flow

2. **Show the "Wow" Moments**
   - AI extracting medication from image
   - Instant file encryption
   - QR emergency card
   - Blockchain audit trail

3. **Emphasize Innovation**
   - No servers needed
   - Patient owns data
   - Privacy-first design
   - Real-world healthcare impact

### For Development

```bash
# Hot reload is enabled
# Edit code → Saves automatically → Browser refreshes

# Check console for errors
# Browser DevTools (F12) → Console tab

# Backend logs
# Terminal running `npm run dev`
```

---

## 🆘 Getting Help

### Common Issues

**Q: "npm install" fails**
```powershell
# Clear cache and retry
rm -r node_modules
rm package-lock.json
npm cache clean --force
npm install
```

**Q: Port 3000 already in use**
```powershell
# Use different port
PORT=3001 npm run dev
```

**Q: OCR is slow**
- Normal! First run downloads Tesseract models
- Subsequent runs are faster
- Consider using Google Vision API for production

---

## ✨ Quick Commands Reference

```powershell
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Check code quality

# Deployment
vercel              # Deploy to Vercel
netlify deploy      # Deploy to Netlify

# Testing
npm test            # Run tests (if configured)
```

---

## 📊 Project Structure (Simplified)

```
webvault3/
├── app/                 # Next.js pages
│   ├── dashboard/      # Main dashboard
│   ├── records/        # Medical records
│   └── emergency/      # Emergency card
├── lib/                # Core utilities
│   ├── encryption/     # AES-256 encryption
│   ├── ipfs/          # IPFS client
│   ├── polkadot/      # Blockchain
│   └── ai/            # OCR + Medical NLP
├── components/         # React components
└── docs/              # Documentation
```

---

## 🎉 You're Ready!

**Time to build the future of healthcare! 🚀**

Questions? Check the full docs or create an issue on GitHub.

---

**Happy Hacking! 💪**
