import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePageDto } from './dto/create-page.dto';
import { ListPagesQueryDto } from './dto/list-pages.query.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';

@Controller('api/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Public()
  @Get('public/redirects')
  getPublicRedirects() {
    return this.pagesService.getPublicRedirects();
  }

  @Public()
  @Get('public/*')
  getPublicPage(@Req() request: Request) {
    const pageKey = request.params[0];
    return this.pagesService.getPublicPage(pageKey);
  }

  @Get()
  findAll(@Query() query: ListPagesQueryDto) {
    return this.pagesService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreatePageDto, @CurrentUser() user: JwtUser) {
    return this.pagesService.create(dto, user);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Roles(Role.admin, Role.seo_manager)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.remove(id);
  }
}
