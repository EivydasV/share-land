import { UpdateUserDto } from './dto/update-user.dto';
import { DefaultSerialization } from './../common/serialization/DefaultSerialization.serialization';
import { USER_ME, UserSerialization } from './serialization/user.serialization';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  SerializeOptions,
  Session,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import {
  createNewSession,
  SessionContainer,
} from 'supertokens-node/recipe/session';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ForgotPasswordUserDto } from './dto/forgot-password.dto';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { formatDistance, isPast } from 'date-fns';
import { ResetPasswordUserDto } from './dto/reset-password.dto';
import argon from 'argon2';
import superSession from 'supertokens-node/recipe/session';
import path from 'node:path';
import { UpdatePasswordDto } from './dto/update-password.dto';
import _ from 'lodash';
import diff from 'src/utils/diff';
import { User } from '@prisma/client';
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sendGridService: SendgridService,
  ) {}

  @Post('register')
  @Public()
  async register(
    @Body() registerUserDto: CreateUserDto,
  ): Promise<DefaultSerialization> {
    await this.authService.create(registerUserDto);

    return new DefaultSerialization({
      message: 'User successfully created now you can login',
    });
  }
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() LoginUserDto: LoginUserDto,
  ): Promise<DefaultSerialization> {
    const errMessage = 'No User found';
    let user: User;
    try {
      user = await this.authService.findByEmail(LoginUserDto.email);
    } catch (_e) {
      throw new BadRequestException(errMessage);
    }

    if (
      !(await this.authService.compareHash(
        user.password,
        LoginUserDto.password,
      ))
    ) {
      throw new BadRequestException(errMessage);
    }

    await createNewSession(res, user.id, { role: user.role });

    return new DefaultSerialization({ message: 'User logged in!' });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Session() session: SessionContainer): Promise<void> {
    await session.revokeSession();
    return;
  }

  @Get('/me')
  @SerializeOptions({ groups: [USER_ME] })
  async me(@Session() session: SessionContainer): Promise<UserSerialization> {
    const userID = session.getUserId();
    const user = await this.authService.findById(userID);

    return new UserSerialization(user);
  }
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordUserDto,
    @Headers('host') host: string,
  ): Promise<DefaultSerialization> {
    let user: User;
    try {
      user = await this.authService.findByEmail(forgotPasswordDto.email);
    } catch (_e) {
      return { message: 'Check your email for a password reset link' };
    }
    const { token, date } = await this.authService.createPasswordResetToken(
      user.email,
    );
    await this.sendGridService.send({
      to: 'eivydasvickus@gmail.com',
      html: `<p>Reset your password token: <h3>http://${path.join(
        host,
        '/v1/api/auth/reset-password/',
        token,
        user.id,
      )}</h3>
        <h4>Valid for <bold>${formatDistance(date, new Date())}</bold></h4>
        `,
      subject: 'Reset your password',
    });

    return { message: 'Check your email for a password reset link' };
  }
  @Public()
  @Put('reset-password/:token/:userId')
  async resetPassword(
    @Param('token') token: string,
    @Param('userId') userId: string,
    @Body() resetPasswordDto: ResetPasswordUserDto,
  ): Promise<DefaultSerialization> {
    const user = await this.authService.findById(userId);

    if (
      isPast(user.resetPasswordTokenExpiresAt) ||
      !user.resetPasswordToken ||
      !(await argon.verify(user.resetPasswordToken, token))
    ) {
      throw new ForbiddenException();
    }
    const updatePasswordPromise = this.authService.updatePassword(
      userId,
      resetPasswordDto.password,
    );
    const removePasswordResetTokenPromise =
      this.authService.removePasswordResetToken(userId);
    await Promise.all([updatePasswordPromise, removePasswordResetTokenPromise]);
    await superSession.revokeAllSessionsForUser(userId);

    return { message: 'Your password successfully updated' };
  }
  @Put('update-password')
  async updatePassword(
    @Session() session: SessionContainer,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<DefaultSerialization> {
    const authId = session.getUserId();
    const user = await this.authService.findById(authId);

    const comparePassword = await this.authService.compareHash(
      user.password,
      updatePasswordDto.currentPassword,
    );
    if (!comparePassword)
      throw new BadRequestException('wrong current password');
    await this.authService.updatePassword(
      authId,
      updatePasswordDto.newPassword,
    );
    return { message: 'Password successfully updated' };
  }
  @Put('update-user')
  async updateUser(
    @Session() session: SessionContainer,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const authId = session.getUserId();
    const user = await this.authService.findById(authId);
    const diffs = diff(user, updateUserDto);
    if (!diffs) throw new BadRequestException('No changes');
    const updatedUser = await this.authService.updateUser(authId, diffs);
    return updatedUser;
  }
}
