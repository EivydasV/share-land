import { Role, User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export const USER_ME = 'USER_ME';
export const USER_GROUP_PARTICIPANT = 'USER_GROUP_PARTICIPANT';
export const USER_GROUP_JOIN = 'USER_GROUP_JOIN';
@Exclude()
export class UserSerialization implements Partial<User> {
  @Expose({
    groups: [USER_ME, USER_GROUP_PARTICIPANT, USER_GROUP_JOIN],
  })
  id: string;
  @Expose({ groups: [USER_ME] })
  email: string;
  @Expose({
    groups: [USER_ME, USER_GROUP_PARTICIPANT, USER_GROUP_JOIN],
  })
  name: string;
  @Expose({ groups: [USER_ME] })
  createdAt: Date;
  @Expose({ groups: [USER_ME] })
  updatedAt: Date;
  @Expose({ groups: [USER_ME] })
  role: Role;

  constructor(partial: Partial<UserSerialization>) {
    Object.assign(this, partial);
  }
}
