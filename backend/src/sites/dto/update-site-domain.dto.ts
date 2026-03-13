import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
} from "class-validator";
import {
  DomainSslStatus,
  DomainVerificationMethod,
  DomainVerificationStatus,
} from "@prisma/client";

export class UpdateSiteDomainDto {
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === "string"
      ? value
          .trim()
          .toLowerCase()
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "")
      : value,
  )
  @Matches(/^[a-z0-9.-]+$/)
  host?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  scheme?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isCanonical?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  locale?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  redirectToPrimary?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  businessOwner?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  technicalOwner?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  registrar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  dnsProvider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  dnsTarget?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  hostingTarget?: string;

  @IsOptional()
  @IsEnum(DomainVerificationMethod)
  verificationMethod?: DomainVerificationMethod;

  @IsOptional()
  @IsEnum(DomainVerificationStatus)
  verificationStatus?: DomainVerificationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  verificationToken?: string;

  @IsOptional()
  @IsDateString()
  verifiedAt?: string;

  @IsOptional()
  @IsEnum(DomainSslStatus)
  sslStatus?: DomainSslStatus;

  @IsOptional()
  @IsBoolean()
  robotsTxtEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  sitemapEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  allowIndexing?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  goLiveAt?: string;
}
