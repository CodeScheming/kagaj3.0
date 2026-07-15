# Kagaj 3.0

A home for Nepali literature, now with blockchain-based proof of authorship. Built by Kagaj ko Katha.

Live demo: https://blogs.kagajkokatha.com

Built for the Superteam Nepal Hackathon.

## Why

Writers post poems, stories, essays online and then someone copies it with no credit. There's no easy way to prove you wrote something first.

Kagaj 3.0 fixes this using Solana. When you publish or edit a piece:

1. Connect your Phantom wallet
2. We hash your title + content (SHA-256)
3. That hash, your wallet address, and a timestamp get written to Solana via a Memo instruction
4. The transaction signature is your proof — timestamped, immutable, verifiable by anyone

Currently running on testnet.

## Stack

**Frontend**
- Next.js 16 (App Router), React 19
- `@solana/wallet-adapter-react` for wallet connection
- Plain CSS, glassmorphism-ish look

**Backend**
- FastAPI + SQLite (SQLAlchemy)
- `solana-py` / `solders` for chain interaction
- A migration script that pulls old articles from the Kagaj 2.0 API

**Deploy**
- Ubuntu VPS, Nginx, PM2

## Features

- Sign and verify articles on Solana testnet
- Legacy content migration — old authors get auto-generated claimable Web3 accounts, old articles get seeded into the new DB
- Poems/essays/reviews/articles each get their own tags and styling
- Built-in rich text editor
- Debounced search, SSR, reasonably fast

## Running locally

Clone it:
```bash
git clone https://github.com/CodeScheming/kagaj3.0.git
cd kagaj3.0
```

Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
This spins up SQLite and runs the legacy import script on first start.

Frontend (new terminal):
```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`.

---

Built in Nepal.
