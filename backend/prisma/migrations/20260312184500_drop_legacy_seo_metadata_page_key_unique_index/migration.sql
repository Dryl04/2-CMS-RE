DROP INDEX IF EXISTS "seo_metadata_page_key_key";

CREATE UNIQUE INDEX IF NOT EXISTS "seo_metadata_site_id_page_key_key"
ON "seo_metadata"("site_id", "page_key");