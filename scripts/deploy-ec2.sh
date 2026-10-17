#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="${REPO_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-master}"
PORT="${PORT:-4000}"
APP_SERVICE_NAME="${APP_SERVICE_NAME:-the-labyrinth-lab}"
APP_USER="${APP_USER:-${USER:-ubuntu}}"
NGINX_SITE_CONF="${NGINX_SITE_CONF:-/etc/nginx/conf.d/the-ll.conf}"
NGINX_DEFAULT_CONF="${NGINX_DEFAULT_CONF:-}"

if [[ -z "$NGINX_DEFAULT_CONF" ]]; then
  for candidate in \
    /etc/nginx/conf.d/default.conf \
    /etc/nginx/sites-enabled/default \
    /etc/nginx/sites-available/default; do
    if [[ -e "$candidate" ]]; then
      NGINX_DEFAULT_CONF="$candidate"
      break
    fi
  done
fi

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

log "Ensuring npm is current for this Node version"
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo "0")"
CURRENT_NPM_MAJOR="$(npm -v 2>/dev/null | cut -d. -f1 || echo "0")"
if (( NODE_MAJOR >= 22 )); then
  TARGET_NPM_MAJOR="latest"
elif (( NODE_MAJOR >= 18 )); then
  TARGET_NPM_MAJOR="10"
elif (( NODE_MAJOR >= 16 )); then
  TARGET_NPM_MAJOR="8"
else
  TARGET_NPM_MAJOR="6"
fi

if [[ "$TARGET_NPM_MAJOR" == "latest" ]]; then
  CURRENT_NPM="$(npm --version 2>/dev/null || echo "0.0.0")"
  LATEST_NPM="$(npm view npm version 2>/dev/null | tail -n 1 || echo "$CURRENT_NPM")"
  if [[ "$CURRENT_NPM" != "$LATEST_NPM" ]]; then
    echo "npm is outdated for Node ${NODE_MAJOR}: $CURRENT_NPM -> $LATEST_NPM"
    npm install -g "npm@$LATEST_NPM"
  else
    echo "npm is already current for Node ${NODE_MAJOR}: $CURRENT_NPM"
  fi
else
  if [[ "$CURRENT_NPM_MAJOR" != "$TARGET_NPM_MAJOR" ]]; then
    echo "npm major mismatch for Node ${NODE_MAJOR}: current ${CURRENT_NPM_MAJOR} -> target ${TARGET_NPM_MAJOR}"
    npm install -g "npm@${TARGET_NPM_MAJOR}"
  else
    CURRENT_NPM="$(npm --version 2>/dev/null || echo "0.0.0")"
    echo "npm is already on the compatible major for Node ${NODE_MAJOR}: $CURRENT_NPM"
  fi
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
User=${APP_USER}
Group=${APP_USER}
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
if [[ -n "$NGINX_DEFAULT_CONF" ]] && [[ -e "$NGINX_DEFAULT_CONF" ]]; then
  if [[ -L "$NGINX_DEFAULT_CONF" ]] || [[ -f "$NGINX_DEFAULT_CONF" ]]; then
    action rm -f "$NGINX_DEFAULT_CONF"
  fi
fi

if [[ -L /etc/nginx/sites-enabled/default ]]; then
  action rm -f /etc/nginx/sites-enabled/default
fi

action nginx -t

action systemctl enable --now nginx
action systemctl reload nginx

log "Deployment complete"
PUBLIC_HOST="$(curl -fsSL --max-time 5 http://169.254.169.254/latest/meta-data/public-hostname 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo '')"
if [[ -n "$PUBLIC_HOST" ]]; then
  echo "App: http://localhost:${PORT}"
  echo "Public site: http://${PUBLIC_HOST}/"
else
  echo "App: http://localhost:${PORT}"
  echo "Public site: set this to your EC2 public DNS or ALB address."
fi
