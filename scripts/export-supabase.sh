#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_FILE="${1:-$ROOT_DIR/scripts/supabase_export.sql}"
SUPABASE_CONNECTION_STRING="${SUPABASE_DB_POOLER_URL:-${SUPABASE_DB_URL:-}}"
SUPABASE_API_URL="${SUPABASE_URL:-${VITE_SUPABASE_URL:-}}"
SUPABASE_SERVICE_ROLE_KEY_VALUE="${SUPABASE_SERVICE_ROLE_KEY:-}"

run_rest_export() {
  echo "Using read-only Supabase REST export over HTTPS..."
  node --experimental-strip-types "$ROOT_DIR/scripts/export-supabase-rest.ts" "$OUTPUT_FILE"
}

if [[ -z "$SUPABASE_CONNECTION_STRING" ]]; then
  if [[ -n "$SUPABASE_API_URL" && -n "$SUPABASE_SERVICE_ROLE_KEY_VALUE" ]]; then
    run_rest_export
    exit 0
  fi

  echo "SUPABASE_DB_POOLER_URL or SUPABASE_DB_URL is required." >&2
  echo "Alternative: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to export via HTTPS." >&2
  echo "IPv4-only networks should use the Supabase Session pooler URL when available." >&2
  echo "Example: export SUPABASE_DB_POOLER_URL='postgresql://postgres.PROJECT_REF:password@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require'" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"

CONNECTION_HOST="$(python3 - "$SUPABASE_CONNECTION_STRING" <<'PY'
from urllib.parse import urlparse
import sys

try:
    print(urlparse(sys.argv[1]).hostname or '')
except Exception:
    print('')
PY
)"

if [[ "$CONNECTION_HOST" =~ ^db\..*\.supabase\.co$ ]] && ! getent ahostsv4 "$CONNECTION_HOST" >/dev/null 2>&1; then
  if [[ -n "$SUPABASE_API_URL" && -n "$SUPABASE_SERVICE_ROLE_KEY_VALUE" ]]; then
    echo "Direct database export is not reachable from this network. Falling back to HTTPS REST export."
    run_rest_export
    exit 0
  fi

  echo "The supplied Supabase direct host resolves without IPv4 on this machine: $CONNECTION_HOST" >&2
  echo "Your network appears to be IPv4-only or lacks IPv6 routing." >&2
  echo "Use the Supabase Session pooler connection string instead:" >&2
  echo "  Dashboard > Connect > Session pooler" >&2
  echo "Or set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for a read-only HTTPS export." >&2
  echo "Then export it as SUPABASE_DB_POOLER_URL and rerun this script." >&2
  exit 1
fi

if ! PGCONNECT_TIMEOUT="${PGCONNECT_TIMEOUT:-15}" pg_dump "$SUPABASE_CONNECTION_STRING" \
  --schema=public \
  --data-only \
  --inserts \
  --column-inserts \
  --no-owner \
  --no-privileges \
  --exclude-table=public.schema_migrations \
  --file="$OUTPUT_FILE"; then
  if [[ -n "$SUPABASE_API_URL" && -n "$SUPABASE_SERVICE_ROLE_KEY_VALUE" ]]; then
    echo "pg_dump failed. Falling back to read-only HTTPS REST export."
    run_rest_export
    exit 0
  fi

  if [[ "$CONNECTION_HOST" =~ ^db\..*\.supabase\.co$ ]]; then
    echo "Hint: Supabase direct connections are IPv6-only by default." >&2
    echo "If your machine or ISP does not route IPv6, use the Session pooler URL instead." >&2
  fi
  exit 1
fi

echo "Export termine : $OUTPUT_FILE"
