import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';
import { EntityExists } from 'src/common/validators/is-unique.validator';

export class CreateFileDto {
  @EntityExists(Prisma.ModelName.Group, 'id', true)
  @IsNotEmpty()
  @IsString()
  groupId: string;
}
