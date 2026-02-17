#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
LOCAL_SUPABASE_BIN="$ROOT_DIR/.local-bin/supabase"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Fichier .env introuvable dans $ROOT_DIR"
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "❌ SUPABASE_DB_URL est manquant dans .env"
  exit 1
fi

SUPABASE_CMD=""
if [[ -x "$LOCAL_SUPABASE_BIN" ]]; then
  SUPABASE_CMD="$LOCAL_SUPABASE_BIN"
elif command -v supabase >/dev/null 2>&1; then
  SUPABASE_CMD="supabase"
else
  echo "❌ Supabase CLI introuvable."
  echo "Installez-la localement dans .local-bin/ ou globalement, puis relancez."
  exit 1
fi

DB_HOST="$(echo "$SUPABASE_DB_URL" | sed -E 's#^[^@]*@([^:/?]+).*#\1#')"

echo "ℹ️  Supabase CLI: $SUPABASE_CMD"
echo "ℹ️  Hôte DB: $DB_HOST"

if getent ahostsv4 "$DB_HOST" >/dev/null 2>&1; then
  echo "✅ Résolution IPv4 détectée pour $DB_HOST"
else
  if getent ahostsv6 "$DB_HOST" >/dev/null 2>&1; then
    echo "⚠️  L'hôte semble IPv6-only depuis cette machine."
  else
    echo "⚠️  Impossible de résoudre l'hôte DB avant tentative de migration."
  fi
fi

LOG_FILE="$(mktemp)"
set +e
"$SUPABASE_CMD" db push --db-url "$SUPABASE_DB_URL" 2>&1 | tee "$LOG_FILE"
EXIT_CODE=${PIPESTATUS[0]}
set -e

if [[ $EXIT_CODE -eq 0 ]]; then
  echo "✅ Migrations appliquées avec succès."
  rm -f "$LOG_FILE"
  exit 0
fi

if grep -qiE "network is unreachable|dial tcp .* connect: network is unreachable" "$LOG_FILE"; then
  echo
  echo "❌ Échec réseau vers la DB (souvent IPv6 non disponible localement)."
  echo "➡️  Action recommandée: utilisez une URL pooler IPv4 dans SUPABASE_DB_URL"
  echo "   (Supabase Dashboard > Settings > Database > Connection string > Pooler)."
  echo "Puis relancez: npm run db:push"
fi

if grep -qi "daisy_theme_slug" "$LOG_FILE"; then
  echo
  echo "⚠️  Le schéma distant ne connaît pas encore certaines colonnes attendues."
  echo "Lancer cette migration corrigera normalement ce point si la connexion DB est OK."
fi

rm -f "$LOG_FILE"
exit $EXIT_CODE
