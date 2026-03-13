import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = new Logger("Bootstrap");
  const configService = app.get(ConfigService);
  const allowedOrigins = resolveCorsOrigins(configService);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin not allowed: ${origin}`), false);
    },
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Site-Host",
      "X-Site-Protocol",
      "X-Forwarded-Host",
      "X-Forwarded-Proto",
    ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableShutdownHooks();

  const port = configService.get<number>("PORT", 3001);
  const host = configService.get<string>("HOST", "0.0.0.0");
  await app.listen(port, host);
  logger.log(`Backend listening on http://${host}:${port}`);
}

function resolveCorsOrigins(configService: ConfigService) {
  const configuredOrigins =
    configService.get<string>("CORS_ORIGINS") ??
    configService.get<string>("CORS_ORIGIN") ??
    "http://localhost:5173";

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

bootstrap().catch((error) => {
  const logger = new Logger("Bootstrap");
  logger.error(
    "Failed to start backend",
    error instanceof Error ? error.stack : String(error),
  );
  process.exit(1);
});
