#!/bin/bash
# Kagaj Ko Katha — VPS Setup Script
# Run this on a fresh Ubuntu/Debian VPS
# Usage: chmod +x deploy/setup.sh && ./deploy/setup.sh

set -e

echo "=== Kagaj Ko Katha — VPS Setup ==="

# 1. System packages
echo "[1/7] Installing system packages..."
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nginx certbot python3-certbot-nginx

# 2. Node.js (via nvm or system)
if ! command -v node &> /dev/null; then
    echo "[2/7] Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "[2/7] Node.js already installed: $(node -v)"
fi

# 3. PM2
if ! command -v pm2 &> /dev/null; then
    echo "[3/7] Installing PM2..."
    sudo npm install -g pm2
else
    echo "[3/7] PM2 already installed"
fi

# 4. Backend setup
echo "[4/7] Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# 5. Frontend setup
echo "[5/7] Building frontend..."
cd frontend
npm install
npm run build
cd ..

# 6. Nginx
echo "[6/7] Configuring Nginx..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/kagajkokatha
sudo ln -sf /etc/nginx/sites-available/kagajkokatha /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 7. Start with PM2
echo "[7/7] Starting services with PM2..."
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup | tail -1 | bash

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Update deploy/ecosystem.config.js with your SECRET_KEY"
echo "  2. Update FRONTEND_URL and BACKEND_URL in the PM2 config"
echo "  3. For SSL: sudo certbot --nginx -d kagajkokatha.com -d www.kagajkokatha.com"
echo "  4. Check status: pm2 status"
echo "  5. View logs: pm2 logs"
echo ""
echo "Auto-created user accounts (for imported authors):"
echo "  Username: author_name (lowercase, underscores)"
echo "  Password: Admin123@"
echo "  Email: author_name@kagajkokatha.com"
