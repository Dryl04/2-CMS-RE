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
import { CreateSiteDomainDto } from "./dto/create-site-domain.dto";
import { UpdateSiteDomainDto } from "./dto/update-site-domain.dto";
import { SitesService } from "./sites.service";

const MANAGER_ROLES = [
  Role.admin,
  Role.seo_manager,
  Role.content_creator,
] as const;

@Controller("api/site-domains")
export class SiteDomainsController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  findAll() {
    return this.sitesService.findAllDomains();
  }

  @Roles(...MANAGER_ROLES)
  @Post()
  create(@Body() dto: CreateSiteDomainDto) {
    return this.sitesService.createDomain(dto);
  }

  @Roles(...MANAGER_ROLES)
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateSiteDomainDto,
  ) {
    return this.sitesService.updateDomain(id, dto);
  }

  @Roles(...MANAGER_ROLES)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.sitesService.removeDomain(id);
  }
}
