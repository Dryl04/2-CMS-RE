import { Injectable, NotFoundException } from "@nestjs/common";
import { JwtUser } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRedirectDto } from "./dto/create-redirect.dto";
import { UpdateRedirectDto } from "./dto/update-redirect.dto";

@Injectable()
export class RedirectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.seoRedirect.findMany({
      include: {
        site: {
          include: {
            domains: true,
          },
        },
        sourcePage: true,
        targetPage: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  create(dto: CreateRedirectDto, user: JwtUser) {
    return this.prisma.seoRedirect.create({
      data: {
        siteId: dto.siteId,
        sourcePath: dto.sourcePath,
        targetPath: dto.targetPath,
        sourcePageId: dto.sourcePageId,
        targetPageId: dto.targetPageId,
        reason: dto.reason,
        isActive: dto.isActive ?? true,
        createdBy: user.userId,
      },
    });
  }

  async update(id: string, dto: UpdateRedirectDto) {
    await this.ensureExists(id);
    return this.prisma.seoRedirect.update({
      where: { id },
      data: {
        siteId: dto.siteId,
        sourcePath: dto.sourcePath,
        targetPath: dto.targetPath,
        sourcePageId: dto.sourcePageId,
        targetPageId: dto.targetPageId,
        reason: dto.reason,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.seoRedirect.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const redirect = await this.prisma.seoRedirect.findUnique({
      where: { id },
    });
    if (!redirect) {
      throw new NotFoundException(`Redirect ${id} not found`);
    }
  }
}
