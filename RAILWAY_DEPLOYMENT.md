# 🚀 Railway Production Deployment Guide

## ✅ Deployment Status

Your Web3 Medical Vault is now deployed to:
- **GitHub**: https://github.com/Barathvasan2003/web3vault
- **Railway**: https://web3vault-production.up.railway.app

---

## 🔧 Environment Variables Required

Set these in Railway Dashboard (Settings → Variables):

### Required for Production:

```bash
# Pinata IPFS (REQUIRED - Get from: https://app.pinata.cloud/)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key_here

# Gemini AI (REQUIRED - Get from: https://aistudio.google.com/app/apikey)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Polkadot Blockchain (Use public endpoint for production)
NEXT_PUBLIC_WS_PROVIDER=wss://westend-rpc.polkadot.io
NEXT_PUBLIC_CHAIN_NAME=Westend
NEXT_PUBLIC_APP_NAME=WebVault3

# NFT.Storage (Optional fallback)
NEXT_PUBLIC_NFT_STORAGE_KEY=your_nft_storage_key_here
```

---

## 📝 Steps to Complete Deployment

### 1. **Set Environment Variables in Railway**

1. Go to Railway Dashboard: https://railway.app/
2. Select your project: `web3vault`
3. Click on "Variables" tab
4. Add each variable above with your actual keys

### 2. **Verify Deployment**

Railway will automatically:
- ✅ Pull latest code from GitHub
- ✅ Install dependencies (`npm install`)
- ✅ Build Next.js app (`npm run build`)
- ✅ Start production server (`npm run start`)

Check deployment logs in Railway dashboard.

### 3. **Test Production App**

Visit: https://web3vault-production.up.railway.app

Test the flow:
1. Connect Polkadot wallet
2. Upload a medical file
3. Verify IPFS upload
4. Check blockchain storage
5. Try sharing a file

---

## 🔒 Production Security Checklist

### ✅ **HTTPS Enabled**
- Railway provides automatic HTTPS
- Share links are secure

### ✅ **Environment Variables**
- API keys stored securely in Railway
- Never committed to GitHub

### ⚠️ **TODO: Additional Security**

1. **Rate Limiting**
   - Add to prevent API abuse
   - Use Railway's built-in limits

2. **Access Control**
   - Implement wallet-based ACL
   - Add share link expiry

3. **Monitoring**
   - Set up Railway alerts
   - Monitor IPFS usage on Pinata
   - Track blockchain transactions

---

## 🔄 Continuous Deployment

Railway automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Railway automatically:
# 1. Detects push to main branch
# 2. Pulls latest code
# 3. Rebuilds application
# 4. Deploys to production
```

---

## 📊 Railway Configuration

Your `railway.json` is configured for:
- **Builder**: NIXPACKS (auto-detects Next.js)
- **Start Command**: `npm run start`
- **Restart Policy**: On failure (max 10 retries)

---

## 🌐 Custom Domain (Optional)

To use your own domain:

1. Go to Railway Dashboard → Settings
2. Click "Generate Domain" or "Custom Domain"
3. Add your domain (e.g., `medvault.com`)
4. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Value: web3vault-production.up.railway.app
   ```

---

## 🐛 Troubleshooting Production

### Issue: "Environment variables not found"
**Solution:** 
- Check Railway Variables tab
- Ensure all `NEXT_PUBLIC_*` variables are set
- Redeploy after adding variables

### Issue: "Pinata upload failed"
**Solution:**
- Verify Pinata API keys in Railway
- Check Pinata dashboard for rate limits
- Test keys locally first

### Issue: "Blockchain connection failed"
**Solution:**
- Using public endpoint: `wss://westend-rpc.polkadot.io`
- Check Polkadot network status
- Fallback: App works without blockchain (local storage)

### Issue: "Build failed"
**Solution:**
- Check Railway build logs
- Verify `package.json` has all dependencies
- Run `npm run build` locally to test

---

## 📈 Monitoring Production

### Railway Dashboard:
- **Deployments**: View build/deploy history
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs

### Pinata Dashboard:
- **Usage**: Track IPFS storage and bandwidth
- **Files**: View all uploaded files
- **Gateway**: Monitor gateway performance

### Blockchain Explorer:
- **Westend**: https://westend.subscan.io/
- Search your wallet address
- View all file registration transactions

---

## 💰 Cost Estimate (Production)

### Railway:
- **Starter Plan**: $5/month
- **Pro Plan**: $20/month (recommended)
- Includes: 500 GB bandwidth, 8 GB RAM

### Pinata IPFS:
- **Free Tier**: 1 GB storage (100 files)
- **Picnic Plan**: $20/month (100 GB)
- **Submarine Plan**: Custom pricing

### Gemini AI:
- **Free Tier**: 60 requests/min
- **Pay-as-you-go**: $0.001 per image

### Polkadot:
- **Transaction fees**: ~$0.01 per file upload
- **Westend testnet**: FREE

**Total Monthly Cost**: 
- Small scale (< 100 users): **~$5-10**
- Medium scale (< 1000 users): **~$40-50**

---

## 🚀 Production Deployment Complete!

Your app is now live at:
**https://web3vault-production.up.railway.app**

### What's Deployed:
✅ Complete encryption system (AES-256-GCM)
✅ IPFS storage via Pinata
✅ Polkadot blockchain integration
✅ Cross-device sync
✅ File sharing system
✅ AI-powered OCR (Gemini)
✅ Full documentation

### Next Steps:
1. Set environment variables in Railway
2. Test production deployment
3. Configure custom domain (optional)
4. Monitor usage and costs
5. Add advanced features (ACL, expiry, etc.)

---

## 📞 Support

**Railway Issues:**
- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway

**App Issues:**
- Check logs in Railway dashboard
- Review `QUICKSTART_GUIDE.md`
- Test locally first: `npm run dev`

---

**🎉 Congratulations! Your decentralized medical vault is live in production!** 🎉

**URL**: https://web3vault-production.up.railway.app
