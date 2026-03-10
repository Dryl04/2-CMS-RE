import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ThemeSource } from '@prisma/client';

export class CreateDaisyThemeDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsEnum(ThemeSource)
  source?: ThemeSource;

  @IsObject()
  tokens: any;

  @IsOptional()
  @IsObject()
  fontConfig?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
