import { AuthGuard } from './common/guards/auth.guard';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './common/guards/role.guard';
import { LoggingMiddleware } from './common/middlewares/logging.middleware';
import { ConfigModule } from '@nestjs/config';
import { EntityExistsConstrains } from './common/validators/is-unique.validator';
// import { EntityExistsConstrains } from './common/validators/is-unique.validator';
import { PrismaModule } from './prisma/prisma.module';
import { GroupModule } from './group/group.module';
import { FileModule } from './file/file.module';
import { InviteModule } from './invite/invite.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule.forRoot({
      // try.supertokens.com is for demo purposes. Replace this with the address of your core instance (sign up on supertokens.com), or self host a core.
      connectionURI: 'https://try.supertokens.com',
      // apiKey: "IF YOU HAVE AN API KEY FOR THE CORE, ADD IT HERE",
      appInfo: {
        // Learn more about this on https://supertokens.com/docs/session/appinfo
        appName: 'eivydas',
        apiDomain: 'http://localhost:5000',
        websiteDomain: 'http://localhost:3000',
        apiBasePath: '/auth',
        websiteBasePath: '/auth',
      },
    }),
    PrismaModule,
    GroupModule,
    FileModule,
    InviteModule,
  ],
  controllers: [],
  providers: [
    EntityExistsConstrains,
    AuthModule,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
