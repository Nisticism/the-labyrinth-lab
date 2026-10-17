#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="${REPO_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
DATA_TARGET_DIR="${DATA_TARGET_DIR:-$REPO_DIR/data}"
IMAGES_TARGET_DIR="${IMAGES_TARGET_DIR:-$REPO_DIR/public/images}"

SOURCE_ROOT="${GALLERY_SYNC_SOURCE:-}"
DATA_SOURCE_DIR="${GALLERY_SYNC_DATA_DIR:-}"
IMAGES_SOURCE_DIR="${GALLERY_SYNC_IMAGES_DIR:-}"

copy_file_if_exists() {
  local src="$1"
  local dst="$2"

  if [[ -z "$src" || ! -e "$src" ]]; then
    return 0
  fi

  mkdir -p "$(dirname "$dst")"
  cp -a "$src" "$dst"
}

sync_dir_contents() {
  local src="$1"
  local dst="$2"

  if [[ -z "$src" || ! -d "$src" ]]; then
    return 0
  fi

  mkdir -p "$dst"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete "$src/" "$dst/"
  else
    find "$src" -mindepth 1 -maxdepth 1 -exec cp -a {} "$dst/" \;
  fi
}

if [[ -n "$SOURCE_ROOT" ]]; then
  if [[ -d "$SOURCE_ROOT" ]]; then
    [[ -z "$DATA_SOURCE_DIR" ]] && DATA_SOURCE_DIR="$SOURCE_ROOT/data"
    [[ -z "$IMAGES_SOURCE_DIR" ]] && IMAGES_SOURCE_DIR="$SOURCE_ROOT/public/images"
  elif [[ -f "$SOURCE_ROOT" ]]; then
    copy_file_if_exists "$SOURCE_ROOT" "$DATA_TARGET_DIR/gallery-config.json"
    echo "Persistent gallery sync complete."
    exit 0
  fi
fi

if [[ -n "$DATA_SOURCE_DIR" ]]; then
  copy_file_if_exists "$DATA_SOURCE_DIR/gallery-config.json" "$DATA_TARGET_DIR/gallery-config.json"
fi

if [[ -n "$IMAGES_SOURCE_DIR" ]]; then
  sync_dir_contents "$IMAGES_SOURCE_DIR" "$IMAGES_TARGET_DIR"
fi

if [[ -z "$SOURCE_ROOT" && -z "$DATA_SOURCE_DIR" && -z "$IMAGES_SOURCE_DIR" ]]; then
  echo "No gallery sync source configured; skipping persistent gallery sync."
  exit 0
fi

echo "Persistent gallery sync complete."