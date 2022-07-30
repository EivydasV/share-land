import { EntityExists } from './../../common/validators/is-unique.validator';
import { IsNotEmpty, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateGroupParticipantDto {
  @EntityExists(Prisma.ModelName.Group, 'id', true)
  @IsNotEmpty()
  @IsString()
  groupId: string;
}
