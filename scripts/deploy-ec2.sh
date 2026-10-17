#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="${REPO_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"

load_dotenv() {
  local env_file="$1"
  if [[ ! -f "$env_file" ]]; then
    return 0
  fi

  while IFS='=' read -r key value; do
    [[ -z "$key" ]] && continue
    [[ "$key" =~ ^[[:space:]]*# ]] && continue
    key="${key%%[[:space:]]*}"
    if [[ -z "$key" ]]; then
      continue
    fi

    value="${value%$'\r'}"
    value="${value#${value%%[![:space:]]*}}"
    value="${value%${value##*[![:space:]]}}"

    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
      value="${value:1:${#value}-2}"
    fi

    printf -v "$key" '%s' "$value"
    export "$key"
  done < "$env_file"
}

load_dotenv "$REPO_DIR/.env"

REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-master}"
PORT="${PORT:-4000}"
APP_SERVICE_NAME="${APP_SERVICE_NAME:-the-labyrinth-lab}"
APP_USER="${APP_USER:-${USER:-ubuntu}}"
SITE_DOMAIN="${SITE_DOMAIN:-${APP_DOMAIN:-the-ll.com}}"
NGINX_SITE_CONF="${NGINX_SITE_CONF:-/etc/nginx/conf.d/the-ll.conf}"

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

action() {
  if [[ -n "$SUDO" ]]; then
    $SUDO "$@"
  else
    "$@"
  fi
}

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "Repository not found at $REPO_DIR" >&2
  exit 1
fi

require_file "$REPO_DIR/.env"

cd "$REPO_DIR"

log "Pulling latest code"
git fetch --all --tags
git checkout "$BRANCH"
if ! git pull --ff-only "$REMOTE" "$BRANCH"; then
  echo "Pull was blocked (likely a previously-untracked file now tracked in git)."
  BACKUP_DIR="$REPO_DIR/.deploy-backups/$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  # data/gallery-config.json used to be gitignored; a stale untracked copy on
  # the server blocks the merge. Preserve it, then let the tracked version win.
  if [[ -f "$REPO_DIR/data/gallery-config.json" ]]; then
    echo "Backing up existing data/gallery-config.json to $BACKUP_DIR/"
    cp -a "$REPO_DIR/data/gallery-config.json" "$BACKUP_DIR/" || true
    rm -f "$REPO_DIR/data/gallery-config.json"
  fi
  git pull --ff-only "$REMOTE" "$BRANCH"
fi

log "Syncing persisted gallery data"
if [[ -n "${GALLERY_SYNC_SOURCE:-}" || -n "${GALLERY_SYNC_DATA_DIR:-}" || -n "${GALLERY_SYNC_IMAGES_DIR:-}" ]]; then
  bash "$SCRIPT_DIR/sync-persistent-gallery.sh"
else
  echo "No gallery sync source configured; skipping persisted gallery sync."
fi

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
  if command -v apt-get >/dev/null 2>&1; then
    action apt-get update -y
    action apt-get install -y nginx
  elif command -v dnf >/dev/null 2>&1; then
    action dnf install -y nginx
  elif command -v yum >/dev/null 2>&1; then
    action yum install -y nginx
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
CERT_PATH="/etc/letsencrypt/live/${SITE_DOMAIN}/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/${SITE_DOMAIN}/privkey.pem"

# Let's Encrypt stores certs under a root-only directory, so probe with elevated
# privileges. Testing as the invoking user would silently fail and drop HTTPS.
if action test -f "$CERT_PATH" && action test -f "$KEY_PATH"; then
  HAVE_CERT=1
  echo "TLS certificate found for ${SITE_DOMAIN}; enabling HTTPS."
else
  HAVE_CERT=0
  echo "No TLS certificate found for ${SITE_DOMAIN}; serving HTTP only."
fi

APP_LOCATIONS=$(cat <<EOF
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
EOF
)

if [[ "$HAVE_CERT" == "1" ]]; then
  cat > /tmp/the-ll-nginx.conf <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name ${SITE_DOMAIN} www.${SITE_DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    http2 on;
    server_name ${SITE_DOMAIN} www.${SITE_DOMAIN};

    ssl_certificate ${CERT_PATH};
    ssl_certificate_key ${KEY_PATH};

${APP_LOCATIONS}
}
EOF
else
  cat > /tmp/the-ll-nginx.conf <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name ${SITE_DOMAIN} www.${SITE_DOMAIN};

${APP_LOCATIONS}
}
EOF
fi

action install -d /etc/nginx/conf.d
action cp /tmp/the-ll-nginx.conf "$NGINX_SITE_CONF"

log "Disabling conflicting nginx server blocks for ${SITE_DOMAIN}"
DOMAIN_RE="${SITE_DOMAIN//./\\.}"
NGINX_SITE_CONF_REAL="$(readlink -f "$NGINX_SITE_CONF" 2>/dev/null || echo "$NGINX_SITE_CONF")"
shopt -s nullglob
for conf in /etc/nginx/conf.d/*.conf /etc/nginx/sites-enabled/*; do
  conf_real="$(readlink -f "$conf" 2>/dev/null || echo "$conf")"
  if [[ "$conf_real" == "$NGINX_SITE_CONF_REAL" ]]; then
    continue
  fi
  if $SUDO grep -qE "server_name[^;]*${DOMAIN_RE}" "$conf" 2>/dev/null; then
    ts="$(date +%Y%m%d%H%M%S)"
    echo "Disabling conflicting nginx config: $conf"
    action mv "$conf" "${conf}.disabled.${ts}"
  fi
done
shopt -u nullglob

# Remove the stock default site if present (it grabs the default_server slot).
if [[ -L /etc/nginx/sites-enabled/default ]]; then
  action rm -f /etc/nginx/sites-enabled/default
fi

action nginx -t

action systemctl enable --now nginx
action systemctl reload nginx

log "Verifying the app responds locally"
if curl -fsS --max-time 10 "http://127.0.0.1:${PORT}/api/gallery" >/dev/null 2>&1; then
  echo "App responded on http://127.0.0.1:${PORT}/api/gallery"
else
  echo "WARNING: app did not respond on http://127.0.0.1:${PORT}/api/gallery" >&2
  echo "Check: sudo journalctl -u ${APP_SERVICE_NAME} -n 50 --no-pager" >&2
fi

log "Deployment complete"
echo "App: http://localhost:${PORT}"
if [[ "$HAVE_CERT" == "1" ]]; then
  echo "Public site: https://${SITE_DOMAIN}/"
else
  echo "Public site: http://${SITE_DOMAIN}/ (no TLS cert found; run certbot to enable HTTPS)"
fi
