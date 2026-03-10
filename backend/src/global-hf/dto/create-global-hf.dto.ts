import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
} from 'class-validator';

export class CreateGlobalHfDto {
  @IsString()
  label: string;

  @IsOptional()
  @IsObject()
  headerSection?: any;

  @IsOptional()
  @IsObject()
  footerSection?: any;

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
  @IsString({ each: true })
  targetPageIds?: string[];
}
