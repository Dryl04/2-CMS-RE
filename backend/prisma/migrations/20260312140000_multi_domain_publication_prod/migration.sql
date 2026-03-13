CREATE TYPE "site_canonical_strategy" AS ENUM ('canonical_domain', 'served_domain');
CREATE TYPE "domain_verification_method" AS ENUM ('dns_txt', 'http_file', 'manual');
CREATE TYPE "domain_verification_status" AS ENUM ('pending', 'verified', 'failed');
CREATE TYPE "domain_ssl_status" AS ENUM ('pending', 'active', 'issue');

ALTER TABLE "sites"
  ADD COLUMN "homepage_page_key" TEXT NOT NULL DEFAULT 'home',
  ADD COLUMN "canonical_strategy" "site_canonical_strategy" NOT NULL DEFAULT 'canonical_domain';

ALTER TABLE "site_domains"
  ADD COLUMN "business_owner" TEXT,
  ADD COLUMN "technical_owner" TEXT,
  ADD COLUMN "registrar" TEXT,
  ADD COLUMN "dns_provider" TEXT,
  ADD COLUMN "dns_target" TEXT,
  ADD COLUMN "hosting_target" TEXT,
  ADD COLUMN "verification_method" "domain_verification_method" NOT NULL DEFAULT 'manual',
  ADD COLUMN "verification_status" "domain_verification_status" NOT NULL DEFAULT 'pending',
  ADD COLUMN "verification_token" TEXT,
  ADD COLUMN "verified_at" TIMESTAMP(3),
  ADD COLUMN "ssl_status" "domain_ssl_status" NOT NULL DEFAULT 'pending',
  ADD COLUMN "robots_txt_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "sitemap_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "allow_indexing" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "go_live_at" TIMESTAMP(3);
