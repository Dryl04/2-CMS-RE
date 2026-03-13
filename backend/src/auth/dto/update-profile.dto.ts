import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;
}
