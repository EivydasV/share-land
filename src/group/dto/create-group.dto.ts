import { EntityExists } from './../../common/validators/is-unique.validator';
import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateGroupDto {
  @EntityExists(Prisma.ModelName.Group)
  @Length(2, 50)
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;
}
