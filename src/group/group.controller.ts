import { SessionContainer } from 'supertokens-node/recipe/session';
import { Body, Controller, Post, Session } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @Session() session: SessionContainer,
  ) {
    const userId = session.getUserId();
    const createGroup = await this.groupService.createGroup(
      userId,
      createGroupDto,
    );
    return createGroup;
  }
}
