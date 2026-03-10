import { PartialType } from '@nestjs/mapped-types';
import { CreateGlobalHfDto } from './create-global-hf.dto';

export class UpdateGlobalHfDto extends PartialType(CreateGlobalHfDto) {}
