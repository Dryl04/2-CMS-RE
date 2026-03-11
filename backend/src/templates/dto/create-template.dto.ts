import { IsBoolean, IsObject, IsOptional, IsString, IsUUID, IsUrl, MaxLength } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  description?: string;

  @IsOptional()
  @IsUrl()
  thumbnail?: string;

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
  @IsString()
  @MaxLength(80)
  daisyThemeSlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  folder?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsUUID()
  pageThemeId?: string;
}
