#!/usr/bin/env bash
# ──────────────────────────────────────────────
# export-supabase.sh
# Exports data from Supabase PostgreSQL (read-only).
# Usage: ./scripts/export-supabase.sh <SUPABASE_DB_URL>
# ──────────────────────────────────────────────
set -euo pipefail

DB_URL="${1:?Usage: $0 <SUPABASE_DB_URL>}"
OUT_DIR="./data-export"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$OUT_DIR"

echo "==> Exporting Supabase data to $OUT_DIR ..."

# Tables to export (public schema only)
TABLES=(
  user_profiles
  section_types
  page_themes
  fonts_library
  daisyui_themes
  page_templates
  seo_metadata
  template_sections
  page_content_sections
  media_files
  seo_redirects
  global_hf_settings
)

for TABLE in "${TABLES[@]}"; do
  echo "  Exporting $TABLE ..."
  pg_dump "$DB_URL" \
    --data-only \
    --table="public.$TABLE" \
    --no-owner \
    --no-privileges \
    --column-inserts \
    --file="$OUT_DIR/${TABLE}_${TIMESTAMP}.sql" \
    2>/dev/null || echo "  [WARN] Table $TABLE not found or empty, skipping."
done

# Also export as CSV for easier transform
for TABLE in "${TABLES[@]}"; do
  psql "$DB_URL" -c "\\COPY public.$TABLE TO '$OUT_DIR/${TABLE}_${TIMESTAMP}.csv' WITH CSV HEADER" \
    2>/dev/null || true
done

echo ""
echo "==> Export complete! Files in $OUT_DIR/"
echo "    Next step: run transform-export.ts to prepare data for import."
