#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$ROOT_DIR/supabase/migrations"
OUT_FILE="$ROOT_DIR/supabase/all-migrations.sql"

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "❌ Dossier migrations introuvable: $MIGRATIONS_DIR"
  exit 1
fi

mapfile -t MIGRATION_FILES < <(find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name "*.sql" | sort)

if [[ ${#MIGRATION_FILES[@]} -eq 0 ]]; then
  echo "❌ Aucune migration SQL trouvée dans $MIGRATIONS_DIR"
  exit 1
fi

{
  echo "-- Auto-generated migration bundle"
  echo "-- Generated at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "-- Source directory: supabase/migrations"
  echo
  echo "BEGIN;"
  echo

  for file in "${MIGRATION_FILES[@]}"; do
    base_name="$(basename "$file")"
    echo "-- ==================================================================="
    echo "-- MIGRATION: $base_name"
    echo "-- ==================================================================="
    cat "$file"
    echo
    echo
  done

  echo "COMMIT;"
  echo
} > "$OUT_FILE"

echo "✅ Bundle généré: $OUT_FILE"
echo "📦 Migrations incluses: ${#MIGRATION_FILES[@]}"
