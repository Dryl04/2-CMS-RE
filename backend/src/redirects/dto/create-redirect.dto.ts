import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRedirectDto {
  @IsString()
  @MaxLength(255)
  sourcePath!: string;

  @IsString()
  @MaxLength(255)
  targetPath!: string;

  @IsOptional()
  @IsUUID()
  sourcePageId?: string;

  @IsOptional()
  @IsUUID()
  targetPageId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  reason?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
