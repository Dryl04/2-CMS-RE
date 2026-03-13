import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from "class-validator";
import { IsJsonContainer } from "../../common/validators/is-json-container.validator";

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  description?: string;

  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @IsOptional()
  @IsJsonContainer()
  sectionsData?: Record<string, unknown> | unknown[];

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
