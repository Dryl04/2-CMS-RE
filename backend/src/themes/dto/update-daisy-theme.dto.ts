import { ThemeSource } from '@prisma/client';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDaisyThemeDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsEnum(ThemeSource)
  source?: ThemeSource;

  @IsOptional()
  @IsObject()
  tokens?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fontConfig?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
