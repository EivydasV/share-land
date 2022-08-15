import { GroupService } from './../group/group.service';
import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';

@Module({
  imports: [],
  controllers: [InviteController],
  providers: [InviteService, GroupService],
})
export class InviteModule {}
