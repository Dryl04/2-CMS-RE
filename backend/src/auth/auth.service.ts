import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload, JwtUser } from "./auth.types";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

const SALT_ROUNDS = 10;

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: Role;
    mustChangePassword: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        mustChangePassword: false,
        fullName: dto.fullName?.trim() || null,
        role: Role.content_creator,
      },
    });

    return this.buildAuthResponse(user);
  }

  async changePassword(
    currentUser: JwtUser,
    dto: ChangePasswordDto,
  ): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
    });

    if (!user) {
      throw new NotFoundException("Authenticated user was not found");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Current password is invalid");
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        "The new password must be different from the current password",
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    const updatedUser = await this.prisma.user.update({
      where: { id: currentUser.userId },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    return this.buildAuthResponse(updatedUser);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.buildAuthResponse(user);
  }

  async me(currentUser: JwtUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
    });

    if (!user) {
      throw new NotFoundException("Authenticated user was not found");
    }

    return this.serializeUser(user);
  }

  async updateProfile(currentUser: JwtUser, dto: UpdateProfileDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
    });

    if (!user) {
      throw new NotFoundException("Authenticated user was not found");
    }

    let emailToUpdate = user.email;
    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      if (email !== user.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new ConflictException("A user with this email already exists");
        }
        emailToUpdate = email;
      }
    }

    let fullNameToUpdate = user.fullName;
    if (dto.fullName !== undefined) {
      fullNameToUpdate = dto.fullName?.trim() || null;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: currentUser.userId },
      data: {
        email: emailToUpdate,
        fullName: fullNameToUpdate,
      },
    });

    return this.buildAuthResponse(updatedUser);
  }

  async logout() {
    return { success: true };
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      mustChangePassword: user.mustChangePassword,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: this.serializeUser(user),
    };
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
