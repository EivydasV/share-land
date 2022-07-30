import { CreateGroupDto } from './dto/create-group.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  createPrismaCursorPagination,
  createPrismaOffsetPagination,
} from 'src/utils/prisma/pagination';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroup(authId: string, createGroupDto: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        ...createGroupDto,
        createdBy: {
          connect: { id: authId },
        },
      },
    });
  }
  async getMyCreatedGroups(authId: string) {
    return this.prisma.group.findMany({
      where: {
        createdById: authId,
      },
    });
  }
  async getGroups() {
    return this.prisma.group.findMany();
  }
  async getGroupParticipants(groupId: string, page: number) {
    const { take, skip, paginate } = createPrismaOffsetPagination({
      page,
      pageSize: 2,
    });
    const query = await this.prisma.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        _count: { select: { participants: true } },
        participants: { skip, take },
      },
    });

    return paginate(query.participants, query._count.participants);
  }
  async userBelongsToRoom(authId: string, groupId: string) {
    const query = await this.prisma.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        participants: {
          take: 1,
          where: {
            id: authId,
          },
        },
      },
    });
    return query.participants.length > 0;
  }
  async getGroupById(groupId: string) {
    return this.prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });
  }
  async joinGroup(authId: string, groupId: string) {
    return this.prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        participants: {
          connect: {
            id: authId,
          },
        },
      },
      select: {
        participants: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }
  async findUserGroup(authId: string, groupId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: authId,
      },
      select: {
        group: {
          where: {
            id: groupId,
          },
        },
      },
    });
  }
  async leaveGroup(authId: string, groupId: string) {
    return this.prisma.user.update({
      where: {
        id: authId,
      },
      data: {
        group: {
          disconnect: {
            id: groupId,
          },
        },
      },
      select: {
        group: true,
      },
    });
  }
  async deleteGroup(groupId: string) {
    return this.prisma.group.delete({
      where: {
        id: groupId,
      },
    });
  }
  async joinedGroups(authId: string, cursor?: string) {
    const {
      cursor: pageCursor,
      take,
      skip,
      paginate,
    } = createPrismaCursorPagination({
      cursor,
    });
    const query = await this.prisma.group.findMany({
      cursor: pageCursor,
      take,
      skip,
      where: {
        participants: {
          some: {
            id: authId,
          },
        },
      },
    });
    return paginate(query);
  }
}
