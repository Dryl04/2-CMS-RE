import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SiteDomainsController } from "./site-domains.controller";
import { SitesController } from "./sites.controller";
import { SitesService } from "./sites.service";

@Module({
  imports: [PrismaModule],
  controllers: [SitesController, SiteDomainsController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
