import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SitesModule } from "../sites/sites.module";
import { PublishingController } from "./publishing.controller";
import { PublishingService } from "./publishing.service";

@Module({
  imports: [PrismaModule, SitesModule],
  controllers: [PublishingController],
  providers: [PublishingService],
})
export class PublishingModule {}
