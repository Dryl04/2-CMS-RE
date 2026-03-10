import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsObject()
  sectionsData?: any;

  @IsOptional()
  @IsString()
  seoH1?: string;

  @IsOptional()
  @IsString()
  seoH2?: string;

  @IsOptional()
  @IsString()
  daisyThemeSlug?: string;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsString()
  pageThemeId?: string;
}
