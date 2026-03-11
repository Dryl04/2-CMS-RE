#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_FILE="${1:-$ROOT_DIR/scripts/supabase_export.sql}"
SUPABASE_CONNECTION_STRING="${SUPABASE_DB_URL:-}"

if [[ -z "$SUPABASE_CONNECTION_STRING" ]]; then
  echo "SUPABASE_DB_URL is required." >&2
  echo "Example: export SUPABASE_DB_URL='postgresql://postgres:password@db.example.supabase.co:5432/postgres?sslmode=require'" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"

pg_dump "$SUPABASE_CONNECTION_STRING" \
  --schema=public \
  --data-only \
  --inserts \
  --column-inserts \
  --no-owner \
  --no-privileges \
  --exclude-table=public.schema_migrations \
  --file="$OUTPUT_FILE"

echo "Export termine : $OUTPUT_FILE"
