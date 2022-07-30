import { Role } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DefaultSerialization {
  @Expose()
  message: string;

  constructor(partial: Partial<DefaultSerialization>) {
    Object.assign(this, partial);
  }
}
