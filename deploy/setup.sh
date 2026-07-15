#!/bin/bash
# Kagaj Ko Katha — VPS Deployment Script
# For blogs.kagajkokatha.com on Ubuntu VPS
# Run from repo root: chmod +x deploy/setup.sh && ./deploy/setup.sh

set -e

APP_DIR="/home/deployment/kagaj3.0/kagaj3.0"

echo "=== Kagaj Ko Katha — Deploying to blogs.kagajkokatha.com ==="

# 1. System packages
echo "[1/7] Checking system packages..."
apt update -qq
apt install -y -qq python3 python3-venv python3-pip certbot python3-certbot-nginx > /dev/null 2>&1
echo "       Done."

# 2. Node.js
if ! command -v node &> /dev/null; then
    echo "[2/7] Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt install -y -qq nodejs > /dev/null 2>&1
else
    echo "[2/7] Node.js already installed: $(node -v)"
fi

# 3. PM2
if ! command -v pm2 &> /dev/null; then
    echo "[3/7] Installing PM2..."
    npm install -g pm2 > /dev/null 2>&1
else
    echo "[3/7] PM2 already installed"
fi

# 4. Backend setup
echo "[4/7] Setting up backend..."
cd "$APP_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install -q -r requirements.txt
deactivate
cd "$APP_DIR"
echo "       Done."

# 5. Frontend setup
echo "[5/7] Building frontend..."
cd "$APP_DIR/frontend"

# Create .env.local for production build
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://blogs.kagajkokatha.com/api
EOF

npm install --silent 2>/dev/null
npm run build
cd "$APP_DIR"
echo "       Done."

# 6. Nginx
echo "[6/7] Configuring Nginx for blogs.kagajkokatha.com..."
cp deploy/nginx.conf /etc/nginx/sites-available/blogs-kagajkokatha
ln -sf /etc/nginx/sites-available/blogs-kagajkokatha /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo "       Done."

# 7. Stop existing kagaj processes if any, then start
echo "[7/7] Starting services with PM2..."
pm2 delete kagaj-frontend 2>/dev/null || true
pm2 delete kagaj-backend 2>/dev/null || true
pm2 start "$APP_DIR/deploy/ecosystem.config.js"
pm2 save
pm2 startup systemd 2>/dev/null || true

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Site: http://blogs.kagajkokatha.com (HTTP for now)"
echo ""
echo "For SSL: certbot --nginx -d blogs.kagajkokatha.com"
echo "Check status: pm2 status"
echo "View logs: pm2 logs"
echo ""
echo "Auto-created author accounts:"
echo "  Username: author_name (lowercase, underscores)"
echo "  Password: Admin123@"
