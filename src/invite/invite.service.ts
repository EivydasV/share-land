import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInviteDto } from './dto/create-invite.dto';

@Injectable()
export class InviteService {
  constructor(private readonly prisma: PrismaService) {}
  async createInvite(invite: CreateInviteDto) {
    return this.prisma.invite.create({
      data: {
        group: { connect: { id: invite.groupId } },
        user: { connect: { id: invite.userId } },
        sentBy: { connect: { id: invite.sentById } },
      },
    });
  }
}
