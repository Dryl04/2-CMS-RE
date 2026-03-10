import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Profile with id "${id}" not found`);
    }
    const { passwordHash, ...profile } = user;
    return profile;
  }

  async create(data: any) {
    // Profile is created during registration, this is for admin use
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: '',  // Will need to be set via password reset
        fullName: data.full_name,
        role: data.role || 'content_creator',
        avatarUrl: data.avatar_url,
      },
    });
    const { passwordHash, ...profile } = user;
    return profile;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const updateData: any = {};
    if (data.full_name !== undefined) updateData.fullName = data.full_name;
    if (data.avatar_url !== undefined) updateData.avatarUrl = data.avatar_url;
    if (data.role !== undefined) updateData.role = data.role;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    const { passwordHash, ...profile } = user;
    return profile;
  }
}
