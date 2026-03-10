import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { PagesModule } from './pages/pages.module';
import { TemplatesModule } from './templates/templates.module';
import { MediaModule } from './media/media.module';
import { ThemesModule } from './themes/themes.module';
import { RedirectsModule } from './redirects/redirects.module';
import { GlobalHfModule } from './global-hf/global-hf.module';
import { ProfilesModule } from './profiles/profiles.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StorageModule,
    PagesModule,
    TemplatesModule,
    MediaModule,
    ThemesModule,
    RedirectsModule,
    GlobalHfModule,
    ProfilesModule,
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
