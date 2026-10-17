#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="${REPO_DIR:-/home/ec2-user/the-labyrinth-lab}"
REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-master}"
PORT="${PORT:-4000}"
APP_SERVICE_NAME="${APP_SERVICE_NAME:-the-labyrinth-lab}"
NGINX_SITE_CONF="${NGINX_SITE_CONF:-/etc/nginx/conf.d/the-ll.conf}"
NGINX_DEFAULT_CONF="${NGINX_DEFAULT_CONF:-/etc/nginx/conf.d/default.conf}"

if [[ "$(id -u)" -ne 0 ]]; then
  SUDO="sudo"
else
  SUDO=""
fi

log() {
  echo
  echo "=== $* ==="
}

require_file() {
  if [[ ! -f "$1" ]]; then
    echo "Missing required file: $1" >&2
    exit 1
  fi
}

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "Repository not found at $REPO_DIR" >&2
  exit 1
fi

require_file "$REPO_DIR/.env"

action() {
  if [[ -n "$SUDO" ]]; then
    $SUDO "$@"
  else
    "$@"
  fi
}

cd "$REPO_DIR"

log "Pulling latest code"
git fetch --all --tags
git checkout "$BRANCH"
git pull --ff-only "$REMOTE" "$BRANCH"

log "Ensuring npm is current"
CURRENT_NPM="$(npm --version 2>/dev/null || echo "0.0.0")"
LATEST_NPM="$(npm view npm version 2>/dev/null || echo "$CURRENT_NPM")"
if [[ "$CURRENT_NPM" != "$LATEST_NPM" ]]; then
  echo "npm is outdated: $CURRENT_NPM -> $LATEST_NPM"
  npm install -g "npm@$LATEST_NPM"
else
  echo "npm is already current: $CURRENT_NPM"
fi

log "Installing dependencies"
npm install --include=dev

log "Building production frontend"
npm run build

log "Ensuring nginx is installed"
if ! command -v nginx >/dev/null 2>&1; then
  if command -v yum >/dev/null 2>&1; then
    action yum install -y nginx
  elif command -v dnf >/dev/null 2>&1; then
    action dnf install -y nginx
  else
    echo "Could not find a supported package manager to install nginx." >&2
    exit 1
  fi
fi

log "Creating systemd service for the app"
cat > /tmp/${APP_SERVICE_NAME}.service <<EOF
[Unit]
Description=${APP_SERVICE_NAME}
After=network.target

[Service]
WorkingDirectory=${REPO_DIR}
Environment=NODE_ENV=production
Environment=PORT=${PORT}
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=5
User=${USER:-ec2-user}
Group=${USER:-ec2-user}
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

action cp /tmp/${APP_SERVICE_NAME}.service /etc/systemd/system/${APP_SERVICE_NAME}.service
action systemctl daemon-reload
action systemctl enable --now ${APP_SERVICE_NAME}
action systemctl restart ${APP_SERVICE_NAME}

log "Writing nginx reverse proxy config"
cat > /tmp/the-ll-nginx.conf <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root ${REPO_DIR}/build;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /images/ {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /faqs/ {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static/ {
        alias ${REPO_DIR}/build/static/;
        expires 1y;
        access_log off;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

action install -d /etc/nginx/conf.d

action cp /tmp/the-ll-nginx.conf "$NGINX_SITE_CONF"
if [[ -f "$NGINX_DEFAULT_CONF" ]]; then
  action rm -f "$NGINX_DEFAULT_CONF"
fi

action nginx -t

action systemctl enable --now nginx
action systemctl reload nginx

log "Deployment complete"
echo "App: http://localhost:${PORT}"
echo "Public site: http://$(curl -s http://169.254.169.254/latest/meta-data/public-hostname 2>/dev/null || echo 'your-ec2-hostname')/"
