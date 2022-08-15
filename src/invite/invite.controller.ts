import { GroupService } from './../group/group.service';
import {
  Body,
  Controller,
  Post,
  Session,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InviteService } from './invite.service';
import { SessionContainer } from 'supertokens-node/recipe/session';

@Controller('invite')
export class InviteController {
  constructor(
    private readonly inviteService: InviteService,
    private readonly groupService: GroupService,
  ) {}

  @Post()
  async createInvite(
    @Session() session: SessionContainer,
    @Body() createInviteDto: CreateInviteDto,
  ) {
    const authId = session.getUserId();
    const group = await this.groupService.getGroupById(createInviteDto.groupId);
    if (group.createdById !== authId) {
      throw new UnauthorizedException();
    }
    await this.

    return this.inviteService.createInvite(createInviteDto);
  }
}
