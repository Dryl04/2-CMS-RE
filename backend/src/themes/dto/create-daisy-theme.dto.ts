import { ThemeSource } from '@prisma/client';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDaisyThemeDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @MaxLength(120)
  slug!: string;

  @IsOptional()
  @IsEnum(ThemeSource)
  source?: ThemeSource;

  @IsObject()
  tokens!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fontConfig?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
