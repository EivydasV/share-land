import { EntityExists } from './../../common/validators/is-unique.validator';
import {
  IsAlpha,
  IsAlphanumeric,
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Prisma } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateGroupDto {
  @EntityExists(Prisma.ModelName.Group)
  @Length(2, 10)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Transform(({ value }: TransformFnParams) => value?.replace(/\s\s+/g, ' '))
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;
}
