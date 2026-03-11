import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePageThemeDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  description?: string;

  @IsOptional()
  @IsObject()
  css?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
