-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'seo_manager', 'content_creator');

-- CreateEnum
CREATE TYPE "theme_source" AS ENUM ('daisyui', 'custom');

-- CreateEnum
CREATE TYPE "page_status" AS ENUM ('draft', 'published', 'archived');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "full_name" TEXT,
    "role" "role" NOT NULL DEFAULT 'content_creator',
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "schema" JSONB,
    "preview_image" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "section_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_themes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "css" JSONB,
    "user_id" UUID,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fonts_library" (
    "id" UUID NOT NULL,
    "font_name" TEXT NOT NULL,
    "font_family" TEXT NOT NULL,
    "font_url" TEXT,
    "font_weights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_google_font" BOOLEAN NOT NULL DEFAULT false,
    "imported_by" UUID,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fonts_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daisyui_themes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "source" "theme_source" NOT NULL DEFAULT 'daisyui',
    "tokens" JSONB NOT NULL,
    "font_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daisyui_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "sections_data" JSONB,
    "seo_h1" TEXT,
    "seo_h2" TEXT,
    "daisy_theme_slug" TEXT,
    "folder" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID,
    "page_theme_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_metadata" (
    "id" UUID NOT NULL,
    "page_key" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "canonical_url" TEXT,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "status" "page_status" NOT NULL DEFAULT 'draft',
    "content" TEXT,
    "sections_data" JSONB,
    "seo_h1" TEXT,
    "seo_h2" TEXT,
    "imported_at" TIMESTAMP(3),
    "created_by" UUID,
    "user_id" UUID,
    "template_id" UUID,
    "daisy_theme_slug" TEXT,
    "folder" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_sections" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "section_type_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "label" TEXT,
    "min_words" INTEGER,
    "max_words" INTEGER,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_content_sections" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "template_section_id" UUID,
    "section_type_id" UUID,
    "order_index" INTEGER NOT NULL,
    "content" JSONB,
    "background_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_content_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_files" (
    "id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" TEXT,
    "uploaded_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_redirects" (
    "id" UUID NOT NULL,
    "source_path" TEXT NOT NULL,
    "target_path" TEXT NOT NULL,
    "source_page_id" UUID,
    "target_page_id" UUID,
    "reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_hf_settings" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "header_section" JSONB,
    "footer_section" JSONB,
    "apply_on_import" BOOLEAN NOT NULL DEFAULT false,
    "apply_on_create" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "target_page_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_hf_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "section_types_name_key" ON "section_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "fonts_library_font_name_key" ON "fonts_library"("font_name");

-- CreateIndex
CREATE UNIQUE INDEX "daisyui_themes_slug_key" ON "daisyui_themes"("slug");

-- CreateIndex
CREATE INDEX "page_templates_folder_idx" ON "page_templates"("folder");

-- CreateIndex
CREATE UNIQUE INDEX "seo_metadata_page_key_key" ON "seo_metadata"("page_key");

-- CreateIndex
CREATE INDEX "seo_metadata_folder_idx" ON "seo_metadata"("folder");

-- CreateIndex
CREATE INDEX "seo_redirects_source_path_is_active_idx" ON "seo_redirects"("source_path", "is_active");

-- AddForeignKey
ALTER TABLE "page_themes" ADD CONSTRAINT "page_themes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fonts_library" ADD CONSTRAINT "fonts_library_imported_by_fkey" FOREIGN KEY ("imported_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daisyui_themes" ADD CONSTRAINT "daisyui_themes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_templates" ADD CONSTRAINT "page_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_templates" ADD CONSTRAINT "page_templates_page_theme_id_fkey" FOREIGN KEY ("page_theme_id") REFERENCES "page_themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_metadata" ADD CONSTRAINT "seo_metadata_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_metadata" ADD CONSTRAINT "seo_metadata_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "page_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_sections" ADD CONSTRAINT "template_sections_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "page_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_sections" ADD CONSTRAINT "template_sections_section_type_id_fkey" FOREIGN KEY ("section_type_id") REFERENCES "section_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_content_sections" ADD CONSTRAINT "page_content_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "seo_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_content_sections" ADD CONSTRAINT "page_content_sections_template_section_id_fkey" FOREIGN KEY ("template_section_id") REFERENCES "template_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_content_sections" ADD CONSTRAINT "page_content_sections_section_type_id_fkey" FOREIGN KEY ("section_type_id") REFERENCES "section_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_redirects" ADD CONSTRAINT "seo_redirects_source_page_id_fkey" FOREIGN KEY ("source_page_id") REFERENCES "seo_metadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_redirects" ADD CONSTRAINT "seo_redirects_target_page_id_fkey" FOREIGN KEY ("target_page_id") REFERENCES "seo_metadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_redirects" ADD CONSTRAINT "seo_redirects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_hf_settings" ADD CONSTRAINT "global_hf_settings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

