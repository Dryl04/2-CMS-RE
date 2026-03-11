import { IsArray, IsBoolean, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateGlobalHfDto {
  @IsString()
  @MaxLength(160)
  label!: string;

  @IsOptional()
  @IsObject()
  headerSection?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  footerSection?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  applyOnImport?: boolean;

  @IsOptional()
  @IsBoolean()
  applyOnCreate?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  targetPageIds?: string[];
}
