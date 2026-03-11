ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "must_change_password" BOOLEAN NOT NULL DEFAULT false;

UPDATE "users"
SET "must_change_password" = true
WHERE "password_hash" = '$2b$10$dQkoICwIrfsixo/jUzsu7OWaQQdcE94DOQpYi1UirxLceVTQrkNTS';
