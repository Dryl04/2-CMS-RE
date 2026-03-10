import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateFontDto {
  @IsString()
  fontName: string;

  @IsString()
  fontFamily: string;

  @IsOptional()
  @IsString()
  fontUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fontWeights?: string[];

  @IsOptional()
  @IsBoolean()
  isGoogleFont?: boolean;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
