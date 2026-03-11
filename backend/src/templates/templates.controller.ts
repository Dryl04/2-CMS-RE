import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplatesService } from './templates.service';

@Controller('api/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll() {
    return this.templatesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateTemplateDto, @CurrentUser() user: JwtUser) {
    return this.templatesService.create(dto, user);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @Roles(Role.admin, Role.seo_manager)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.remove(id);
  }
}
