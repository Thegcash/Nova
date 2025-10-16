#!/usr/bin/env bash
set -euo pipefail

# Base URL for the running app (defaults to localhost:3001 if not set)
BASE_URL="${NEXT_PUBLIC_BASE_URL:-http://localhost:3001}"

# --- macOS date math (BSD date) ---
if date -v-1d +%F >/dev/null 2>&1; then
  FROM="$(date -v-1d +%F)"   # yesterday
  TO="$(date +%F)"           # today
# --- Linux date math (GNU date) ---
elif date -d "yesterday" +%F >/dev/null 2>&1; then
  FROM="$(date -d "yesterday" +%F)"
  TO="$(date +%F)"
else
  echo "ERROR: date(1) on this OS is unsupported in this script."
  exit 1
fi

FORMAT="${EXPORT_DEFAULT_FORMAT:-csv}"

echo "Posting export: ${FROM} -> ${TO} (${FORMAT}) to ${BASE_URL}"
curl -sS -X POST \
  -H "content-type: application/json" \
  -d "{\"from\":\"${FROM}\",\"to\":\"${TO}\",\"format\":\"${FORMAT}\"}" \
  "${BASE_URL}/api/exports/carrier/run" | jq .

# Daily retention cleanup
echo "Running retention cleanup..."
curl -sS -X POST "${BASE_URL}/api/exports/carrier/retention/run" -H "content-type: application/json" | jq . || true

