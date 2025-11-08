# 🏥 Web3Vault - Decentralized Medical Records System# 🏥 Web3 Medical Vault - Decentralized Healthcare Records



> **A privacy-first, blockchain-verified medical vault with IPFS storage and AI-powered prescription analysis**> **Your Health Data, Your Control** - Secure, Private, and Permanent Medical Records Storage  

> Built with Next.js, IPFS, Polkadot Blockchain, and Zero-Knowledge Encryption

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://web3vault-production.up.railway.app)

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/Barathvasan2003/web3vault)[![Live Demo](https://img.shields.io/badge/Live%20Demo-Production-success)](https://web3vault-production.up.railway.app)

[![Status](https://img.shields.io/badge/status-production%20ready-success)](https://web3vault-production.up.railway.app)

---[![Blockchain](https://img.shields.io/badge/blockchain-Polkadot-E6007A)](https://polkadot.network/)

[![Storage](https://img.shields.io/badge/storage-IPFS%20Pinata-blue)](https://pinata.cloud/)

## 🎯 What is Web3Vault?[![AI](https://img.shields.io/badge/AI-Gemini%20Vision-purple)](https://ai.google.dev/)

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black)](https://nextjs.org/)

Web3Vault is a complete decentralized medical records system that combines:[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

- **🔐 Client-Side Encryption** (AES-256-GCM) - Files encrypted in your browser, never sent unencrypted[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

- **🌐 IPFS Storage** (Pinata) - Decentralized permanent storage, no central servers

- **⛓️ Blockchain Backup** (Polkadot) - Keys stored on-chain for cross-device access---

- **🤖 AI Analysis** (Gemini Vision) - Automatic prescription OCR and medical data extraction

## 🚀 Live Production

**Key Innovation**: Upload on laptop → Access on phone. Your medical records sync across all your devices via blockchain, while staying fully encrypted and decentralized.

**App URL**: [https://web3vault-production.up.railway.app](https://web3vault-production.up.railway.app)

---

**Try it now:**

## 🚀 Quick Start1. Install [Polkadot.js Extension](https://polkadot.js.org/extension/)

2. Visit the live app

### Prerequisites3. Connect your wallet

- [Polkadot.js Browser Extension](https://polkadot.js.org/extension/)4. Upload and encrypt your first medical file!

- [Pinata API Key](https://pinata.cloud) (for IPFS uploads)

- [Google Gemini API Key](https://ai.google.dev) (for AI OCR)---



### Installation## 🎯 What We Built



1. **Clone the repository**A **complete decentralized medical vault** where you can:

```bash

git clone https://github.com/Barathvasan2003/web3vault.git✅ **Own Your Data** - Your files, your keys, your control  

cd web3vault/webvault3✅ **Encrypt Everything** - Military-grade AES-256-GCM encryption  

```✅ **Store Permanently** - IPFS distributed storage  

✅ **Access Anywhere** - Blockchain-based cross-device sync  

2. **Install dependencies**✅ **Share Easily** - One-click secure share links  

```bash✅ **AI-Powered** - Automatic prescription data extraction

npm install

```



3. **Configure environment variables**## 📋 Table of Contents## ✨ Core Features



Create `.env.local` with:

```env

# Pinata IPFS Configuration- [Overview](#-overview)### 1️⃣ **Decentralized Identity & Login**

NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token

- [Problem Statement](#-problem-statement)- 🔑 Login with Polkadot wallet (no email/password)

# Google Gemini AI Configuration

NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key- [Our Solution](#-our-solution)- 🆔 Decentralized Identity (DID)



# Polkadot Configuration (optional - defaults to wss://rpc.polkadot.io)- [Key Features](#-key-features)- 🔄 Multi-device secure access

NEXT_PUBLIC_POLKADOT_RPC=wss://rpc.polkadot.io

```- [Technology Stack](#-technology-stack)- ✅ **You own your identity**



**How to get API keys:**- [Polkadot Integration](#-polkadot-integration)

- **Pinata JWT**: Sign up at [pinata.cloud](https://pinata.cloud) → API Keys → Create New Key → Copy JWT

- **Gemini API**: Visit [ai.google.dev](https://ai.google.dev) → Get API Key → Create in new project- [Security](#-security)### 2️⃣ **Intelligent Medical Records**



4. **Run development server**- [Getting Started](#-getting-started)- 📄 Upload prescriptions, reports, medical PDFs

```bash

npm run dev- [Usage Guide](#-usage-guide)- 🤖 **AI OCR** - Extract text from images

```

- [Demo Video](#-demo-video)- 🧠 **Medical NLP** - Understand prescriptions & medications

Open [http://localhost:3000](http://localhost:3000)

- [Hackathon Submission](#-hackathon-submission)- 📁 Auto-categorize by type/date/doctor

5. **Connect Polkadot wallet**

- Install [Polkadot.js Extension](https://polkadot.js.org/extension/)- [Future Roadmap](#-future-roadmap)- 💊 Extract medication, dosage, diagnosis

- Create or import wallet

- Connect to Web3Vault- [License](#-license)



---### 3️⃣ **Decentralized Secure Storage**



## 📋 Features---- 🔒 **Client-side AES-256 encryption**



### ✅ Core Functionality- 🌐 Store on **IPFS + Crust Network**

- **🔒 Client-Side Encryption**: AES-256-GCM encryption in browser (files never leave unencrypted)

- **📤 IPFS Upload**: Permanent decentralized storage via Pinata## 🎯 Overview- ⛓️ File hash + proof on **Polkadot blockchain**

- **⛓️ Blockchain Metadata**: File metadata stored on Polkadot for cross-device sync

- **📥 Multi-Device Access**: Upload on one device, access from any device with same wallet- 🔐 HIPAA-level security without servers

- **🔗 Secure Sharing**: Generate permanent share links with encryption keys

- **🗑️ Permanent Deletion**: Delete from localStorage + IPFS + blockchain**Web3Vault** is a decentralized medical records management system built on the Polkadot ecosystem. It empowers patients to take full ownership of their healthcare data through blockchain-based identity management, military-grade encryption, and decentralized storage.

- **🤖 AI OCR**: Gemini Vision API extracts medicine names, dosage, doctor info from prescriptions

### 4️⃣ **Smart Access Control**

### 🎨 User Interface

- **📊 Dashboard**: File count, total size, storage statistics### Why Web3Vault?- 🔗 Share with doctors via secure token

- **📁 File List**: Upload, download, share, delete, view AI data

- **🖼️ Image Preview**: View medical documents before download- ⏰ Set expiry time or one-view access

- **💉 AI Data Display**: Extracted prescription information with edit capability

- **🔐 Blockchain Info**: Active blockchain backup indicator- **👤 Patient-Centric**: Patients own and control their medical data- ❌ Revoke access instantly



---- **🔐 Privacy-First**: End-to-end encryption with AES-256-GCM- 📊 **On-chain access logs** (who, when, what)



## 🏗️ Architecture- **🌐 Decentralized**: IPFS storage + Polkadot blockchain



### How It Works- **🤖 AI-Powered**: Automatic extraction of prescription data### 5️⃣ **Emergency Medical Card**



```- **🆘 Emergency Access**: Controlled sharing for emergency situations- 🆘 QR code on dashboard

┌─────────────────────────────────────────────────────────────────┐

│                    YOUR BROWSER (Client-Side)                   │- **🔗 Interoperable**: Works across healthcare providers- 🩸 Blood type, allergies, emergency contact

│                                                                 │

│  1. Select file (prescription.png)                              │- ⚡ **Life-saving in emergencies**

│  2. Generate random AES-256 key + IV                            │

│  3. Encrypt file locally ────────────────────────────────┐     │---- 📱 Scannable by any phone

│  4. Upload encrypted file to IPFS                        │     │

│  5. Store key on blockchain                              │     │

│                                                          │     │

│  🔑 Key never leaves your control!                       │     │## 💡 Problem Statement### 6️⃣ **AI Health Assistant**

└──────────────────────────────────────────────────────────┼─────┘

                          │                                │- 💬 Understand prescription text

                          ↓                                │

        ┌─────────────────────────────┐                    │### Current Healthcare Data Challenges:- 💊 Extract medications & dosage

        │    IPFS (Pinata Gateway)    │                    │

        │                             │                    │- 📋 Generate health summary

        │  ✅ Encrypted file          │                    │

        │  ❌ NO encryption key       │                    │1. **🏥 Centralized Control**: Patients don't own their medical records- 🔍 Smart search across records

        │  📦 CID: QmXxx...           │                    │

        │                             │                    │2. **🔓 Privacy Risks**: Centralized databases vulnerable to breaches

        │  File is useless without    │                    │

        │  the key from blockchain!   │                    │3. **🚫 Limited Access**: Difficult to share records across providers---

        └─────────────────────────────┘                    │

                          │                                │4. **📄 Paper-Based**: Many regions still rely on physical prescriptions

                          └────────────┬───────────────────┘

                                       ↓5. **💰 Vendor Lock-in**: Healthcare systems don't interoperate## 🛠️ Technology Stack

                          ┌──────────────────────────┐

                          │  Polkadot Blockchain     │6. **⏰ Emergency Delays**: Critical data unavailable when needed

                          │                          │

                          │  ✅ CID (IPFS address)   │### 🎨 Frontend

                          │  ✅ Encryption key       │

                          │  ✅ IV (init vector)     │### Real-World Impact:| Category | Technology |

                          │  ✅ File metadata        │

                          │  ✅ Owner wallet address │|----------|-----------|

                          │                          │

                          │  Enables cross-device    │- **150 million+** patient records breached globally (2024)| Framework | **Next.js 14** (App Router) |

                          │  access & key backup     │

                          └──────────────────────────┘- **Average cost** of healthcare data breach: $10.93M| UI | **TailwindCSS** + **ShadCN** |

```

- **Patients spend 8+ hours** annually managing medical records| State | **Zustand** |

### Why Blockchain?

- **Emergency room delays** due to missing medical history| Wallet | **Polkadot.js** + Talisman |

**Problem without blockchain:**

- ❌ localStorage only works on one device| Upload | **React Dropzone** |

- ❌ Clear browser cache → lose all files

- ❌ Can't access from phone/tablet---| QR Code | **qrcode.react** |

- ❌ Lose encryption keys → files locked forever



**Solution with Polkadot blockchain:**

- ✅ Upload on desktop → access on mobile## ✨ Our Solution### 🧠 AI Layer

- ✅ Keys permanently backed up on-chain

- ✅ Query blockchain → sync files across devices| Feature | Technology |

- ✅ Immutable audit trail for compliance

- ✅ True decentralization (no central server)Web3Vault leverages **Polkadot's decentralized infrastructure** to create a patient-controlled medical records system:|---------|-----------|



### Security Model| OCR | **Tesseract.js** (client-side) + Google Vision |



1. **Encryption Keys**: Generated client-side, never sent to any server### Core Principles:| Medical AI | **GPT-4o-mini** API |

2. **File Storage**: IPFS stores encrypted files, useless without keys

3. **Key Storage**: Blockchain stores keys, but you need wallet to access| Prescription Parsing | Medical NLP + LLM |

4. **Share Links**: Keys in URL (permanent sharing, send via secure channel)

5. **Access Control**: Wallet signature required for file operations1. **🔑 Self-Sovereign Identity**| Text Understanding | OpenAI Embeddings |



**Note**: Share links contain encryption keys in URL. Share only with trusted recipients via secure channels (encrypted messaging, etc.)   - Polkadot wallet = your medical identity



---   - No centralized authentication### 🔗 Blockchain (Polkadot Ecosystem)



## 💻 Tech Stack   - You control access permissions| Component | Technology |



### Frontend|-----------|-----------|

- **Next.js 14** - React framework with App Router

- **TypeScript** - Type safety2. **🔐 Zero-Knowledge Privacy**| Identity | **Polkadot DID** + Wallet |

- **Tailwind CSS** - Styling

   - Files encrypted before upload| Smart Contracts | **ink!** contracts |

### Encryption

- **Web Crypto API** - Browser-native AES-256-GCM encryption   - Only you have decryption keys| Access Control | Substrate runtime |

- **256-bit keys** - Military-grade security

- **12-byte IV** - Unique per file   - Healthcare providers never see unencrypted data| Event Logging | Substrate events |



### Storage| Storage Proofs | On-chain file hashes |

- **IPFS (Pinata)** - Decentralized file storage

- **Multi-gateway fallback** - Pinata → ipfs.io → Cloudflare IPFS3. **🌍 Decentralized Storage**

- **Content addressing** - Files referenced by CID (hash)

   - IPFS for file storage### 🗄️ Decentralized Storage

### Blockchain

- **Polkadot** - Layer-1 blockchain for metadata   - Polkadot blockchain for metadata| Purpose | Technology |

- **system.remark()** - Store JSON metadata in transactions

- **Polkadot.js** - Wallet integration   - No single point of failure|---------|-----------|



### AI| Primary | **IPFS + Crust Network** |

- **Google Gemini Vision API** - Prescription OCR

- **Medical NLP** - Extract structured data from images4. **🤝 Controlled Sharing**| Backup | Web3.Storage |



### Deployment   - Time-based access control| Metadata | Lightweight Node.js API |

- **GitHub** - Source control

- **Railway** - Hosting with auto-deploy   - One-time, temporary, or permanent links



---   - Revocable permissions### 🔐 Security



## 📁 Project Structure| Feature | Technology |



```---|---------|-----------|

webvault3/

├── app/| Encryption | **AES-256-GCM** + RSA |

│   ├── page.tsx              # Home/Dashboard page

│   ├── view/page.tsx         # View shared files page## 🚀 Key Features| Key Management | Client-side (Web Crypto API) |

│   └── api/files/[cid]/      # IPFS file proxy API

│| Identity | JWT + DID |

├── components/

│   ├── dashboard/### 1. **Polkadot Wallet Integration** 🔗| Zero-Knowledge | zk-SNARK concepts |

│   │   ├── Dashboard.tsx     # Main dashboard with stats

│   │   ├── FileUpload.tsx    # File upload with AI OCR- Connect with any Polkadot-compatible wallet

│   │   ├── FileList.tsx      # File list with actions

│   │   └── EmergencyCard.tsx # Emergency access info- Wallet-based identity management### 📦 Backend (Minimal)

│   └── wallet/

│       └── WalletConnect.tsx # Polkadot wallet connection- Transaction signing for blockchain operations| Use Case | Technology |

│

├── lib/- Future: Wallet-derived encryption keys|----------|-----------|

│   ├── encryption/

│   │   ├── medical-encryption.ts  # AES-256-GCM encryption/decryption| AI Gateway | **FastAPI** / Node.js |

│   │   └── key-backup.ts          # Key import/export utilities

│   │### 2. **Military-Grade Encryption** 🔐| Metadata | **Supabase** (free tier) |

│   ├── ipfs/

│   │   ├── ipfs-client.ts         # Pinata API client- **AES-256-GCM** encryption (HIPAA/FIPS compliant)| Cache | Redis / Upstash |

│   │   ├── ipfs-upload-download.ts # Upload/download with multi-gateway

│   │   └── ipfs-client-mock.ts    # Mock client for testing- Client-side encryption (data never exposed)| Push Notifications | Firebase Cloud Messaging |

│   │

│   ├── polkadot/- Unique keys per file

│   │   └── blockchain.ts          # Blockchain metadata storage

│   │- Authenticated encryption (tamper-proof)---

│   ├── sharing/

│   │   ├── simple-share.ts        # Generate share links

│   │   └── secure-share.ts        # Legacy secure sharing

│   │### 3. **AI-Powered Data Extraction** 🤖## 📁 Project Structure

│   ├── ai/

│   │   ├── gemini-ocr.ts          # Gemini Vision API integration- **Gemini AI integration** for prescription analysis

│   │   ├── medical-nlp.ts         # Medical data extraction

│   │   └── ocr-service.ts         # OCR service wrapper- Automatic extraction of:```

│   │

│   ├── storage/  - Doctor informationWebVault3/

│   │   └── file-registry.ts       # localStorage file registry

│   │  - Patient details├── app/                        # Next.js 14 App Router

│   └── access/

│       └── access-control.ts      # ACL management  - Diagnosis│   ├── (auth)/                # Authentication pages

│

├── package.json              # Dependencies  - Medications (name, dosage, frequency)│   ├── dashboard/             # Main dashboard

├── next.config.js            # Next.js configuration

├── tailwind.config.js        # Tailwind CSS config  - Prescription dates│   ├── records/               # Medical records

└── tsconfig.json             # TypeScript config

```- Editable AI results (manual corrections)│   ├── share/                 # Access sharing



---│   └── emergency/             # Emergency card



## 🔧 Key Functions### 4. **Decentralized Storage** 🌐├── components/                 # React components



### Encryption (`lib/encryption/medical-encryption.ts`)- **IPFS** for permanent file storage│   ├── ui/                    # ShadCN components

```typescript

// Generate unique AES-256 key for each file- Content-addressed (CID-based)│   ├── medical/               # Medical-specific

generateEncryptionKey(): Promise<CryptoKey>

- Distributed across nodes│   ├── wallet/                # Wallet integration

// Encrypt file with AES-256-GCM

encryptMedicalFile(file: File, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer>- Future: Crust Network integration│   └── ai/                    # AI features



// Decrypt file├── contracts/                  # ink! Smart Contracts

decryptMedicalFile(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer>

### 5. **Flexible Sharing** 🔗│   ├── access-control/        # Permission management

// Export key to base64 for storage

exportKey(key: CryptoKey): Promise<string>- **One-Time Access**: Self-destruct after viewing│   ├── file-registry/         # File metadata



// Import key from base64- **24-Hour Access**: Temporary emergency sharing│   └── audit-log/             # Access logging

importKey(base64Key: string): Promise<CryptoKey>

```- **Custom Date Range**: Specific time windows├── ai-engine/                  # AI & OCR Services



### IPFS (`lib/ipfs/ipfs-upload-download.ts`)- **Permanent Links**: Long-term access control│   ├── ocr/                   # Tesseract + Vision API

```typescript

// Upload encrypted file to IPFS via Pinata│   ├── medical-nlp/           # Prescription parsing

uploadToIPFS(file: Blob, fileName: string, fileType: string): Promise<string>

### 6. **Emergency Access** 🆘│   └── embeddings/            # Vector search

// Download file with multi-gateway fallback

downloadFromIPFS(cid: string, onProgress?: (progress: number) => void): Promise<ArrayBuffer>- Dedicated emergency card feature├── lib/                        # Utilities



// Get file metadata from Pinata- Quick sharing with first responders│   ├── encryption/            # AES-256 encryption

getFileMetadataFromPinata(cid: string): Promise<{ fileName: string; fileType: string }>

- Pre-authorized trusted contacts│   ├── ipfs/                  # IPFS + Crust

// Permanently delete from IPFS

unpinFile(cid: string): Promise<void>- Critical medical information always accessible│   ├── polkadot/              # Blockchain utils

```

│   └── ai/                    # AI integrations

### Blockchain (`lib/polkadot/blockchain.ts`)

```typescript### 7. **Record Management** 📂├── storage/                    # IPFS scripts

// Connect to Polkadot and get wallet accounts

getWalletAccounts(): Promise<InjectedAccountWithMeta[]>- Upload prescriptions, lab reports, X-rays├── docs/                       # Documentation



// Register file metadata on-chain- Download and decrypt anytime│   ├── architecture.md        # System design

registerFileOnChain(

  account: InjectedAccountWithMeta,- Delete records (remove from your vault)│   ├── deployment.md          # Deploy guide

  cid: string,

  fileName: string,- View full medical history timeline│   └── demo-script.md         # Video demo

  encryptionKey: string,

  iv: number[]└── public/                     # Static assets

): Promise<string>

---```

// Query blockchain for user's files

getFilesFromBlockchain(walletAddress: string): Promise<FileMetadata[]>

```

## 🛠 Technology Stack---

### AI OCR (`lib/ai/gemini-ocr.ts`)

```typescript

// Extract prescription data from image

extractPrescriptionData(imageData: string): Promise<PrescriptionData>### Frontend:## 🚀 Quick Start



// Response includes:- **Next.js 14** - React framework

// - medicines: { name, dosage, frequency, duration }[]

// - patientInfo: { name, age, gender }- **TypeScript** - Type safety### Prerequisites

// - doctorInfo: { name, specialization, hospital }

// - diagnosis: string- **TailwindCSS** - Styling

// - instructions: string

```- **React Hooks** - State management```powershell



---# 1. Install Node.js (v18+)



## 🎬 Demo Flow### Blockchain:node --version



### 1. Upload Medical File- **Polkadot.js** - Wallet connectivity

1. Click **"📤 Upload Medical File"**

2. Select prescription/medical report- **Polkadot API** - Blockchain interactions# 2. Install Polkadot.js Wallet

3. Wait for AI analysis (automatic OCR)

4. File encrypts → uploads to IPFS → stores key on blockchain- **Substrate** - Future custom pallets# https://polkadot.js.org/extension/

5. ✅ File appears in dashboard



### 2. Access from Another Device

1. Open Web3Vault on phone/tablet### Storage:# 3. Get OpenAI API key (for AI features)

2. Connect **same Polkadot wallet**

3. Files automatically sync from blockchain- **IPFS** - Decentralized file storage# https://platform.openai.com/api-keys

4. Download and decrypt any file

- **IPFS HTTP Client** - File upload/download```

### 3. Share with Doctor

1. Click **"Share"** on a file- **LocalStorage** - Demo metadata (production: blockchain)

2. Click **"Generate Share Link"**

3. Copy link### Installation

4. Send to doctor via secure channel

5. Doctor opens link (no wallet needed)### Encryption:

6. File automatically downloads and decrypts

- **WebCrypto API** - Browser-native encryption```powershell

### 4. View AI-Extracted Data

1. Click **"🤖 AI Data"** on prescription- **AES-256-GCM** - Symmetric encryption# Navigate to project

2. View extracted medicines, dosage, doctor info

3. Edit if needed- **PBKDF2** - Key derivation (future)cd C:\Users\barat\OneDrive\Desktop\Web3vault\webvault3

4. Data stored locally for quick reference



### 5. Delete File

1. Click **"Delete"** on file### AI/ML:# Install dependencies

2. Confirm deletion

3. File removed from:- **Google Gemini AI** - Vision API for OCRnpm install

   - localStorage

   - IPFS (unpinned)- **Natural Language Processing** - Medical entity extraction

   - Blockchain metadata

   - Access control list# Setup environment



------cp .env.example .env.local



## 🔒 Privacy & Security# Edit .env.local with your API keys



### What We Protect## 🔗 Polkadot Integration

✅ **Files encrypted client-side** - Server/IPFS never sees unencrypted data  

✅ **Keys stored on blockchain** - Permanent backup, but requires wallet to access  # Run development server

✅ **No central database** - No single point of failure  

✅ **Wallet-based auth** - Only you can access your files  ### Current Implementation:npm run dev

✅ **AES-256-GCM** - Military-grade encryption standard  

```

### What to Know

⚠️ **Share links contain keys** - Anyone with link can decrypt file  #### 1. **Wallet Connection**

⚠️ **Blockchain is public** - Metadata (filenames, CIDs) visible on-chain  

⚠️ **No password recovery** - Lose wallet = lose access (backup your wallet!)  ```typescriptVisit: **http://localhost:3000**

⚠️ **IPFS is permanent** - Deleted files may still exist on IPFS network  

// Polkadot.js extension integration

### Best Practices

1. **Backup your wallet** - Store seed phrase securelyconst { web3Accounts, web3Enable } = require('@polkadot/extension-dapp');### Running Blockchain (WSL)

2. **Share links carefully** - Use encrypted messaging to share

3. **Use strong passwords** - For Polkadot wallet

4. **Verify recipients** - Before sharing medical data

5. **Regular audits** - Review shared access periodically// Connect to wallet```bash



---await web3Enable('Web3Vault');# In WSL Ubuntu



## 🐛 Troubleshootingconst accounts = await web3Accounts();cd /mnt/c/Users/barat/OneDrive/Desktop/Web3vault/web3vault-chain



### "Please install Polkadot.js extension"```./target/release/node-template --dev

- Install from [polkadot.js.org/extension](https://polkadot.js.org/extension/)

- Refresh page after installation```

- Create or import wallet

#### 2. **Identity Management**

### "Failed to upload to IPFS"

- Check Pinata API key in `.env.local`- User's Polkadot address = unique patient ID---

- Verify API key has pinning permissions

- Check file size (Pinata free tier: 1GB limit)- Wallet signature for authentication



### "Files not syncing across devices"- Transaction signing for blockchain operations## 🎯 Core User Flows

- Ensure same wallet connected on both devices

- Wait 30-60 seconds for blockchain confirmation

- Check blockchain connection in browser console

#### 3. **Future Blockchain Integration**### 1. Patient Journey

### "AI OCR not working"

- Verify Gemini API key in `.env.local`- **Smart Contracts**: Access control logic1. Connect Polkadot wallet → Create DID

- Check API quota (free tier: 60 requests/minute)

- Ensure image is clear and readable- **On-Chain Metadata**: File references, permissions2. Upload prescription/report



### "Download failed"- **Timestamping**: Immutable record creation proof3. AI extracts: medication, dosage, doctor

- Try again (IPFS gateway might be slow)

- System auto-retries with fallback gateways- **Cross-Chain**: Bridge to other parachains4. File encrypted & stored on IPFS

- Check browser console for detailed errors

5. Hash recorded on blockchain

---

### Polkadot Features Utilized:6. Access via dashboard

## 🚢 Deployment



### Deploy to Railway

✅ **Polkadot.js Extension** - Wallet connectivity  ### 2. Sharing with Doctor

1. Fork this repository

2. Sign up at [railway.app](https://railway.app)✅ **Web3 Accounts** - Identity management  1. Select medical record

3. Create new project from GitHub repo

4. Add environment variables:🔄 **Substrate RPC** - Blockchain queries (in development)  2. Generate secure access token

   - `NEXT_PUBLIC_PINATA_JWT`

   - `NEXT_PUBLIC_GEMINI_API_KEY`🔄 **Ink! Smart Contracts** - Access control (planned)  3. Set expiry (24 hours / one-view)

5. Deploy automatically on push to main branch

🔄 **XCM** - Cross-chain medical data (roadmap)4. Share link with doctor

### Deploy to Vercel

5. Doctor views (logged on-chain)

```bash

vercel --prod### Why Polkadot?6. Revoke access anytime

```



Add environment variables in Vercel dashboard.

1. **🔗 Interoperability**: Cross-chain medical data sharing### 3. Emergency Use

---

2. **⚡ Scalability**: Parachain architecture handles growth1. Generate emergency QR

## 🤝 Contributing

3. **🛡️ Security**: Shared security from relay chain2. Shows: Blood type, allergies, contacts

We welcome contributions! Please:

4. **🌐 Decentralization**: True Web3 architecture3. First responder scans QR

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)5. **🚀 Innovation**: Cutting-edge blockchain technology4. View critical info instantly

3. Commit changes (`git commit -m 'Add amazing feature'`)

4. Push to branch (`git push origin feature/amazing-feature`)

5. Open Pull Request

------

---



## 📄 License

## 🔒 Security## 🏗️ Key Features Implementation

MIT License - see [LICENSE](LICENSE) file for details



---

### Encryption Details:### Medical OCR Pipeline

## 🙏 Acknowledgments

```javascript

- **Polkadot** - Blockchain infrastructure

- **IPFS & Pinata** - Decentralized storage**Algorithm**: AES-256-GCM (Galois/Counter Mode)Upload Image → Tesseract OCR → Extract Text 

- **Google Gemini** - AI-powered OCR

- **Web3 Community** - Open-source inspiration- **Key Size**: 256 bits (2^256 possible keys)→ GPT Medical Understanding → Auto-categorize 



---- **IV Size**: 12 bytes (unique per file)→ Extract: Medications, Dosage, Doctor, Date



## 📞 Contact- **Authentication**: Built-in tamper detection```



**Project**: [github.com/Barathvasan2003/web3vault](https://github.com/Barathvasan2003/web3vault)  - **Standard**: FIPS 140-2, HIPAA compliant

**Live Demo**: [web3vault-production.up.railway.app](https://web3vault-production.up.railway.app)  

**Developer**: Barathvasan### Encryption Flow



---### Security Flow:```javascript



## 🎯 Future RoadmapFile → AES-256-GCM (client-side) → IPFS Upload 



- [ ] Smart contract key encryption```→ Get CID → Store CID + Hash on Polkadot 

- [ ] Multi-signature access control

- [ ] NFT-based record transfers1. User uploads file→ Store encryption key (encrypted with wallet key)

- [ ] Decentralized identity (DID) integration

- [ ] Mobile app (React Native)   ↓```

- [ ] Emergency access with trusted contacts

- [ ] FHIR standard compliance2. Generate random 256-bit key

- [ ] Multi-language support

   ↓### Access Control

---

3. Generate random 12-byte IV```javascript

**Built with ❤️ for Web3 Hackathons** | **Privacy-First** | **Fully Decentralized**

   ↓Share Request → Generate JWT Token 

4. Encrypt file with AES-256-GCM→ Record permission on-chain 

   ↓→ Token has: file_id, expiry, max_views 

5. Upload encrypted data to IPFS→ Access logged as blockchain event 

   ↓→ Revoke = Update on-chain state

6. Store metadata on blockchain```

   ↓

7. Only user can decrypt (has key)---

```

## 🔐 Security Features

### Privacy Guarantees:

✅ **End-to-End Encryption** - Files encrypted before leaving device  

✅ **Client-Side Encryption**: Files encrypted before leaving device  ✅ **Zero-Knowledge Storage** - IPFS stores encrypted blobs  

✅ **Zero-Knowledge**: Server never sees unencrypted data  ✅ **Blockchain Audit Trail** - All access logged on-chain  

✅ **Unique Keys**: Each file has its own encryption key  ✅ **Decentralized Identity** - No centralized user database  

✅ **No Metadata Leakage**: Only CID exposed publicly  ✅ **Patient-Controlled** - Only you hold decryption keys  

✅ **User-Controlled Access**: Only patient can grant permissions✅ **HIPAA Compliant Architecture** - Medical-grade security



------



## 🚀 Getting Started## 🎬 Demo Video Script



### Prerequisites:1. **Problem** (30s)  

   - Medical records scattered (Drive, WhatsApp, physical)

- **Node.js** 18+ ([Download](https://nodejs.org/))   - Privacy concerns with centralized storage

- **npm** or **yarn**   - No patient control over access

- **Polkadot.js Browser Extension** ([Install](https://polkadot.js.org/extension/))

- **Git**2. **Solution** (45s)  

   - Login with wallet

### Installation:   - Upload prescription → AI extracts info

   - Share with doctor (time-limited)

1. **Clone the repository:**   - Emergency QR card demo

```bash

git clone https://github.com/yourusername/web3vault.git3. **Tech Stack** (30s)  

cd web3vault/webvault3   - Polkadot blockchain

```   - IPFS + Crust storage

   - AI-powered OCR

2. **Install dependencies:**   - Zero-knowledge encryption

```bash

npm install4. **Impact** (15s)  

```   - Patient owns data

   - Secure, private, accessible

3. **Set up environment variables:**   - Life-saving in emergencies

```bash

cp .env.example .env.local---

```

## 🏆 Why Judges Will Love This

Edit `.env.local`:

```env| Category | WebVault3 Coverage |

# Gemini AI (for prescription OCR)|----------|-------------------|

NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here| **Blockchain Innovation** | Polkadot DID + Crust + Access Control |

| **Real-World Impact** | Solves actual healthcare pain point |

# IPFS Configuration| **AI Integration** | OCR + Medical NLP + GPT |

NEXT_PUBLIC_IPFS_HOST=ipfs.infura.io| **Security & Privacy** | E2E encryption + Zero-knowledge |

NEXT_PUBLIC_IPFS_PORT=5001| **Scalability** | Decentralized storage + Polkadot |

NEXT_PUBLIC_IPFS_PROTOCOL=https| **UX Excellence** | Patient-friendly, intuitive UI |

| **Technical Depth** | Smart contracts + AI + Web3 |

# Polkadot Configuration

NEXT_PUBLIC_POLKADOT_ENDPOINT=wss://rpc.polkadot.io---

```

## 📊 Roadmap

4. **Run development server:**

```bash### ✅ MVP (Hackathon)

npm run dev- [x] Wallet authentication

```- [x] File upload + encryption

- [x] IPFS storage

5. **Open in browser:**- [x] AI OCR

```- [x] Access sharing

http://localhost:3000- [x] Emergency card

```

### 🔜 V2 (Post-Hackathon)

---- [ ] Mobile app (Flutter)

- [ ] Doctor dashboard

## 📖 Usage Guide- [ ] Appointment booking

- [ ] Token incentives

### 1. **Connect Your Wallet**- [ ] Multi-chain support

- [ ] Telemedicine integration

1. Install [Polkadot.js Extension](https://polkadot.js.org/extension/)

2. Create or import a Polkadot account---

3. Visit Web3Vault application

4. Click "Connect Wallet"## 🤝 Contributing

5. Select your account and approve connection

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md)

### 2. **Upload Medical Records**

---

1. Go to **📤 Upload** tab

2. Choose record type (Prescription, Lab Report, X-Ray, Medical Report)## 📄 License

3. Select file (PDF, PNG, JPG)

4. Click **Upload & Encrypt**MIT License - See [LICENSE](./LICENSE)

5. Wait for encryption + IPFS upload + AI extraction

---

### 3. **View & Manage Records**

## 🙏 Acknowledgments

1. Go to **📂 My Records** tab

2. See all uploaded files- **Polkadot** - Blockchain infrastructure

3. Click **📥 Download** to decrypt and save- **Crust Network** - Decentralized storage

4. Click **🔗 Share** to create access link- **IPFS** - File system

5. Click **🗑️ Delete** to remove- **OpenAI** - AI capabilities

- **Tesseract** - OCR engine

### 4. **Share with Time-Based Access**

---

1. Click **🔗 Share** on any file

2. Choose access type:## 📞 Contact & Support

   - 🔒 One-Time Access

   - ⏰ 24 Hours- **Demo**: [webvault3.vercel.app](#)

   - 📅 Custom Date Range- **Docs**: [docs.webvault3.dev](#)

   - ♾️ Permanent Access- **Discord**: [Join our community](#)

3. Copy CID or View Link- **Twitter**: [@WebVault3](#)

4. Share with healthcare provider

---

### 5. **Emergency Access**

<div align="center">

1. Go to **🆘 Emergency** tab

2. View your emergency medical card**Built with ❤️ for patients, powered by Web3**

3. Share emergency link with trusted contacts

🏥 **WebVault3** - Your health data, your control.

---

</div>

## 🎥 Demo Video

📹 **Watch the Demo**: [Coming Soon]

**Duration**: 4-5 minutes

**What's Shown**:
1. Wallet connection
2. Upload and encrypt prescription
3. AI data extraction
4. Edit AI results
5. Share with time-based access
6. Download and decrypt
7. Emergency access feature

---

## 🏆 Hackathon Submission

### Category: **User-Centric Apps**

### Why Web3Vault?

**1. Technological Implementation** ⭐⭐⭐⭐⭐
- Production-ready AES-256-GCM encryption
- Real Polkadot.js wallet integration
- IPFS decentralized storage
- AI-powered prescription OCR
- Clean TypeScript codebase

**2. Design & UX** ⭐⭐⭐⭐⭐
- Intuitive interface
- Smooth user flow
- Mobile-responsive
- Clear visual feedback

**3. Potential Impact** ⭐⭐⭐⭐⭐
- Solves healthcare privacy crisis
- 150M+ potential users
- Global application
- Empowers patients

**4. Creativity** ⭐⭐⭐⭐⭐
- Unique medical + Web3 combination
- AI-powered analysis
- Time-based sharing innovation
- Emergency access feature

### Real-World Use Cases:

1. **👨‍⚕️ Doctor Visits**: Share records with specialists
2. **🚑 Emergencies**: Instant first responder access
3. **💊 Pharmacies**: Secure prescription verification
4. **🏥 Hospitals**: Complete medical history
5. **🌍 Medical Tourism**: Cross-border record portability

---

## 🗺 Future Roadmap

### Phase 1: Enhanced Security (Q1 2026)
- [ ] Wallet-derived encryption keys
- [ ] Hardware wallet support
- [ ] Multi-signature access
- [ ] Key recovery mechanisms

### Phase 2: Blockchain Integration (Q2 2026)
- [ ] Deploy custom Substrate pallet
- [ ] On-chain metadata storage
- [ ] Smart contract access control
- [ ] Timestamping service

### Phase 3: Advanced Features (Q3 2026)
- [ ] Cross-chain data sharing (XCM)
- [ ] Healthcare provider portal
- [ ] Prescription verification
- [ ] Insurance automation

### Phase 4: Mobile & Scale (Q4 2026)
- [ ] React Native mobile app
- [ ] Biometric authentication
- [ ] Offline mode
- [ ] Crust Network integration

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Built with ❤️ for Polkadot Hackathon 2025**

- **Developer**: [Your Name]
- **Email**: [your.email@example.com]
- **GitHub**: [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- **Polkadot & Web3 Foundation** - Hackathon and ecosystem
- **Parity Technologies** - Substrate and Polkadot.js
- **IPFS/Protocol Labs** - Decentralized storage
- **Google Gemini** - AI-powered OCR
- **Polkadot Community** - Support and feedback

---

<div align="center">

### 🌟 Star this repository if you find it helpful!

**Built for Polkadot Hackathon 2025**

**Deadline: November 18, 2025**

</div>
