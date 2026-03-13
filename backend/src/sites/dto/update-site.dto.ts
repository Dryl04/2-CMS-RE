import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from "class-validator";
import { SiteCanonicalStrategy } from "@prisma/client";

export class UpdateSiteDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  defaultLocale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  homepagePageKey?: string;

  @IsOptional()
  @IsEnum(SiteCanonicalStrategy)
  canonicalStrategy?: SiteCanonicalStrategy;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
