import { SetMetadata } from '@nestjs/common';
// import { Role } from 'src/auth/entities/user.entity';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
