import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { Request } from "express";
import { JwtUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { getPublicRequestContext } from "../publishing/public-request.util";
import { CreatePageDto } from "./dto/create-page.dto";
import { ListPagesQueryDto } from "./dto/list-pages.query.dto";
import { UpdatePageDto } from "./dto/update-page.dto";
import { PagesService } from "./pages.service";

const EDITOR_ROLES = [
  Role.admin,
  Role.seo_manager,
  Role.content_creator,
] as const;

@Controller("api/pages")
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Public()
  @Get("public/redirects")
  getPublicRedirects(@Req() request: Request) {
    return this.pagesService.getPublicRedirects(
      getPublicRequestContext(request).host ?? undefined,
    );
  }

  @Public()
  @Get("public-resolve/*")
  resolvePublicRoute(@Req() request: Request): Promise<unknown> {
    const pageKey = request.params[0];
    return this.pagesService.resolvePublicRoute(
      pageKey,
      getPublicRequestContext(request),
    );
  }

  @Public()
  @Get("public/*")
  getPublicPage(@Req() request: Request) {
    const pageKey = request.params[0];
    return this.pagesService.getPublicPage(
      pageKey,
      getPublicRequestContext(request).host ?? undefined,
    );
  }

  @Get()
  findAll(@Query() query: ListPagesQueryDto) {
    return this.pagesService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreatePageDto, @CurrentUser() user: JwtUser) {
    return this.pagesService.create(dto, user);
  }

  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Roles(...EDITOR_ROLES)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.pagesService.remove(id);
  }
}
