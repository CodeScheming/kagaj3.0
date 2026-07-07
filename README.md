# Kagaj Publishing Platform 📝

Welcome to **Kagaj**—a modern, clean, and elegant traditional publishing platform. Built with a robust backend and a beautiful frontend, Kagaj empowers writers to share their thoughts through a seamless reading and writing experience.

## ✨ Features

- **Elegant Aesthetics**: A premium UI with dark mode, glassmorphism, clean typography, and smooth micro-animations.
- **User Authentication**: Secure signup and login flow powered by JWT and bcrypt hashing.
- **Rich User Profiles**: Every user gets a profile page showcasing all their published articles.
- **Full Article CRUD**: Write, Read, Edit, and Delete your articles effortlessly.
- **Protected Actions**: Users can only modify or delete articles they have authored.

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS (Global tokens, Glassmorphism utilities)
- **State Management**: React Context API

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: SQLite (managed via SQLAlchemy ORM)
- **Validation**: Pydantic
- **Security**: Passlib (Bcrypt) & python-jose (JWT)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)

### 1. Set up the Backend (FastAPI)

Navigate to the `backend` directory, create a virtual environment, install the dependencies, and start the server:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*The API will be available at `http://localhost:8000`. You can view the interactive documentation at `http://localhost:8000/docs`.*

### 2. Set up the Frontend (Next.js)

Open a new terminal window, navigate to the `frontend` directory, install the Node modules, and start the development server:

```bash
cd frontend
npm install
npm run dev
```
*The web app will be accessible at `http://localhost:3000`.*
.

