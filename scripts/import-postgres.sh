#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
IMPORT_SQL_PATH="${IMPORT_SQL_PATH:-$ROOT_DIR/scripts/postgres_import.sql}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Fichier .env introuvable dans $ROOT_DIR"
  exit 1
fi

if [[ ! -f "$IMPORT_SQL_PATH" ]]; then
  echo "❌ Fichier d'import introuvable: $IMPORT_SQL_PATH"
  echo "Générez-le d'abord avec: npm run migrate:transform-export"
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ DATABASE_URL est manquant dans .env"
  exit 1
fi

echo "ℹ️  Import SQL: $IMPORT_SQL_PATH"
echo "ℹ️  Base cible: ${DATABASE_URL%%\?*}"
echo "ℹ️  Remise à zéro des tables migrées puis import en transaction unique..."

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
BEGIN;
TRUNCATE TABLE
  public.seo_redirects,
  public.global_hf_settings,
  public.media_files,
  public.seo_metadata,
  public.page_templates,
  public.section_types,
  public.fonts_library,
  public.daisyui_themes,
  public.page_themes,
  public.users
RESTART IDENTITY CASCADE;
\i $IMPORT_SQL_PATH
COMMIT;
SQL

echo "✅ Import PostgreSQL terminé avec succès."