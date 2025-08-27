
import { UpdateAdminDto } from './dto/admin.dto';

import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateAdminDto } from './dto/admin.dto';
import { PrismaErrorHandler } from '../common/utils';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async findAll() {
    const admins = await this.prisma.admin.findMany();
    const safeAdmins = admins.map(a => {
      const { password, ...rest } = a;
      return rest;
    });
    return safeAdmins;
  }

  async findOne(id: number) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException(`Admin with ID ${id} not found`);
    const { password, ...rest } = admin;
    return rest;
  }

  async update(id: number, dto: UpdateAdminDto) {
    const exists = await this.prisma.admin.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    const updateData: any = {};

    // Only include fields that are provided in the request body
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.gender !== undefined) updateData.gender = dto.gender;

    // Special handling for password
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
    }

    // Special handling for birthDate to convert to Date object
    if (dto.birthDate) {
      updateData.birthDate = new Date(dto.birthDate);
    }

    try {
      const admin = await this.prisma.admin.update({
        where: { id },
        data: updateData,
      });
      const { password, ...rest } = admin;
      return rest;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Admin', id);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.admin.delete({ where: { id } });
      return null;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Admin', id);
    }
  }

  async register(data: CreateAdminDto) {
    const existing = await this.prisma.admin.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');
    const hash = await bcrypt.hash(data.password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);

    const adminData: any = { ...data };

    // Ensure date is in full ISO format
    adminData.birthDate = new Date(data.birthDate);
    adminData.password = hash;

    try {
      const admin = await this.prisma.admin.create({
        data: adminData
      });
      const { password, ...userData } = admin;
      return userData;
    } catch (error) {
      PrismaErrorHandler.handleError(error, 'Admin');
    }
  }

  async validateAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) return null;
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return null;
    return admin;
  }

  async login(email: string, password: string) {
    const admin = await this.validateAdmin(email, password);
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: admin.id, email: admin.email };

    // Exclude password from response
    const { password: hashedPassword, ...userData } = admin;

    return {
      user: userData,
      access_token: this.jwtService.sign(payload),
    };
  }
}
