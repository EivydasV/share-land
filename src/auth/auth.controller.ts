import { DefaultSerialization } from './../common/serialization/DefaultSerialization.serialization';
import { Role } from '@prisma/client';
import { USER_ME, UserSerialization } from './serialization/user.serialization';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { Roles } from 'src/common/decorators/roles.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ForgotPasswordUserDto } from './dto/forgot-password.dto';
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordUserDto,
  ): Promise<DefaultSerialization> {
    const user = await this.authService.findByEmail(forgotPasswordDto.email);
    if (user) {
    }
    return { message: 'Check your email for a password reset link' };
  }
}
