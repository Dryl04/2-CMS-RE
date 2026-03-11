import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload, JwtUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 10;

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: Role;
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
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName?.trim() || null,
        role: Role.content_creator,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async me(currentUser: JwtUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
    });

    if (!user) {
      throw new NotFoundException('Authenticated user was not found');
    }

    return this.serializeUser(user);
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
