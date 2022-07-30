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
}
