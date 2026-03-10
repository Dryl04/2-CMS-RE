import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GlobalHfService } from './global-hf.service';
import { CreateGlobalHfDto } from './dto/create-global-hf.dto';
import { UpdateGlobalHfDto } from './dto/update-global-hf.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Request } from 'express';

@Controller('api/global-hf')
export class GlobalHfController {
  constructor(private readonly globalHfService: GlobalHfService) {}

  @Public()
  @Get('public')
  findActive() {
    return this.globalHfService.findActive();
  }

  @Get()
  findAll() {
    return this.globalHfService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateGlobalHfDto, @Req() req: Request) {
    const user = req.user as { userId: string; email: string; role: string };
    return this.globalHfService.create(dto, user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGlobalHfDto) {
    return this.globalHfService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.globalHfService.activate(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.globalHfService.delete(id);
  }
}
