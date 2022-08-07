import { Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { add } from 'date-fns';
import { nanoid } from 'nanoid';
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
  async compareHash(hash: string, candidate: string): Promise<boolean> {
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
  async createPasswordResetToken(
    email: string,
    token: string = nanoid(128),
    date: Date = add(new Date(), { hours: 2 }),
  ) {
    const user = await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: date,
      },
    });
    return { user, token, date };
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
