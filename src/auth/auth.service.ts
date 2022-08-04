import { Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async login(loginUserDto: LoginUserDto) {
    return this.prisma.user.findUnique({
      where: {
        email: loginUserDto.email,
      },
    });
  }
  async comparePassword(hash: string, candidate: string): Promise<boolean> {
    return argon.verify(hash, candidate);
  }
  async create(registerUserDto: CreateUserDto) {
    const { email, name, password } = registerUserDto;

    return this.prisma.user.create({
      data: {
        email,
        name,
        password,
      },
    });
  }
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
  async createPasswordResetToken(email: string, token: string, date: Date) {
    const hashedToken = await argon.hash(token);
    return this.prisma.user.update({
      where: {
        email,
      },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpiresAt: date,
      },
    });
  }
  async removePasswordResetToken(userId: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
      },
    });
  }
  async updatePassword(userId: string, password: string) {
    // const hashedPassword = await argon.hash(password);
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: password,
      },
    });
  }
}
