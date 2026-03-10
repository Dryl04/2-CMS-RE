import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRedirectDto {
  @IsString()
  sourcePath: string;

  @IsString()
  targetPath: string;

  @IsOptional()
  @IsString()
  sourcePageId?: string;

  @IsOptional()
  @IsString()
  targetPageId?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
