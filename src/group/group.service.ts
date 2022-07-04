import { CreateGroupDto } from './dto/create-group.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroup(userId: string, createGroupDto: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        ...createGroupDto,
        createdBy: {
          connect: { id: userId },
        },
      },
    });
  }
}
