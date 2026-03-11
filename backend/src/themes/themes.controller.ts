import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateDaisyThemeDto } from './dto/create-daisy-theme.dto';
import { CreateFontDto } from './dto/create-font.dto';
import { CreatePageThemeDto } from './dto/create-page-theme.dto';
import { UpdateDaisyThemeDto } from './dto/update-daisy-theme.dto';
import { UpdatePageThemeDto } from './dto/update-page-theme.dto';
import { ThemesService } from './themes.service';

@Controller()
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get('api/themes/page')
  listPageThemes() {
    return this.themesService.listPageThemes();
  }

  @Post('api/themes/page')
  createPageTheme(@Body() dto: CreatePageThemeDto, @CurrentUser() user: JwtUser) {
    return this.themesService.createPageTheme(dto, user);
  }

  @Patch('api/themes/page/:id')
  updatePageTheme(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePageThemeDto) {
    return this.themesService.updatePageTheme(id, dto);
  }

  @Delete('api/themes/page/:id')
  removePageTheme(@Param('id', ParseUUIDPipe) id: string) {
    return this.themesService.removePageTheme(id);
  }

  @Get('api/themes/daisy')
  listDaisyThemes() {
    return this.themesService.listDaisyThemes();
  }

  @Roles(Role.admin)
  @Post('api/themes/daisy')
  createDaisyTheme(@Body() dto: CreateDaisyThemeDto, @CurrentUser() user: JwtUser) {
    return this.themesService.createDaisyTheme(dto, user);
  }

  @Roles(Role.admin)
  @Patch('api/themes/daisy/:id')
  updateDaisyTheme(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDaisyThemeDto) {
    return this.themesService.updateDaisyTheme(id, dto);
  }

  @Roles(Role.admin)
  @Delete('api/themes/daisy/:id')
  removeDaisyTheme(@Param('id', ParseUUIDPipe) id: string) {
    return this.themesService.removeDaisyTheme(id);
  }

  @Get('api/fonts')
  listFonts() {
    return this.themesService.listFonts();
  }

  @Post('api/fonts')
  createFont(@Body() dto: CreateFontDto, @CurrentUser() user: JwtUser) {
    return this.themesService.createFont(dto, user);
  }

  @Roles(Role.admin)
  @Delete('api/fonts/:id')
  removeFont(@Param('id', ParseUUIDPipe) id: string) {
    return this.themesService.removeFont(id);
  }
}
