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
import { RedirectsService } from './redirects.service';
import { CreateRedirectDto } from './dto/create-redirect.dto';
import { UpdateRedirectDto } from './dto/update-redirect.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Request } from 'express';

@Controller('api/redirects')
export class RedirectsController {
  constructor(private readonly redirectsService: RedirectsService) {}

  @Get()
  findAll() {
    return this.redirectsService.findAll();
  }

  @Get('by-source')
  findBySourcePath(@Query('source_path') sourcePath: string) {
    return this.redirectsService.findBySourcePath(sourcePath);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.redirectsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRedirectDto, @Req() req: Request) {
    const user = req.user as { userId: string; email: string; role: string };
    return this.redirectsService.create(dto, user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRedirectDto) {
    return this.redirectsService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'seo_manager')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.redirectsService.delete(id);
  }
}
