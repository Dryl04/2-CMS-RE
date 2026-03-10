import { PartialType } from '@nestjs/mapped-types';
import { CreatePageThemeDto } from './create-page-theme.dto';

export class UpdatePageThemeDto extends PartialType(CreatePageThemeDto) {}
