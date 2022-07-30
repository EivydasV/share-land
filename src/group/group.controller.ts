import {
  USER_GROUP_PARTICIPANT,
  USER_GROUP_JOIN,
} from './../auth/serialization/user.serialization';
import { SessionContainer } from 'supertokens-node/recipe/session';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  SerializeOptions,
  Session,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupService } from './group.service';
import { CreateGroupParticipantDto } from './dto/create-group-participant.dto';
import { UserSerialization } from 'src/auth/serialization/user.serialization';
import { DefaultSerialization } from 'src/common/serialization/DefaultSerialization.serialization';
import { PaginatedSerialization } from 'src/common/serialization/PaginatedSerialization.serialization';
import {
  GroupSerialization,
  GROUP_CREATE_GROUP,
  GROUP_GET_GROUPS,
  GROUP_JOINED_GROUPS,
  GROUP_MY_CREATED_GROUPS,
} from './serialization/group.serialization';
import { CursorPaginatedSerialization } from 'src/common/serialization/CursorPaginatedSerialization.serialization';

@Controller('group')
@UseInterceptors(ClassSerializerInterceptor)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @SerializeOptions({ groups: [GROUP_CREATE_GROUP] })
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @Session() session: SessionContainer,
  ): Promise<GroupSerialization> {
    const authId = session.getUserId();
    console.log(createGroupDto);

    const createGroup = await this.groupService.createGroup(
      authId,
      createGroupDto,
    );
    this.groupService.joinGroup(authId, createGroup.id);
    return new GroupSerialization(createGroup);
  }
  @Get('/my-created-groups')
  @SerializeOptions({ groups: [GROUP_MY_CREATED_GROUPS] })
  async getMyCreatedGroups(
    @Session() session: SessionContainer,
  ): Promise<GroupSerialization[]> {
    const userId = session.getUserId();
    const myCreatedGroups = await this.groupService.getMyCreatedGroups(userId);
    return myCreatedGroups.map((group) => new GroupSerialization(group));
  }
  @Get()
  @SerializeOptions({ groups: [GROUP_GET_GROUPS] })
  async getGroups(): Promise<GroupSerialization[]> {
    const groups = await this.groupService.getGroups();
    return groups.map((group) => new GroupSerialization(group));
  }

  @HttpCode(HttpStatus.OK)
  @Post('/join-group')
  @SerializeOptions({
    groups: [USER_GROUP_JOIN],
  })
  async joinGroup(
    @Body() { groupId }: CreateGroupParticipantDto,
    @Session() session: SessionContainer,
  ): Promise<UserSerialization> {
    const authId = session.getUserId();
    const userBelongsToRoom = await this.groupService.userBelongsToRoom(
      authId,
      groupId,
    );
    if (userBelongsToRoom)
      throw new BadRequestException('user already in the room');
    const group = await this.groupService.getGroupById(groupId);
    if (!group.isPublic) throw new ForbiddenException();
    const joinGroup = await this.groupService.joinGroup(authId, groupId);

    return new UserSerialization(joinGroup.participants[0]);
  }

  @Get('/participants/:groupId')
  @SerializeOptions({ groups: [USER_GROUP_PARTICIPANT] })
  async getGroupParticipants(
    @Param('groupId') groupId: string,
    @Query('page', new DefaultValuePipe(1)) page: number,
  ): Promise<PaginatedSerialization<UserSerialization[]>> {
    const groupParticipants = await this.groupService.getGroupParticipants(
      groupId,
      page,
    );
    if (!groupParticipants) throw new NotFoundException();
    return new PaginatedSerialization({
      ...groupParticipants,
      data: groupParticipants.data.map((user) => new UserSerialization(user)),
    });
  }

  @Delete('/leave/:groupId')
  async leaveGroup(
    @Session() session: SessionContainer,
    @Param('groupId') groupId: string,
  ): Promise<DefaultSerialization> {
    const authId = session.getUserId();
    const userBelongsToRoom = await this.groupService.userBelongsToRoom(
      authId,
      groupId,
    );
    if (!userBelongsToRoom) throw new NotFoundException();
    await this.groupService.leaveGroup(authId, groupId);

    return { message: 'left group' };
  }

  @Delete('/delete/:groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroup(
    @Session() session: SessionContainer,
    @Param('groupId') groupId: string,
  ): Promise<void> {
    const authId = session.getUserId();
    const group = await this.groupService.getGroupById(groupId);
    if (!group) throw new NotFoundException();
    if (group.createdById !== authId) throw new ForbiddenException();
    await this.groupService.deleteGroup(groupId);
    return;
  }
  @Get('/joined-groups')
  @SerializeOptions({ groups: [GROUP_JOINED_GROUPS] })
  async joinedGroups(
    @Session() session: SessionContainer,
    @Query('cursor') cursor?: string,
  ): Promise<CursorPaginatedSerialization<GroupSerialization[]>> {
    const authId = session.getUserId();
    const joinedGroups = await this.groupService.joinedGroups(authId, cursor);
    return new CursorPaginatedSerialization({
      ...joinedGroups,
      data: joinedGroups.data.map((group) => new GroupSerialization(group)),
    });
  }
}
