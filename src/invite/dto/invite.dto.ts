import { IsNotEmpty, IsString } from 'class-validator';

export class InviteDto {
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  sentById: string;
}
