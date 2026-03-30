#!/usr/bin/env bash
# install.sh — install local-search from pre-built binaries
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/.../install.sh | bash
#   or locally: bash install.sh
#
# Options:
#   INSTALL_DIR=/custom/path bash install.sh   override install location
#   BASE_URL=https://...     bash install.sh   override download base URL

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────

TOOL_NAME="local-search"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"
BASE_URL="${BASE_URL:-https://raw.githubusercontent.com/YOUR_ORG/YOUR_REPO/main/local-doc-tool/code/dist}"

# ── Helpers ───────────────────────────────────────────────────────────────────

red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
bold()  { printf '\033[1m%s\033[0m\n'  "$*"; }
info()  { printf '  %s\n' "$*"; }

die() {
  red "Error: $*" >&2
  exit 1
}

# ── Detect platform ───────────────────────────────────────────────────────────

detect_platform() {
  local os arch

  case "$(uname -s)" in
    Darwin) os="darwin" ;;
    Linux)  os="linux"  ;;
    MINGW*|MSYS*|CYGWIN*) os="windows" ;;
    *) die "Unsupported OS: $(uname -s)" ;;
  esac

  case "$(uname -m)" in
    x86_64|amd64)  arch="amd64" ;;
    arm64|aarch64) arch="arm64" ;;
    *) die "Unsupported architecture: $(uname -m)" ;;
  esac

  echo "${os}/${arch}"
}

# Map os/arch → binary filename in dist/
binary_name() {
  local platform="$1"
  case "$platform" in
    darwin/arm64) echo "local-search-mac-silicon-darwin-arm64" ;;
    darwin/amd64) echo "local-search-darwin-amd64"             ;;
    linux/amd64)  echo "local-search-linux-amd64"              ;;
    linux/arm64)  echo "local-search-linux-arm64"              ;;
    windows/amd64) echo "local-search-windows-amd64.exe"       ;;
    *) die "No pre-built binary for platform: $platform" ;;
  esac
}

# ── Check existing installation ───────────────────────────────────────────────

check_existing() {
  local install_path="$1"

  if [[ -f "$install_path" ]]; then
    local existing_ver
    existing_ver="$("$install_path" --version 2>/dev/null || echo "unknown")"
    bold "Existing installation found"
    info "Path:    $install_path"
    info "Version: $existing_ver"
    printf '\n  Overwrite? [y/N] '
    read -r answer
    case "$answer" in
      [yY]*) return 0 ;;
      *) info "Cancelled. Existing installation unchanged."; exit 0 ;;
    esac
  fi
}

# ── Download ──────────────────────────────────────────────────────────────────

download_binary() {
  local url="$1"
  local dest="$2"
  local tmp
  tmp="$(mktemp)"

  if command -v curl &>/dev/null; then
    curl -fsSL --progress-bar "$url" -o "$tmp" || die "Download failed: $url"
  elif command -v wget &>/dev/null; then
    wget -q --show-progress "$url" -O "$tmp" || die "Download failed: $url"
  else
    die "Neither curl nor wget found. Install one and retry."
  fi

  mv "$tmp" "$dest"
}

# ── Install ───────────────────────────────────────────────────────────────────

main() {
  bold "local-search installer"
  printf '\n'

  # Detect platform
  local platform
  platform="$(detect_platform)"
  info "Platform: $platform"

  local bin
  bin="$(binary_name "$platform")"

  local install_path="${INSTALL_DIR}/${TOOL_NAME}"
  info "Install:  $install_path"
  printf '\n'

  # Check for existing install
  check_existing "$install_path"

  # Ensure install dir exists and is writable
  if [[ ! -d "$INSTALL_DIR" ]]; then
    info "Creating $INSTALL_DIR …"
    mkdir -p "$INSTALL_DIR" 2>/dev/null || sudo mkdir -p "$INSTALL_DIR"
  fi

  if [[ ! -w "$INSTALL_DIR" ]]; then
    info "Elevated permissions required for $INSTALL_DIR"
    local tmp
    tmp="$(mktemp)"
    info "Downloading $bin …"
    download_binary "${BASE_URL}/${bin}" "$tmp"
    chmod +x "$tmp"
    sudo mv "$tmp" "$install_path"
  else
    info "Downloading $bin …"
    download_binary "${BASE_URL}/${bin}" "$install_path"
    chmod +x "$install_path"
  fi

  # Verify
  if "$install_path" --version &>/dev/null; then
    printf '\n'
    green "Installed: $("$install_path" --version)"
    info "Run: local-search help"
  else
    die "Binary installed but failed to run. Check permissions or try reinstalling."
  fi
}

main "$@"
