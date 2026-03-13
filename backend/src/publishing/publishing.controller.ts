import { Controller, Get, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { Public } from "../auth/decorators/public.decorator";
import { getPublicRequestContext } from "./public-request.util";
import { PublishingService } from "./publishing.service";

@Controller()
export class PublishingController {
  constructor(private readonly publishingService: PublishingService) {}

  @Public()
  @Get("robots.txt")
  async getRobotsTxt(@Req() request: Request, @Res() response: Response) {
    const result = await this.publishingService.getRobotsTxt(
      getPublicRequestContext(request),
    );

    if (result.type === "redirect") {
      return response.redirect(308, result.redirectUrl);
    }

    return response.type("text/plain").send(result.content);
  }

  @Public()
  @Get("sitemap.xml")
  async getSitemapXml(@Req() request: Request, @Res() response: Response) {
    const result = await this.publishingService.getSitemapXml(
      getPublicRequestContext(request),
    );

    if (result.type === "redirect") {
      return response.redirect(308, result.redirectUrl);
    }

    return response.type("application/xml").send(result.content);
  }

  @Public()
  @Get(".well-known/cms-domain-verification.txt")
  async getVerificationFile(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await this.publishingService.getVerificationFile(
      getPublicRequestContext(request),
    );

    return response.type("text/plain").send(result.content);
  }
}
