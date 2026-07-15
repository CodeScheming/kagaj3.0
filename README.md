<div align="center">
  <h1>Kagaj 3.0 📝</h1>
  <p><strong>A Home for Nepali Literature — Powered by Solana</strong></p>
  <a href="https://blogs.kagajkokatha.com">View Live Demo</a>
</div>

<br />

## 📖 The Vision
Kagaj 3.0(test by Kagaj ko katha) is a transition of a traditional literary platform into a Web3-empowered ecosystem. Our mission is to provide a beautiful, seamless reading and writing experience while solving the most critical issue in digital literature: **plagiarism and proof of authorship.**

By integrating Solana, Kagaj 3.0 acts as a decentralized notary. It allows writers and poets to cryptographically sign their work, generating an immutable, timestamped proof of authorship on the blockchain. 

*Submitted for the Superteam Nepal Hackathon.*

---

## 🚀 The Problem & Solution

### The Problem
Writers in Nepal and globally often publish their poems, stories, and essays online, only to have them copied without credit. Currently, there is no standardized, verifiable, and open way to prove original authorship of a digital literary piece once it enters the internet.

### The Solution
Kagaj 3.0 bridges this gap using Solana. When an author publishes or updates a piece of literature on our platform:
1. They connect their **Phantom Wallet**.
2. A unique **SHA-256 hash** of their article's title and content is generated.
3. This hash, alongside their wallet address and a timestamp, is published to the Solana blockchain via a Memo instruction.
4. The resulting **Transaction Signature** serves as permanent, verifiable civic data proving their ownership of that specific text at that specific time.

---

## 🛠 Tech Stack

**Frontend:**
- Next.js 16 (App Router) & React 19
- Solana Wallet Adapter (`@solana/wallet-adapter-react`)
- Vanilla CSS with modern Glassmorphism UI

**Backend:**
- Python FastAPI
- SQLite (SQLAlchemy ORM)
- `solana-py` & `solders` (For backend Solana interactions and verifications)
- Automated API Ingestion scripts for legacy content migration

**Deployment:**
- Ubuntu VPS, Nginx, PM2

---

## ✨ Key Features

- **Web3 Authorship Verification:** Instantly sign and verify articles on the Solana Testnet.
- **Legacy Author Migration:** A custom backend script that pulled existing literature from the Kagaj 2.0 API, automatically generated claimable Web3 accounts for legacy authors, and seeded the database.
- **Dynamic Content Types:** Dedicated badges and styling for Poems, Essays, Reviews, and Articles.
- **Rich Text Editor:** A seamless writing experience built right into the platform.
- **Blazing Fast UI:** SSR-optimized Next.js frontend with debounced search and responsive design.

---

## 💻 Running it Locally

### 1. Clone the repository
```bash
git clone https://github.com/CodeScheming/kagaj3.0.git
cd kagaj3.0
```

### 2. Start the Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Note: The backend will automatically create the SQLite database and run the legacy article import script on startup.*

### 3. Start the Frontend (Next.js)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The platform will be live at `http://localhost:3000`.

---

## 🔮 Future Roadmap
- **Tokenized Literature (NFTs):** Allow authors to mint their premium articles or poems as cNFTs using State Compression.
- **Tipping System:** Integrate Solana Pay so readers can directly tip their favorite Nepali authors with USDC or SOL.
- **Open Governance (Janamat):** Allow verified authors to vote on community literary awards and platform curation. 

---
*Built with ❤️ in Nepal.*
