import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateGlobalHfDto } from './dto/create-global-hf.dto';
import { UpdateGlobalHfDto } from './dto/update-global-hf.dto';
import { GlobalHfService } from './global-hf.service';

@Controller('api/global-hf')
export class GlobalHfController {
  constructor(private readonly globalHfService: GlobalHfService) {}

  @Get()
  findAll() {
    return this.globalHfService.findAll();
  }

  @Roles(Role.admin)
  @Post()
  create(@Body() dto: CreateGlobalHfDto, @CurrentUser() user: JwtUser) {
    return this.globalHfService.create(dto, user);
  }

  @Roles(Role.admin)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGlobalHfDto) {
    return this.globalHfService.update(id, dto);
  }

  @Roles(Role.admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.globalHfService.remove(id);
  }
}
