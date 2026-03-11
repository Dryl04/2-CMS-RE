import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { Role, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let authService: AuthService;
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const jwtServiceMock = {
    signAsync: jest.fn().mockResolvedValue("signed-jwt-token"),
  };

  const makeUser = (overrides: Partial<User> = {}): User => ({
    id: "c8922a1b-a253-4eb8-ae9f-f0b2fded35d7",
    email: "user@example.com",
    passwordHash:
      "$2b$10$5QuTUd/y6Bv0jNFKyctNm.1I.rO8p8bmWzxubUoil58x2oyWZMh1a",
    mustChangePassword: false,
    fullName: "CMS User",
    role: Role.content_creator,
    avatarUrl: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it("registers a new content creator and returns a JWT", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(
      async ({ data }: { data: User }) =>
        makeUser({
          email: data.email,
          fullName: data.fullName,
          passwordHash: data.passwordHash,
        }),
    );

    const result = await authService.register({
      email: "USER@example.com",
      password: "StrongPass123",
      fullName: "New User",
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
    });
    const createCall = prismaMock.user.create.mock.calls[0][0].data;
    expect(createCall.role).toBe(Role.content_creator);
    expect(createCall.passwordHash).not.toBe("StrongPass123");
    expect(await bcrypt.compare("StrongPass123", createCall.passwordHash)).toBe(
      true,
    );
    expect(result.access_token).toBe("signed-jwt-token");
    expect(result.user.email).toBe("user@example.com");
    expect(result.user.mustChangePassword).toBe(false);
  });

  it("rejects duplicate registrations", async () => {
    prismaMock.user.findUnique.mockResolvedValue(makeUser());

    await expect(
      authService.register({
        email: "user@example.com",
        password: "StrongPass123",
      }),
    ).rejects.toThrow(ConflictException);
  });

  it("rejects login when the password is invalid", async () => {
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({
        passwordHash: await bcrypt.hash("different-password", 10),
      }),
    );

    await expect(
      authService.login({
        email: "user@example.com",
        password: "StrongPass123",
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("changes the password and clears the must-change flag", async () => {
    const currentUser = makeUser({
      mustChangePassword: true,
      passwordHash: await bcrypt.hash("ChangeMe123!", 10),
    });
    const updatedUser = makeUser({
      mustChangePassword: false,
    });

    prismaMock.user.findUnique.mockResolvedValue(currentUser);
    prismaMock.user.update.mockResolvedValue(updatedUser);

    const result = await authService.changePassword(
      {
        userId: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
        fullName: currentUser.fullName,
        mustChangePassword: true,
      },
      {
        currentPassword: "ChangeMe123!",
        newPassword: "EvenStronger123!",
      },
    );

    const updateCall = prismaMock.user.update.mock.calls[0][0];
    expect(updateCall.data.mustChangePassword).toBe(false);
    expect(
      await bcrypt.compare("EvenStronger123!", updateCall.data.passwordHash),
    ).toBe(true);
    expect(result.user.mustChangePassword).toBe(false);
  });
});
