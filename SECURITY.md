# 🔐 Security Architecture

## Key Storage & Encryption

### How Your Medical Records Are Secured

Web3Vault uses multiple layers of security to protect your sensitive medical data:

---

## 🔑 Encryption Keys

### Local Storage (Browser)
- **Encryption keys are stored in your browser's localStorage**
- Keys are associated with your wallet address
- Keys **NEVER** leave your device
- Keys are **NOT** uploaded to any server or blockchain

### Key Generation
```
1. File Selected → Generate Random Encryption Key (256-bit)
2. Encrypt File → AES-256-GCM Algorithm
3. Upload Encrypted Data → IPFS Network
4. Store Key Locally → localStorage['files_${walletAddress}']
```

---

## 🌐 When Hosted on GitHub Pages

### What Happens to Your Keys?

✅ **SAFE:** Your encryption keys remain in **your browser only**
- GitHub Pages only hosts the **HTML/JavaScript code**
- No server-side processing - everything runs in your browser
- Keys are stored in **localStorage** (browser-specific)
- If you clear browser data, keys are deleted

⚠️ **IMPORTANT:** 
- **Different browsers = Different keys** (Chrome ≠ Firefox)
- **Incognito mode = No persistence** (keys deleted after closing)
- **Browser cache cleared = Keys lost**

### Data Flow Diagram
```
┌─────────────────────────────────────────────────────────┐
│                  YOUR BROWSER (Client)                   │
│                                                           │
│  ┌─────────────┐      ┌──────────────┐                  │
│  │   Your      │      │  Encryption  │                  │
│  │  Medical    │ ───> │     Key      │                  │
│  │   Files     │      │  (256-bit)   │                  │
│  └─────────────┘      └──────────────┘                  │
│         │                     │                          │
│         ↓                     ↓                          │
│  ┌─────────────────────────────────┐                    │
│  │     Encrypted File Data          │                    │
│  │     (AES-256-GCM)                │                    │
│  └─────────────────────────────────┘                    │
│         │                     │                          │
│         ↓                     ↓                          │
│  ┌───────────┐         ┌────────────┐                   │
│  │   IPFS    │         │ localStorage │                  │
│  │  Upload   │         │  (Your PC)   │                  │
│  └───────────┘         └────────────┘                   │
└─────────────────────────────────────────────────────────┘
         │                       
         ↓                       
┌──────────────────┐
│  IPFS Network    │  ← Only encrypted data stored here
│  (Decentralized) │     NO KEYS, NO ORIGINAL FILES
└──────────────────┘
```

---

## 🛡️ Security Best Practices

### For Users

1. **Backup Your Keys**
   - Export encryption keys regularly
   - Store backups securely (password manager, USB drive)
   - Keys cannot be recovered if lost

2. **Browser Security**
   - Use a secure, updated browser
   - Enable browser security features
   - Be cautious with browser extensions

3. **Wallet Security**
   - Your Polkadot wallet controls access
   - Protect your wallet seed phrase
   - Never share your private keys

### For Developers (If Forking)

1. **Never Log Keys**
   ```javascript
   // ❌ BAD
   console.log('Encryption Key:', key);
   
   // ✅ GOOD
   console.log('File encrypted successfully');
   ```

2. **Never Send Keys to Server**
   ```javascript
   // ❌ BAD
   await fetch('/api/save-key', { body: encryptionKey });
   
   // ✅ GOOD
   localStorage.setItem('key', encryptionKey);
   ```

3. **Always Use HTTPS**
   - GitHub Pages uses HTTPS by default
   - Never host on HTTP-only sites

---

## 🔒 What Data Goes Where?

| Data Type | Storage Location | Encrypted? | Can Be Shared? |
|-----------|------------------|------------|----------------|
| **Original Medical File** | Never stored | N/A | ❌ No |
| **Encrypted File** | IPFS Network | ✅ Yes | ✅ Yes (CID only) |
| **Encryption Key** | Browser localStorage | ❌ No | ❌ Never |
| **Initialization Vector (IV)** | Browser localStorage | ❌ No | ✅ Yes (needed for decryption) |
| **File Metadata** | Browser localStorage | ❌ No | ✅ Yes |
| **IPFS CID** | Browser localStorage | ❌ No | ✅ Yes |
| **Wallet Address** | Polkadot Extension | ❌ No | ✅ Yes (public) |

---

## 📱 Demo Mode

When users click **"View Demo Without Wallet"**:

1. Creates a temporary demo account
2. Generates sample medical records
3. Uses mock encryption (for demo only)
4. All data cleared on disconnect
5. **No real wallet required**
6. **Perfect for testing on GitHub Pages**

---

## 🚨 Security Considerations

### What Could Go Wrong?

1. **Browser Cache Cleared**
   - ⚠️ Risk: Encryption keys lost
   - ✅ Solution: Backup keys regularly

2. **Different Device**
   - ⚠️ Risk: Keys not synced across devices
   - ✅ Solution: Export keys and import on new device

3. **Malicious Browser Extension**
   - ⚠️ Risk: Extension reads localStorage
   - ✅ Solution: Only use trusted extensions

4. **Physical Device Access**
   - ⚠️ Risk: Someone with PC access can read localStorage
   - ✅ Solution: Use device encryption, lock screen

### What CANNOT Go Wrong?

✅ **GitHub Cannot Access Your Keys**
- Static hosting = no server-side access
- Keys never uploaded to GitHub

✅ **IPFS Cannot Decrypt Your Files**
- Only encrypted data uploaded
- No keys stored on IPFS

✅ **Other Users Cannot Access Your Data**
- Keys tied to your wallet address
- Encryption is client-side only

---

## 🎓 For Hackathon Judges

### Why This Architecture is Secure:

1. **Zero-Knowledge**: GitHub hosts code, not data
2. **Client-Side Encryption**: All encryption happens in browser
3. **Decentralized Storage**: IPFS for censorship resistance
4. **Wallet-Based Auth**: Polkadot provides identity
5. **Open Source**: Code can be audited by anyone

### Demo Mode for Testing:
- Judges can test without installing Polkadot wallet
- Sample data auto-loaded
- Shows full functionality
- No blockchain node required

---

## 📝 Summary

**Your Encryption Keys Are:**
- ✅ Generated locally in your browser
- ✅ Stored only in browser localStorage
- ✅ Never sent to any server
- ✅ Never uploaded to blockchain or IPFS
- ✅ Only accessible to you

**When Hosted on GitHub Pages:**
- ✅ Completely safe - GitHub only hosts static files
- ✅ No server can access your keys
- ✅ Keys remain in your browser only
- ✅ Clear browser data = keys deleted (by design)

**For Maximum Security:**
- 🔐 Regularly backup your encryption keys
- 🔐 Use a secure device and browser
- 🔐 Protect your Polkadot wallet
- 🔐 Never share your keys with anyone

---

## 📧 Questions?

If you have security concerns or questions:
1. Review the source code (it's open source!)
2. Check our encryption implementation in `/lib/encryption/`
3. Test in demo mode first
4. Verify everything runs client-side

**Remember:** In Web3, you own your data. With great power comes great responsibility! 🦸‍♂️
