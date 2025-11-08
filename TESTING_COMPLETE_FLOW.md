# 🧪 Quick Testing Guide

## Test the Complete Flow

### Prerequisites
- ✅ Polkadot.js extension installed
- ✅ `.env.local` configured with Pinata & Gemini keys
- ✅ Development server running: `npm run dev`

---

## 🎯 Test 1: Upload & Encrypt

1. **Open the app**
   ```
   http://localhost:3000
   ```

2. **Connect wallet**
   - Click "Connect Wallet"
   - Approve Polkadot.js popup

3. **Upload a file**
   - Drag & drop a medical image or PDF
   - Click "Encrypt & Upload"

4. **Watch the progress**
   ```
   [10%] 🤖 Analyzing with Gemini AI...
   [50%] 🔒 Encrypting file...
   [70%] 🌐 Uploading to IPFS...
   [90%] ⛓️  Storing on blockchain...
   [100%] ✅ Complete!
   ```

5. **Check the console**
   ```javascript
   ✅ UPLOAD COMPLETE - Fully decentralized storage:
      1. ✅ File encrypted (AES-256-GCM)
      2. ✅ Uploaded to IPFS (Pinata)
      3. ✅ Metadata on blockchain (Polkadot)
      4. ✅ Accessible from any device!
   
   📦 CID: QmXXXXXXXXXXXXXXXXXXXXXXXX
   🌐 IPFS URL: https://ipfs.io/ipfs/QmXXX...
   🔗 Pinata Gateway: https://gateway.pinata.cloud/ipfs/QmXXX...
   ```

---

## 🎯 Test 2: Cross-Device Access

### On Device 1 (Upload):
1. Upload a file (follow Test 1)
2. Note your wallet address

### On Device 2 (Access):
1. Open app in different browser/device
2. Install Polkadot.js extension
3. Import same wallet (use seed phrase)
4. Connect wallet
5. **Your files automatically appear!** ✨

**Expected Result:**
- Files loaded from blockchain
- Same CID, encryption key, IV
- Can download and decrypt

---

## 🎯 Test 3: Share with Doctor

### Generate Share Link:

1. **Click "Share" on any file**
   
2. **Copy the generated link:**
   ```
   http://localhost:3000/view?cid=QmXXX&key=YYY&iv=[1,2,3...]
   ```

3. **Share link structure:**
   - `cid`: IPFS Content Identifier
   - `key`: Base64-encoded encryption key
   - `iv`: JSON array of initialization vector

### Test the Share Link:

1. **Open in incognito window** (no wallet needed!)
   
2. **Paste the share link**
   
3. **File auto-loads and displays** ✨

4. **Expected flow:**
   ```
   [10%] 📡 Parsing share link...
   [30%] 📥 Downloading from IPFS...
   [70%] 🔓 Decrypting file...
   [100%] ✅ File ready to view!
   ```

5. **Click "Download"**
   - File decrypts in browser
   - Downloads to device

---

## 🎯 Test 4: IPFS Verification

### Verify file on IPFS:

1. **Get CID from your upload** (e.g., `QmXXXXXXXXXXXXXXXXXXXXX`)

2. **Try multiple IPFS gateways:**
   ```
   https://ipfs.io/ipfs/YOUR_CID_HERE
   https://gateway.pinata.cloud/ipfs/YOUR_CID_HERE
   https://cloudflare-ipfs.com/ipfs/YOUR_CID_HERE
   ```

3. **Expected result:**
   - File downloads (encrypted binary data)
   - Same file size as uploaded
   - Cannot be read (encrypted!)

### Check Pinata Dashboard:

1. Go to https://app.pinata.cloud/pinmanager
2. Login with your account
3. See your uploaded files
4. Verify CID matches

---

## 🎯 Test 5: Encryption Verification

### Test encryption strength:

1. **Upload a text file:**
   ```
   Create test.txt with content: "CONFIDENTIAL MEDICAL DATA"
   ```

2. **Get the CID and download encrypted version:**
   ```
   https://ipfs.io/ipfs/YOUR_CID
   ```

3. **Open in text editor:**
   - Should see binary garbage
   - No readable text
   - Cannot extract original content

4. **Now use share link:**
   - File decrypts perfectly
   - Original text readable

**This proves**: Zero-knowledge encryption working! ✅

---

## 🎯 Test 6: Blockchain Verification

### Verify blockchain storage:

1. **Upload a file**

2. **Open browser console**

3. **Run this command:**
   ```javascript
   // Check localStorage for blockchain data
   Object.keys(localStorage).filter(k => k.includes('files_'))
   ```

4. **Expected data structure:**
   ```javascript
   {
     cid: "QmXXX...",
     fileName: "prescription.jpg",
     encryptionKey: "base64_key_here",
     iv: [1, 2, 3, ...],
     uploadedAt: "2025-11-08T...",
     owner: "wallet_address_here"
   }
   ```

---

## 🧪 Advanced Tests

### Test 7: AI Extraction (Gemini Vision)

1. **Upload a prescription image**
2. **Wait for AI processing**
3. **Verify extracted data:**
   - Doctor name
   - Patient info
   - Medications (name, dosage, frequency)
   - Diagnosis
   - Dates

### Test 8: Error Handling

**Test missing API keys:**
```bash
# Remove Pinata key
NEXT_PUBLIC_PINATA_API_KEY=

# Try upload
# Should get clear error message
```

**Test invalid CID:**
```
http://localhost:3000/view?cid=invalid&key=xxx&iv=[1,2,3]

# Should show error: "Failed to download from IPFS"
```

**Test missing encryption key:**
```
http://localhost:3000/view?cid=QmXXX&iv=[1,2,3]

# Should show error: "Missing encryption key"
```

### Test 9: Multiple Files

1. Upload 5+ different files
2. Verify all appear in file list
3. Download each file
4. Verify correct file downloads
5. Check IPFS has all CIDs

### Test 10: Large Files

1. Upload a 10MB+ PDF
2. Verify upload progress
3. Verify IPFS storage
4. Download and verify file integrity

---

## ✅ Success Criteria

Your implementation is working if:

- ✅ Files upload and get unique CID
- ✅ Files encrypted before upload (inspect IPFS gateway)
- ✅ Files accessible from different devices with same wallet
- ✅ Share links work in incognito/different browser
- ✅ AI extracts data from prescriptions
- ✅ Files decrypt correctly with key+IV
- ✅ No unencrypted data on IPFS
- ✅ Blockchain stores metadata (CID+key+IV)

---

## 🐛 Troubleshooting

### Issue: "Pinata API key not configured"
**Solution:** Add keys to `.env.local` and restart server

### Issue: "Blockchain not connected"
**Solution:** 
- Check if Polkadot node running: `ws://127.0.0.1:9944`
- Or use public endpoint: `wss://westend-rpc.polkadot.io`

### Issue: "Failed to download from IPFS"
**Solution:** 
- File might still be propagating (wait 1-2 minutes)
- Try different gateway
- Check Pinata dashboard

### Issue: "Decryption failed"
**Solution:**
- Verify encryption key in share link
- Check IV is complete JSON array
- Ensure CID is correct

### Issue: "Wallet not detected"
**Solution:**
- Install Polkadot.js extension
- Create/import account
- Refresh page

---

## 📊 Testing Checklist

Copy this checklist for your testing:

```
[ ] Test 1: Upload & Encrypt
[ ] Test 2: Cross-Device Access
[ ] Test 3: Share Link Generation
[ ] Test 4: IPFS Verification
[ ] Test 5: Encryption Verification
[ ] Test 6: Blockchain Storage
[ ] Test 7: AI Extraction
[ ] Test 8: Error Handling
[ ] Test 9: Multiple Files
[ ] Test 10: Large Files

BONUS:
[ ] Test on mobile device
[ ] Test with slow network
[ ] Test with expired blockchain node
[ ] Test share link expiry (if implemented)
[ ] Test access control (if implemented)
```

---

## 🎉 All Tests Passing?

**Congratulations!** 🎊

Your decentralized medical vault is fully functional with:
- ✅ Zero-knowledge encryption
- ✅ IPFS storage
- ✅ Blockchain verification
- ✅ Cross-device sync
- ✅ Easy sharing

**Ready for production?** See `PRODUCTION_READY.md` for deployment guide.

---

## 📝 Notes

- All tests should pass on localhost
- For production, use HTTPS domain
- Test with real medical data only in production with proper consent
- Keep share links secure (they contain decryption keys)

---

**Happy Testing!** 🧪✨
