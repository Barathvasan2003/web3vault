# 🔐 Secure File Sharing Guide

## Overview
Web3Vault now supports secure file sharing with **wallet-based access control** and **encrypted share links**.

---

## 🎯 Key Features

### 1. **Shared With Me Tab**
- New tab in Dashboard (after Emergency tab)
- Shows all files that others have shared with you
- Only displays files where you've been granted explicit access
- Icon: 👥 Group of people

### 2. **Secure Share Links**
Share links now include:
- ✅ File CID (IPFS identifier)
- ✅ Encryption Key (AES-256-GCM)
- ✅ Initialization Vector (IV)
- ✅ Access Control validation

**Example Link:**
```
https://yoursite.com/view?cid=Qm...&key=eyJhbG...&iv=[...]
```

### 3. **Access Control**
- Share files with specific Polkadot wallet addresses
- Choose access duration:
  - 🔒 **One-Time**: 1 hour access
  - ⏰ **24 Hours**: Full day access
  - 📅 **Custom**: Choose date range
  - ♾️ **Permanent**: No expiration

---

## 📖 How to Share Files

### Step 1: Upload a File
1. Go to **Upload** tab
2. Upload your medical record
3. File is encrypted with AES-256-GCM

### Step 2: Share with Wallet
1. Go to **My Records** tab
2. Click **Share** button on a file
3. In the modal:
   - Choose access duration (One-Time, 24 Hours, Custom, or Permanent)
   - Enter recipient's Polkadot wallet address
   - Click **✅ Grant Access**

### Step 3: Send Share Link
1. After granting access, click **🔗 Copy Link**
2. Send the link to the recipient
3. They can access it with their Polkadot wallet

---

## 🔒 Security Model

### For File Owner:
1. **Upload** → File encrypted with random AES key
2. **Grant Access** → Recipient's wallet added to ACL
3. **Share Link** → Link includes encrypted data + key
4. **Revoke** → Use "View Access List" to manage access

### For Recipient:
1. **Receive Link** → Click the secure share link
2. **Connect Wallet** → Sign in with Polkadot wallet
3. **Verify Access** → System checks ACL for permissions
4. **Decrypt** → If authorized, decrypt with provided key
5. **View/Download** → Access the medical record

---

## 🛡️ Access Control List (ACL)

Each file has an ACL stored in localStorage:
```typescript
{
  cid: "Qm...",                    // File identifier
  owner: "5GrwvaE...",            // Owner's wallet
  accessList: [
    {
      walletAddress: "5D5Php...",  // Recipient's wallet
      accessType: "temporary",      // or "permanent"
      expiresAt: 1730937600000,    // Expiry timestamp
      grantedAt: 1730851200000,    // When granted
      grantedBy: "5GrwvaE..."      // Who granted
    }
  ]
}
```

---

## 🎨 UI Components

### Tabs Layout:
```
┌─────────────────────────────────────────┐
│  Upload  │  My Records  │  Emergency  │  Shared With Me  │
└─────────────────────────────────────────┘
```

### Share Modal Sections:
1. **Share Type Selection** (One-Time, 24h, Custom, Permanent)
2. **IPFS CID** (Copy button)
3. **Direct View Link** (Includes encryption key)
4. **Grant Access to Wallet** (Input + Grant button)
5. **View Access List** (See who has access)

---

## 📱 Usage Examples

### Example 1: Share Lab Results with Doctor (24 Hours)
```typescript
1. Upload: lab_results.pdf
2. Select: "24 Hours" access
3. Enter: Doctor's wallet (5D5PhpW...)
4. Grant Access
5. Copy & send link
6. Doctor signs in → Can view for 24h
```

### Example 2: Permanent Family Access
```typescript
1. Upload: medical_history.pdf
2. Select: "Permanent" access
3. Enter: Family member's wallet
4. Grant Access
5. They can always access via "Shared With Me" tab
```

### Example 3: Temporary Emergency Access
```typescript
1. Upload: emergency_contact.pdf
2. Select: "Custom" (1 week)
3. Enter: Healthcare provider wallet
4. Grant Access
5. Access expires after 7 days
```

---

## 🔄 Workflow Diagram

```
┌─────────────┐
│  Owner      │
│  Uploads    │
└──────┬──────┘
       │
       v
┌──────────────┐
│  Encrypt     │
│  with AES    │
└──────┬───────┘
       │
       v
┌──────────────┐
│  Store IPFS  │
│  + LocalDB   │
└──────┬───────┘
       │
       v
┌──────────────┐     ┌────────────────┐
│  Create ACL  │────>│  Grant Access  │
│  (Owner)     │     │  (Recipient)   │
└──────────────┘     └────────┬───────┘
                              │
                              v
                     ┌─────────────────┐
                     │  Generate Link  │
                     │  (CID+Key+IV)   │
                     └────────┬────────┘
                              │
                              v
                     ┌─────────────────┐
                     │  Recipient      │
                     │  Accesses Link  │
                     └────────┬────────┘
                              │
                              v
                     ┌─────────────────┐
                     │  Verify Wallet  │
                     │  + Check ACL    │
                     └────────┬────────┘
                              │
                              v
                     ┌─────────────────┐
                     │  Decrypt File   │
                     │  View/Download  │
                     └─────────────────┘
```

---

## ⚠️ Security Warnings

### ✅ DO:
- Share links only with trusted recipients
- Use temporary access when possible
- Revoke access when no longer needed
- Verify recipient wallet address before granting

### ❌ DON'T:
- Post share links publicly (contains encryption key!)
- Share your wallet private keys
- Grant permanent access to untrusted wallets
- Reuse share links after revoking access

---

## 🧪 Testing Share Feature

### Test 1: Share with Another Wallet
1. Create two Polkadot accounts (Account A, Account B)
2. Sign in with Account A
3. Upload a file
4. Grant access to Account B's wallet address
5. Copy the share link
6. Sign out and sign in with Account B
7. Go to "Shared With Me" tab
8. OR paste the share link → Should see the file

### Test 2: Access Expiration
1. Share file with "One-Time" (1 hour)
2. Wait 1 hour
3. Recipient tries to access → Should be denied
4. Check console: "Access expired"

### Test 3: Revoke Access
1. Grant access to wallet
2. Click "View Access List"
3. Verify wallet appears
4. (Future) Click revoke
5. Recipient tries to access → Denied

---

## 🚀 Future Enhancements

- [ ] QR code for share links
- [ ] Email notification when file is shared
- [ ] Access analytics (who viewed when)
- [ ] Bulk share to multiple wallets
- [ ] Share to temporary guest wallets
- [ ] Integration with healthcare provider directories

---

## 🔧 Technical Details

**Encryption:**
- Algorithm: AES-256-GCM
- Key Length: 256 bits
- IV Length: 96 bits (12 bytes)

**Storage:**
- Files: localStorage (browser)
- ACLs: localStorage (per CID)
- Backup: Encrypted IPFS (optional)

**Authentication:**
- Method: Polkadot wallet signature
- Session: 24 hours
- Challenge-response protocol

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify wallet is connected
3. Ensure recipient wallet address is correct
4. Try clearing localStorage and re-uploading
5. Check ACL exists: `localStorage.getItem('acl_YOUR_CID')`

---

**Version:** 1.0.0  
**Last Updated:** November 6, 2025  
**Status:** ✅ Production Ready
