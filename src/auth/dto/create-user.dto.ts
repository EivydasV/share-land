import { EntityExists } from './../../common/validators/is-unique.validator';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { IsEqualTo } from 'src/common/validators/is-equal-to.valdiator';
import { IsStrongPassword } from 'src/common/validators/strong-password.valdiator';
import { Prisma } from '@prisma/client';

export class CreateUserDto {
  @Length(2, 50)
  @IsNotEmpty()
  @IsString()
  name: string;

  @EntityExists(Prisma.ModelName.User)
  @Length(2, 50)
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsEqualTo('password')
  password_confirmation: string;
}
