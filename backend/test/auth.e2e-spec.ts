import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Role, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const makeUser = (overrides: Partial<User> = {}): User => ({
    id: "9bdcdbb7-97fd-4fa4-bd3b-162a2675a1f1",
    email: "editor@example.com",
    passwordHash:
      "$2b$10$dtzvq0oJvLCYOtJk9gDC7u3PyXapnwXCfJOLLmObEWj1vDLteA94m",
    mustChangePassword: false,
    fullName: "Editor",
    role: Role.content_creator,
    avatarUrl: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for invalid registration payloads", async () => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email: "invalid", password: "short" })
      .expect(400);
  });

  it("registers a user without hitting a real database", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(
      async ({ data }: { data: User }) =>
        makeUser({
          email: data.email,
          fullName: data.fullName,
          passwordHash: data.passwordHash,
        }),
    );

    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "new@example.com",
        password: "StrongPass123",
        fullName: "New Editor",
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
        user: expect.objectContaining({
          email: "new@example.com",
          role: Role.content_creator,
          mustChangePassword: false,
        }),
      }),
    );
  });

  it("logs in and exposes the current user profile", async () => {
    const passwordHash = await bcrypt.hash("StrongPass123", 10);
    const user = makeUser({ passwordHash });

    prismaMock.user.findUnique.mockResolvedValue(user);

    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "editor@example.com",
        password: "StrongPass123",
      })
      .expect(200);

    await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.email).toBe("editor@example.com");
        expect(body.mustChangePassword).toBe(false);
        expect(body).not.toHaveProperty("passwordHash");
      });
  });

  it("blocks business routes until a temporary password is changed", async () => {
    const temporaryPasswordHash = await bcrypt.hash("ChangeMe123!", 10);
    const flaggedUser = makeUser({
      mustChangePassword: true,
      passwordHash: temporaryPasswordHash,
    });
    const changedUser = makeUser({
      mustChangePassword: false,
    });

    prismaMock.user.findUnique.mockResolvedValue(flaggedUser);
    prismaMock.user.update.mockResolvedValue(changedUser);

    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "editor@example.com",
        password: "ChangeMe123!",
      })
      .expect(200);

    await request(app.getHttpServer())
      .get("/api/pages")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`)
      .expect(403)
      .expect(({ body }) => {
        expect(body.message).toBe(
          "Password change required before accessing this resource",
        );
      });

    await request(app.getHttpServer())
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${loginResponse.body.access_token}`)
      .send({
        currentPassword: "ChangeMe123!",
        newPassword: "StrongPass456!",
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.user.mustChangePassword).toBe(false);
      });
  });

  it("rejects unauthenticated access to /auth/me", async () => {
    await request(app.getHttpServer()).get("/auth/me").expect(401);
  });
});
