import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PageStatus } from '@prisma/client';
import { Request } from 'express';

@Controller('api/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Public()
  @Get('public/redirects')
  findPublicRedirect(@Query('source_path') sourcePath: string) {
    return this.pagesService.findPublicRedirect(sourcePath);
  }

  @Public()
  @Get('public/:pageKey')
  findPublicByPageKey(@Param('pageKey') pageKey: string) {
    return this.pagesService.findPublicByPageKey(pageKey);
  }

  @Get()
  findAll(
    @Query('status') status?: PageStatus,
    @Query('folder') folder?: string,
    @Query('userId') userId?: string,
    @Query('order') order?: string,
    @Query('limit') limit?: string,
    @Query('select') select?: string,
  ) {
    return this.pagesService.findAll({ status, folder, userId, order, limit: limit ? parseInt(limit, 10) : undefined, select });
  }

  @Get('by-key')
  findByPageKey(
    @Query('page_key') pageKey: string,
    @Query('status') status?: PageStatus,
  ) {
    return this.pagesService.findByPageKey(pageKey, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePageDto, @Req() req: Request) {
    const user = req.user as { userId: string; email: string; role: string };
    return this.pagesService.create(dto, user.userId);
  }

  @Post('bulk')
  upsertBulk(@Body() items: any[]) {
    return this.pagesService.upsertBulk(items);
  }

  @Post('upsert')
  upsert(@Body() items: any[]) {
    return this.pagesService.upsertBulk(items);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'seo_manager')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pagesService.delete(id);
  }
}
