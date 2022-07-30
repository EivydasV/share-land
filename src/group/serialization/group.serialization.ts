import { Group } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
export const GROUP_MY_CREATED_GROUPS = 'GROUP_MY_CREATED_GROUPS';
export const GROUP_GET_GROUPS = 'GROUP_GET_GROUPS';
export const GROUP_CREATE_GROUP = 'GROUP_CREATE_GROUP';
export const GROUP_JOINED_GROUPS = 'GROUP_JOINED_GROUPS';
@Exclude()
export class GroupSerialization implements Partial<Group> {
  @Expose({
    groups: [
      GROUP_MY_CREATED_GROUPS,
      GROUP_GET_GROUPS,
      GROUP_CREATE_GROUP,
      GROUP_JOINED_GROUPS,
    ],
  })
  id: string;
  @Expose({
    groups: [
      GROUP_MY_CREATED_GROUPS,
      GROUP_GET_GROUPS,
      GROUP_CREATE_GROUP,
      GROUP_JOINED_GROUPS,
    ],
  })
  name: string;
  @Expose({
    groups: [GROUP_MY_CREATED_GROUPS, GROUP_GET_GROUPS, GROUP_CREATE_GROUP],
  })
  isPublic: boolean;
  @Expose({ groups: [GROUP_MY_CREATED_GROUPS, GROUP_CREATE_GROUP] })
  createdAt: Date;
  @Expose({ groups: [GROUP_MY_CREATED_GROUPS, GROUP_CREATE_GROUP] })
  updatedAt: Date;
  @Expose({ groups: [GROUP_MY_CREATED_GROUPS, GROUP_CREATE_GROUP] })
  createdById: string;
  constructor(partial: Partial<GroupSerialization>) {
    Object.assign(this, partial);
  }
}
