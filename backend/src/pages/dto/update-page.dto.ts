import { IsArray, IsEnum, IsObject, IsOptional, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator';
import { PageStatus } from '@prisma/client';

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  pageKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(160)
  ogTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  ogDescription?: string;

  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @IsOptional()
  @IsUrl()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  sectionsData?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoH1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoH2?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  daisyThemeSlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  folder?: string;
}
