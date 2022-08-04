import { DefaultSerialization } from './../common/serialization/DefaultSerialization.serialization';
import { USER_ME, UserSerialization } from './serialization/user.serialization';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
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
import { add, isFuture, isPast } from 'date-fns';
import { nanoid } from 'nanoid';
import { ResetPasswordUserDto } from './dto/reset-password.dto';
import timingSafeCompare from 'tsscmp';
import argon from 'argon2';

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
    const user = await this.authService.login(LoginUserDto);

    if (
      !user ||
      !(await this.authService.comparePassword(
        user.password,
        LoginUserDto.password,
      ))
    ) {
      throw new BadRequestException('Invalid credentials');
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
    if (!user) {
      await session.revokeSession();
      throw new UnauthorizedException();
    }

    return new UserSerialization(user);
  }
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordUserDto,
  ): Promise<DefaultSerialization> {
    const user = await this.authService.findByEmail(forgotPasswordDto.email);
    if (user) {
      const token = nanoid(128);
      const date = add(new Date(), { hours: 2 });
      await this.authService.createPasswordResetToken(user.email, token, date);
      await this.sendGridService.send({
        to: 'eivydasvickus@gmail.com',
        html: `<h3>Reset your password token: ${token}</h3>`,
        subject: 'Reset your password',
      });
    }
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
      !user ||
      isPast(user.resetPasswordTokenExpiresAt) ||
      !user.resetPasswordToken ||
      !(await argon.verify(user.resetPasswordToken, token))
    )
      throw new ForbiddenException();
    const updatePasswordPromise = this.authService.updatePassword(
      userId,
      resetPasswordDto.password,
    );
    const removePasswordResetTokenPromise =
      this.authService.removePasswordResetToken(userId);
    await Promise.all([updatePasswordPromise, removePasswordResetTokenPromise]);
    return { message: 'Your password successfully updated' };
  }
}
