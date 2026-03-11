import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateRedirectDto } from './dto/create-redirect.dto';
import { UpdateRedirectDto } from './dto/update-redirect.dto';
import { RedirectsService } from './redirects.service';

@Controller('api/redirects')
export class RedirectsController {
  constructor(private readonly redirectsService: RedirectsService) {}

  @Get()
  findAll() {
    return this.redirectsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateRedirectDto, @CurrentUser() user: JwtUser) {
    return this.redirectsService.create(dto, user);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRedirectDto) {
    return this.redirectsService.update(id, dto);
  }

  @Roles(Role.admin, Role.seo_manager)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.redirectsService.remove(id);
  }
}
