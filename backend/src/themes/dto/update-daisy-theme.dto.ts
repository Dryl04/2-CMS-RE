import { PartialType } from '@nestjs/mapped-types';
import { CreateDaisyThemeDto } from './create-daisy-theme.dto';

export class UpdateDaisyThemeDto extends PartialType(CreateDaisyThemeDto) {}
