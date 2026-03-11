import { IsArray, IsBoolean, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateFontDto {
  @IsString()
  @MaxLength(120)
  fontName!: string;

  @IsString()
  @MaxLength(160)
  fontFamily!: string;

  @IsOptional()
  @IsUrl()
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
