# Kagaj for 'Kagaj ko Katha'

Nepali writers don't really have a proper place online. Facebook posts get buried, blogs die out, and there's nothing built just for Nepali literature. So I started building this.

Kagaj Ko Katha is a platform where people can write and read poems, stories, essays, whatever, in one place made for that. I'm also experimenting with blockchain stuff on top: when you publish something, its hash gets saved on Solana so there's proof you wrote it and it hasn't been changed since. Readers can also tip writers directly with SOL, no fees, no middleman.

Still a work in progress, learning as I build it.

## Features
- Write, edit, delete articles
- Login/signup with JWT + hashed passwords
- Profile page for each writer
- Content hash stored on Solana Devnet (proof of authorship)
- Direct tipping via Phantom/Solflare wallets
- Dark mode

## Stack
**Frontend:** Next.js, Tailwind, Framer Motion, `@solana/web3.js`, `@solana/wallet-adapter-react`

**Backend:** Django + Gunicorn, SQLite, `solana-py`/`solders`

**Infra:** Nginx, Certbot, PM2

## Running it

Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:3000`.

## To do
- Wallet login
- Verify badge on articles
- Tip history on profile
- Curated collections

---

Built for people who still care about writing, even if it's on a screen now.