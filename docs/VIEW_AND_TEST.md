# 🔗 View & Test Encrypted Files

## 📍 Quick Access URLs

### 🧪 Test Encryption Lab
**URL:** `http://localhost:3000/test-encryption`

**Features:**
- 📄 Create sample encrypted text files (medical prescriptions)
- 🖼️ Create sample encrypted image files (prescription images)
- 🔬 Run comprehensive encryption tests
- ✅ Verify encryption/decryption integrity
- 📊 View performance metrics

**How to Use:**
1. Open the test page
2. Click "Create Sample Text File" or "Create Sample Image File"
3. A new encrypted file will be created with a random CID
4. The viewer page will automatically open with your new file
5. Test downloading and viewing the encrypted content

---

### 👁️ File Viewer
**URL:** `http://localhost:3000/view`

**Features:**
- 🔍 View files by CID (Content Identifier)
- 🔓 Decrypt and preview encrypted files
- ⬇️ Download decrypted files
- 📊 View file metadata and AI-extracted data
- 🔐 See encryption status

**How to Use:**
1. Get a CID from your uploaded files or test files
2. Enter the CID in the viewer
3. Select access type (Permanent, One-Time, 24 Hours, Custom)
4. Click "Load File" to decrypt and view
5. Click "Download & Decrypt File" to save locally

---

## 🎯 Testing Workflow

### Method 1: Using Test Lab (Recommended)

```bash
# 1. Open test lab
http://localhost:3000/test-encryption

# 2. Create sample files
- Click "📄 Create Sample Text File"
  → Generates encrypted prescription text
  → Opens viewer automatically

- Click "🖼️ Create Sample Image File"
  → Generates encrypted prescription image
  → Opens viewer automatically

# 3. Run encryption tests
- Click "▶️ Run All Tests"
  → Tests text encryption
  → Tests image encryption
  → Tests medical data encryption
  → Shows results with metrics
```

### Method 2: Using Your Uploaded Files

```bash
# 1. Upload a file in dashboard
http://localhost:3000

# 2. Click "Share" on any file

# 3. Copy the CID or view link

# 4. Paste in viewer or share with others
```

---

## 📋 Example Test Data

### Sample CID Format
```
Qmyxopf3etlmb7olg9jg44ceiz4mz12476gfez6qj9s625
```

### Sample View Link
```
http://localhost:3000/view?cid=Qmyxopf3etlmb7olg9jg44ceiz4mz12476gfez6qj9s625&access=permanent
```

### Sample Share Options
- **Permanent:** `access=permanent`
- **One-Time:** `access=one-time`
- **24 Hours:** `access=24-hours`
- **Custom:** `access=custom`

---

## 🔐 Encryption Test Results

### What Gets Tested:

#### 1. Text File Encryption ✅
- **Input:** Medical prescription text (UTF-8)
- **Encryption:** AES-256-GCM
- **Output:** Encrypted ArrayBuffer
- **Verification:** Decrypt → Compare with original
- **Metrics:** File size, encryption time, key length

#### 2. Image File Encryption ✅
- **Input:** PNG prescription image (binary)
- **Encryption:** AES-256-GCM
- **Output:** Encrypted ArrayBuffer
- **Verification:** Decrypt → Display image
- **Metrics:** File size, encryption time, preview URL

#### 3. Medical Data Encryption ✅
- **Input:** Structured JSON medical record
- **Encryption:** AES-256-GCM with metadata
- **Output:** Encrypted package with metadata
- **Verification:** Decrypt → Parse JSON → Validate fields
- **Metrics:** Data integrity, key export/import

---

## 🚀 How It Works

### Encryption Flow:
```
1. Original File (text/image/data)
   ↓
2. Generate 256-bit Random Key
   ↓
3. Generate 12-byte Random IV
   ↓
4. Encrypt with AES-256-GCM
   ↓
5. Package: [metadata][encrypted data]
   ↓
6. Store encrypted data + key + IV
   ↓
7. Generate unique CID
```

### Decryption Flow:
```
1. Fetch by CID
   ↓
2. Retrieve encrypted data
   ↓
3. Retrieve encryption key + IV
   ↓
4. Decrypt with AES-256-GCM
   ↓
5. Unpack metadata
   ↓
6. Extract original file
   ↓
7. Display/Download
```

---

## 📊 File Storage Structure

### localStorage Keys:
```javascript
// User files metadata
files_<wallet_address>: [
  {
    cid: "Qm...",
    fileName: "prescription.pdf",
    fileType: "application/pdf",
    fileSize: 102400,
    encryptionKey: "base64_encoded_key...",
    iv: [12, 34, 56, ...],
    uploadedAt: "2025-11-06T10:30:00Z",
    recordType: "Prescription",
    aiData: { ... }
  }
]

// Encrypted file data
encrypted_<cid>: "base64_encoded_encrypted_data..."
```

---

## 🧪 Browser Console Testing

### Test Encryption Manually:
```javascript
// 1. Import encryption library
const encryptionLib = await import('/lib/encryption/medical-encryption');

// 2. Create test data
const testText = "Secret medical data";
const encoder = new TextEncoder();
const data = encoder.encode(testText).buffer;

// 3. Generate key
const key = await encryptionLib.generateEncryptionKey();

// 4. Encrypt
const { encryptedData, iv } = await encryptionLib.encryptMedicalFile(
    data,
    { fileName: 'test.txt', fileType: 'text/plain', recordType: 'Test' },
    key
);

console.log('Encrypted:', encryptedData);

// 5. Decrypt
const { fileData } = await encryptionLib.decryptMedicalFile(encryptedData, key, iv);
const decrypted = new TextDecoder().decode(fileData);

console.log('Decrypted:', decrypted);
console.log('Match:', decrypted === testText); // Should be true
```

---

## 🔍 Verification Steps

### ✅ Test Checklist:

- [ ] **Text file encryption works**
  - Create sample text file
  - View in viewer
  - Download and verify content

- [ ] **Image file encryption works**
  - Create sample image file
  - View preview in viewer
  - Download and verify image

- [ ] **Share links work**
  - Generate share link from dashboard
  - Copy view link
  - Open in new tab/incognito
  - Verify file loads and decrypts

- [ ] **Different access types work**
  - Test Permanent access
  - Test One-Time access
  - Test 24 Hours access
  - Test Custom date range

- [ ] **Download functionality works**
  - Click download button
  - Verify file decrypts correctly
  - Open downloaded file

- [ ] **AI data displays correctly**
  - Upload file with AI data
  - Share and view
  - Verify AI-extracted info shows

---

## 🐛 Troubleshooting

### Issue: "File not found"
**Solution:** File CID doesn't exist in localStorage. Create a sample file first using the test lab.

### Issue: "Decryption failed"
**Solution:** 
- Check if encryption key is stored correctly
- Verify IV is present
- Ensure file wasn't corrupted

### Issue: "Preview not available"
**Solution:** Encrypted data not found. This happens if browser data was cleared. The CID exists but encrypted content is missing.

### Issue: "Download doesn't work"
**Solution:**
- Check browser console for errors
- Verify file type is supported
- Try with sample files from test lab

---

## 📱 Share Links Examples

### Permanent Access Link:
```
http://localhost:3000/view?cid=Qmyxopf3etlmb7olg9jg44ceiz4mz12476gfez6qj9s625&access=permanent
```
✅ Never expires
✅ Unlimited views
✅ Best for long-term storage

### One-Time Access Link:
```
http://localhost:3000/view?cid=Qmyxopf3etlmb7olg9jg44ceiz4mz12476gfez6qj9s625&access=one-time
```
✅ Expires after first view
✅ Maximum security
✅ Best for sensitive sharing

### 24-Hour Access Link:
```
http://localhost:3000/view?cid=Qmyxopf3etlmb7olg9jg44ceiz4mz12476gfez6qj9s625&access=24-hours
```
✅ Expires in 24 hours
✅ Multiple views allowed
✅ Best for temporary sharing

### Custom Date Range Link:
```
http://localhost:3000/view?cid=Qmyxopf3etlmb7olg9jg44ceiz4mz12476gfez6qj9s625&access=custom
```
✅ Custom start/end dates
✅ Flexible duration
✅ Best for scheduled access

---

## 🎉 Success Indicators

### When Everything Works:
1. ✅ Test lab creates sample files without errors
2. ✅ Viewer loads files by CID
3. ✅ Images display in preview
4. ✅ Text shows correctly
5. ✅ Download saves decrypted files
6. ✅ AI data displays when available
7. ✅ Share links can be copied and opened
8. ✅ Encryption tests all pass (green checkmarks)
9. ✅ File metadata shows correctly
10. ✅ No console errors

---

## 🔐 Security Notes

### What's Encrypted:
✅ File contents (100% encrypted with AES-256-GCM)
✅ Medical data inside files
✅ Images and documents
✅ All binary data

### What's NOT Encrypted (Metadata):
⚠️ File name (stored as metadata)
⚠️ File type (needed for preview)
⚠️ File size (for display)
⚠️ Upload date (for sorting)
⚠️ CID (public IPFS identifier)

### Key Storage:
🔐 Encryption keys stored in browser localStorage
🔐 Keys tied to wallet address
🔐 256-bit AES-GCM keys (military-grade)
⚠️ Demo mode - production should use wallet-derived keys

---

## 📖 Related Documentation

- **Encryption Guide:** `/docs/ENCRYPTION_EXPLAINED.md`
- **Setup Guide:** `/docs/SETUP.md`
- **Quick Start:** `/QUICKSTART.md`
- **Project Summary:** `/PROJECT_SUMMARY.md`

---

## 🆘 Quick Help

### I want to...

**Create a test file:**
→ Go to `/test-encryption` → Click create button

**View a shared file:**
→ Go to `/view` → Enter CID → Load file

**Test encryption:**
→ Go to `/test-encryption` → Run all tests

**Share a file:**
→ Dashboard → Upload file → Click Share → Copy link

**Download a file:**
→ Viewer → Load file → Click Download button

---

## 🎯 Next Steps

1. **Try the test lab** - Create sample files
2. **Test the viewer** - Load files by CID  
3. **Run encryption tests** - Verify everything works
4. **Upload real files** - From the dashboard
5. **Share links** - Test with friends/devices
6. **Check documentation** - Read `ENCRYPTION_EXPLAINED.md`

---

**Ready to test?** 🚀

Open: `http://localhost:3000/test-encryption`
