CREATE TABLE "sites" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "default_locale" TEXT NOT NULL DEFAULT 'fr',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_domains" (
    "id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "host" TEXT NOT NULL,
    "scheme" TEXT NOT NULL DEFAULT 'https',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_canonical" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "redirect_to_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_domains_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sites_code_key" ON "sites"("code");
CREATE UNIQUE INDEX "site_domains_host_key" ON "site_domains"("host");
CREATE INDEX "site_domains_site_id_is_active_idx" ON "site_domains"("site_id", "is_active");
CREATE UNIQUE INDEX "site_domains_one_primary_per_site_idx" ON "site_domains"("site_id") WHERE "is_primary" = true;
CREATE UNIQUE INDEX "site_domains_one_canonical_per_site_idx" ON "site_domains"("site_id") WHERE "is_canonical" = true;

ALTER TABLE "site_domains"
    ADD CONSTRAINT "site_domains_site_id_fkey"
    FOREIGN KEY ("site_id") REFERENCES "sites"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "sites" ("id", "name", "code", "default_locale", "is_active", "created_at", "updated_at")
VALUES (gen_random_uuid(), 'Site principal', 'default-site', 'fr', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

ALTER TABLE "seo_metadata" ADD COLUMN "site_id" UUID;

UPDATE "seo_metadata"
SET "site_id" = (
    SELECT "id"
    FROM "sites"
    WHERE "code" = 'default-site'
    LIMIT 1
)
WHERE "site_id" IS NULL;

ALTER TABLE "seo_metadata" ALTER COLUMN "site_id" SET NOT NULL;
ALTER TABLE "seo_metadata"
    ADD CONSTRAINT "seo_metadata_site_id_fkey"
    FOREIGN KEY ("site_id") REFERENCES "sites"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "seo_metadata" DROP CONSTRAINT IF EXISTS "seo_metadata_page_key_key";
CREATE UNIQUE INDEX "seo_metadata_site_id_page_key_key" ON "seo_metadata"("site_id", "page_key");
CREATE INDEX "seo_metadata_site_id_status_idx" ON "seo_metadata"("site_id", "status");

ALTER TABLE "seo_redirects" ADD COLUMN "site_id" UUID;

UPDATE "seo_redirects" AS sr
SET "site_id" = COALESCE(
    (
        SELECT sm."site_id"
        FROM "seo_metadata" sm
        WHERE sm."id" = sr."source_page_id"
        LIMIT 1
    ),
    (
        SELECT sm."site_id"
        FROM "seo_metadata" sm
        WHERE sm."id" = sr."target_page_id"
        LIMIT 1
    ),
    (
        SELECT "id"
        FROM "sites"
        WHERE "code" = 'default-site'
        LIMIT 1
    )
)
WHERE "site_id" IS NULL;

ALTER TABLE "seo_redirects" ALTER COLUMN "site_id" SET NOT NULL;
ALTER TABLE "seo_redirects"
    ADD CONSTRAINT "seo_redirects_site_id_fkey"
    FOREIGN KEY ("site_id") REFERENCES "sites"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "seo_redirects_site_id_source_path_is_active_idx"
    ON "seo_redirects"("site_id", "source_path", "is_active");
