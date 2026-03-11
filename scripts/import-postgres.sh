#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
IMPORT_SQL_PATH="${IMPORT_SQL_PATH:-$ROOT_DIR/scripts/postgres_import.sql}"
DATABASE_URL_VALUE="${DATABASE_URL:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --db-url)
      DATABASE_URL_VALUE="${2:-}"
      shift 2
      ;;
    --file)
      IMPORT_SQL_PATH="${2:-}"
      shift 2
      ;;
    --help|-h)
      cat <<'EOF'
Usage:
  bash ./scripts/import-postgres.sh [--db-url <postgresql://...>] [--file <path/to/postgres_import.sql>]

Behavior:
  - uses --db-url when provided
  - otherwise uses DATABASE_URL from the environment
  - otherwise loads DATABASE_URL from .env if available
  - imports scripts/postgres_import.sql by default
EOF
      exit 0
      ;;
    *)
      if [[ -z "$DATABASE_URL_VALUE" ]]; then
        DATABASE_URL_VALUE="$1"
        shift
      else
        echo "❌ Argument non reconnu: $1"
        exit 1
      fi
      ;;
  esac
done

if [[ ! -f "$IMPORT_SQL_PATH" ]]; then
  echo "❌ Fichier d'import introuvable: $IMPORT_SQL_PATH"
  echo "Générez-le d'abord avec: npm run migrate:transform-export"
  exit 1
fi

if [[ -z "$DATABASE_URL_VALUE" && -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
  DATABASE_URL_VALUE="${DATABASE_URL:-}"
fi

if [[ -z "$DATABASE_URL_VALUE" ]]; then
  echo "❌ DATABASE_URL manquant."
  echo "Passez-le en argument ou via --db-url, par exemple:"
  echo "   bash ./scripts/import-postgres.sh --db-url 'postgresql://cms_user:cms_password@localhost:5432/cms_db'"
  exit 1
fi

echo "ℹ️  Import SQL: $IMPORT_SQL_PATH"
echo "ℹ️  Base cible: ${DATABASE_URL_VALUE%%\?*}"
echo "ℹ️  Remise à zéro des tables migrées puis import en transaction unique..."

psql "$DATABASE_URL_VALUE" -v ON_ERROR_STOP=1 <<SQL
BEGIN;
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;
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