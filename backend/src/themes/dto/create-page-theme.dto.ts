import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreatePageThemeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  css?: any;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
