# 🚀 Quick Start - View & Test Files

## ⚡ Instant Access

Your Web3vault is running! Here are the direct links:

### 🧪 **Test Encryption Lab** (Create Sample Files)
```
http://localhost:3001/test-encryption
```
- Create encrypted text files (medical prescriptions)
- Create encrypted image files (prescription images)  
- Run comprehensive encryption tests
- See live encryption/decryption in action

### 👁️ **File Viewer** (View Shared Files)
```
http://localhost:3001/view
```
- View files by CID
- Test with your sample CID: `Qmyxopf3etlmb7olg9jg44ceiz4mz12476gfez6qj9s625`
- Download and decrypt files
- Preview images and text

### 🏠 **Main Dashboard**
```
http://localhost:3001
```
- Upload new files
- View your files
- Share with custom links
- Edit AI-extracted data

---

## 🎯 5-Minute Test Guide

### Step 1: Create Sample Files (30 seconds)
```bash
1. Open: http://localhost:3001/test-encryption
2. Click: "📄 Create Sample Text File"
3. A new tab opens automatically with your file!
4. Try: "🖼️ Create Sample Image File" too
```

### Step 2: View the Files (30 seconds)
```bash
# The viewer opens automatically, showing:
✅ File name, type, and size
✅ Encrypted status (AES-256-GCM)
✅ AI-extracted medical data
✅ Decrypted preview (image or text)
```

### Step 3: Download Files (15 seconds)
```bash
1. In the viewer, click: "⬇️ Download & Decrypt File"
2. File downloads decrypted to your computer
3. Open it - should work perfectly!
```

### Step 4: Test Sharing (1 minute)
```bash
1. Go to dashboard: http://localhost:3001
2. Upload any file (or use samples from test lab)
3. Click "Share" button
4. Choose: Permanent / One-Time / 24 Hours / Custom
5. Click "🔗 Copy Link"
6. Open in incognito/new browser - it works!
```

### Step 5: Run Encryption Tests (1 minute)
```bash
1. Open: http://localhost:3001/test-encryption
2. Click: "▶️ Run All Tests"
3. Watch 3 tests complete:
   - Text file encryption ✅
   - Image file encryption ✅
   - Medical data encryption ✅
4. Check results - all should be green!
```

---

## 📋 Test with Your CID

### Example CID:
```
Qmyxopf3etlmb7olg9jg44ceiz4mz12476gfez6qj9s625
```

### Try It:
```bash
# Method 1: Direct URL
http://localhost:3001/view?cid=Qmyxopf3etlmb7olg9jg44ceiz4mz12476gfez6qj9s625&access=permanent

# Method 2: Manual Entry
1. Go to: http://localhost:3001/view
2. Paste CID: Qmyxopf3etlmb7olg9jg44ceiz4mz12476gfez6qj9s625
3. Select: Permanent Access
4. Click: Load File
```

---

## 🎨 What You'll See

### Test Lab Page:
```
🧪 Encryption Test Lab
├── 📦 Create Sample Files
│   ├── 📄 Create Sample Text File (prescription)
│   └── 🖼️ Create Sample Image File (prescription image)
└── 🔬 Run Encryption Tests
    ├── Text encryption test
    ├── Image encryption test
    └── Medical data test
```

### Viewer Page:
```
🔗 View Shared Medical File
├── 📦 IPFS CID Input
├── 🔑 Access Type Selector
├── 🔍 Load File Button
└── Results:
    ├── ✅ File Found!
    ├── 📊 File Details
    ├── 🔐 Encryption Status
    ├── 🤖 AI Extracted Data
    ├── 👁️ Decrypted Preview
    └── ⬇️ Download Button
```

---

## ✅ Success Checklist

After testing, you should see:

- [ ] Sample files created (text and image)
- [ ] Files open in viewer automatically
- [ ] Images display in preview section
- [ ] Text shows correctly
- [ ] Download works (files decrypt properly)
- [ ] Encryption tests all pass (3/3 green)
- [ ] Share links work (copy and open)
- [ ] AI data displays (if available)
- [ ] No errors in browser console
- [ ] Files can be opened after download

---

## 🔐 What's Being Tested

### Real AES-256-GCM Encryption:
```javascript
✅ 256-bit encryption keys (military-grade)
✅ 12-byte random IV per file
✅ GCM mode (authenticated encryption)
✅ Browser's native WebCrypto API
✅ Zero-knowledge architecture
✅ HIPAA-compliant encryption
```

### File Types Tested:
```
📄 Text files (.txt) - Medical prescriptions
🖼️ Images (.png) - Prescription images
📋 JSON data - Structured medical records
```

---

## 🚨 Troubleshooting

### "File not found"
→ Create a sample file first using test lab

### "Preview not available"  
→ Normal for old CIDs - encrypted data only stored temporarily

### "Download failed"
→ Check browser console for errors. Try with fresh sample file.

### Port 3000 in use
→ Server automatically uses port 3001 (already handled)

---

## 📱 Share Links Format

### Generated Links:
```bash
# From dashboard Share modal:
http://localhost:3001/view?cid=YOUR_CID&access=permanent
http://localhost:3001/view?cid=YOUR_CID&access=one-time
http://localhost:3001/view?cid=YOUR_CID&access=24-hours
http://localhost:3001/view?cid=YOUR_CID&access=custom
```

### Copy & Share:
1. Click Share on any file in dashboard
2. Choose access type
3. Click "🔗 Copy Link"  
4. Share via email, chat, etc.
5. Recipient can view and download (with decryption!)

---

## 🎯 Quick Links Summary

| Feature | URL | Purpose |
|---------|-----|---------|
| **Test Lab** | `/test-encryption` | Create sample files & run tests |
| **Viewer** | `/view` | View files by CID |
| **Dashboard** | `/` | Upload & manage files |
| **Docs** | `/docs/VIEW_AND_TEST.md` | Full testing guide |

---

## 🎉 You're All Set!

**Start here:** http://localhost:3001/test-encryption

1. Create sample files
2. Watch them open automatically
3. Test downloading
4. Share links
5. Run encryption tests

**Questions?** Check `/docs/VIEW_AND_TEST.md` for detailed guide!

---

**Server Running:** ✅ Port 3001  
**Encryption:** ✅ AES-256-GCM  
**Status:** 🚀 Ready to test!
