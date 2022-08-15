import { PartialType, PickType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';
import { Length, IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { EntityExists } from 'src/common/validators/is-unique.validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['name'] as const),
) {
  @Length(2, 50)
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Transform(({ value }: TransformFnParams) => value?.replace(/\s\s+/g, ' '))
  email: string;
}
