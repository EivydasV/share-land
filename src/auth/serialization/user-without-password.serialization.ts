import { Role } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
@Exclude()
export class UserWithoutPassword {
  @Expose()
  email: string;
  @Expose()
  name: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
  @Expose()
  roles: Role;

  constructor(partial: Partial<UserWithoutPassword>) {
    Object.assign(this, partial);
  }
}
