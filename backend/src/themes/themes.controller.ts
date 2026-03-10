import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ThemesService } from './themes.service';
import { CreatePageThemeDto } from './dto/create-page-theme.dto';
import { UpdatePageThemeDto } from './dto/update-page-theme.dto';
import { CreateDaisyThemeDto } from './dto/create-daisy-theme.dto';
import { UpdateDaisyThemeDto } from './dto/update-daisy-theme.dto';
import { CreateFontDto } from './dto/create-font.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Request } from 'express';

@Controller('api/themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  // ── Page Themes ──────────────────────────────────────────────

  @Get('page')
  findAllPageThemes() {
    return this.themesService.findAllPageThemes();
  }

  @Post('page/migrate')
  migratePageThemes() {
    return this.themesService.migratePageThemes();
  }

  @Get('page/:id/is-custom')
  isCustomPageTheme(@Param('id') id: string) {
    return this.themesService.isCustomPageTheme(id);
  }

  @Get('page/:id')
  findOnePageTheme(@Param('id') id: string) {
    return this.themesService.findOnePageTheme(id);
  }

  @Post('page')
  createPageTheme(@Body() dto: CreatePageThemeDto, @Req() req: Request) {
    const user = req.user as { userId: string; email: string; role: string };
    return this.themesService.createPageTheme(dto, user.userId);
  }

  @Patch('page/:id')
  updatePageTheme(
    @Param('id') id: string,
    @Body() dto: UpdatePageThemeDto,
  ) {
    return this.themesService.updatePageTheme(id, dto);
  }

  @Delete('page/:id')
  deletePageTheme(@Param('id') id: string) {
    return this.themesService.deletePageTheme(id);
  }

  // ── DaisyUI Themes ──────────────────────────────────────────

  @Get('daisy/active')
  findActiveDaisyTheme() {
    return this.themesService.findActiveDaisyTheme();
  }

  @Get('daisy/usage/:slug')
  getDaisyThemeUsage(@Param('slug') slug: string) {
    return this.themesService.getDaisyThemeUsage(slug);
  }

  @Get('daisy')
  findAllDaisyThemes() {
    return this.themesService.findAllDaisyThemes();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put('daisy/active')
  setActiveDaisyTheme(@Body() body: { theme_id: string }) {
    return this.themesService.setActiveDaisyTheme(body.theme_id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('daisy')
  createDaisyTheme(@Body() dto: CreateDaisyThemeDto, @Req() req: Request) {
    const user = req.user as { userId: string; email: string; role: string };
    return this.themesService.createDaisyTheme(dto, user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch('daisy/:id')
  updateDaisyTheme(
    @Param('id') id: string,
    @Body() dto: UpdateDaisyThemeDto,
  ) {
    return this.themesService.updateDaisyTheme(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete('daisy/:id')
  deleteDaisyTheme(@Param('id') id: string) {
    return this.themesService.deleteDaisyTheme(id);
  }

  // ── Classic Themes ────────────────────────────────────────────

  @Get('classic')
  findAllClassicThemes() {
    return this.themesService.findAllClassicThemes();
  }

  @Post('classic/initialize')
  initializeClassicThemes() {
    return this.themesService.initializeClassicThemes();
  }

  @Post('classic/apply')
  applyClassicTheme(@Body() body: { page_id: string; theme_id: string }) {
    return this.themesService.applyClassicTheme(body.page_id, body.theme_id);
  }

  @Post('classic')
  createClassicTheme(@Body() body: any, @Req() req: Request) {
    const user = req.user as { userId: string; email: string; role: string };
    return this.themesService.createClassicTheme(body, user.userId);
  }

  @Patch('classic/:id')
  updateClassicTheme(@Param('id') id: string, @Body() body: any) {
    return this.themesService.updateClassicTheme(id, body);
  }

  @Delete('classic/:id')
  deleteClassicTheme(@Param('id') id: string) {
    return this.themesService.deleteClassicTheme(id);
  }

  // ── Fonts Library ───────────────────────────────────────────

  @Get('fonts')
  findAllFonts() {
    return this.themesService.findAllFonts();
  }

  @Post('fonts')
  createFont(@Body() dto: CreateFontDto, @Req() req: Request) {
    const user = req.user as { userId: string; email: string; role: string };
    return this.themesService.createFont(dto, user.userId);
  }

  @Delete('fonts/:id')
  deleteFont(@Param('id') id: string) {
    return this.themesService.deleteFont(id);
  }
}
