import { Role } from '@prisma/client';
import { UserWithoutPassword } from './serialization/user-without-password.serialization';
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
// import { Role } from './entities/user.entity';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(
    @Body() registerUserDto: CreateUserDto,
  ): Promise<{ message: string } | never> {
    await this.authService.create(registerUserDto);

    return { message: 'User successfully created now you can login' };
  }
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() LoginUserDto: LoginUserDto,
  ): Promise<{ message: string } | never> {
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

    return { message: 'User logged in!' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Session() session: SessionContainer,
  ): Promise<{ message: string }> {
    await session.revokeSession();
    return;
  }
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  @Roles(Role.USER)
  async me(@Session() session: SessionContainer) {
    const userID = session.getUserId();
    const user = await this.authService.findById(userID);
    if (!user) {
      await session.revokeSession();
      throw new UnauthorizedException();
    }
    return new UserWithoutPassword(user);
  }
}
