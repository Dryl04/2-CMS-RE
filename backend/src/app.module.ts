import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { resolve } from "node:path";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { GlobalHfModule } from "./global-hf/global-hf.module";
import { MediaModule } from "./media/media.module";
import { PagesModule } from "./pages/pages.module";
import { PublishingModule } from "./publishing/publishing.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RedirectsModule } from "./redirects/redirects.module";
import { SitesModule } from "./sites/sites.module";
import { StorageModule } from "./storage/storage.module";
import { TemplatesModule } from "./templates/templates.module";
import { ThemesModule } from "./themes/themes.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), ".env"),
        resolve(process.cwd(), "../.env"),
      ],
    }),
    ServeStaticModule.forRootAsync({
      useFactory: () => {
        const uploadsDir = process.env.UPLOADS_DIR ?? "./uploads";
        const rootPath = uploadsDir.startsWith("/")
          ? uploadsDir
          : resolve(process.cwd(), uploadsDir);

        return [
          {
            rootPath,
            serveRoot: process.env.UPLOADS_PUBLIC_PATH ?? "/uploads",
            serveStaticOptions: {
              index: false,
            },
          },
        ];
      },
    }),
    PrismaModule,
    StorageModule,
    AuthModule,
    PagesModule,
    PublishingModule,
    TemplatesModule,
    MediaModule,
    ThemesModule,
    RedirectsModule,
    GlobalHfModule,
    SitesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
