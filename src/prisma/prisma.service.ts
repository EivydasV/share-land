import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import * as argon from 'argon2';
console.log(new Date());

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    this.$use(async (params, next) => {
      const user = params.args?.data as User;
      if (user?.password) {
        user.password = await argon.hash(user.password);
      }
      if (user?.resetPasswordToken) {
        user.resetPasswordToken = await argon.hash(user.resetPasswordToken);
      }

      return next(params);
    });
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
