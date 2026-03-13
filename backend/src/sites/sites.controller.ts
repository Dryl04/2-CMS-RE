import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateSiteDto } from "./dto/create-site.dto";
import { UpdateSiteDto } from "./dto/update-site.dto";
import { SitesService } from "./sites.service";

const MANAGER_ROLES = [
  Role.admin,
  Role.seo_manager,
  Role.content_creator,
] as const;

@Controller("api/sites")
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  findAll() {
    return this.sitesService.findAllSites();
  }

  @Roles(...MANAGER_ROLES)
  @Post()
  create(@Body() dto: CreateSiteDto) {
    return this.sitesService.createSite(dto);
  }

  @Roles(...MANAGER_ROLES)
  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateSiteDto) {
    return this.sitesService.updateSite(id, dto);
  }

  @Roles(...MANAGER_ROLES)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.sitesService.removeSite(id);
  }
}
