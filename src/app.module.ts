import { AuthGuard } from './common/guards/auth.guard';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './common/guards/role.guard';
import { LoggingMiddleware } from './common/middlewares/logging.middleware';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { EntityExistsConstrains } from './common/validators/is-unique.validator';
import { PrismaModule } from './prisma/prisma.module';
import { GroupModule } from './group/group.module';
import { FileModule } from './file/file.module';
import { InviteModule } from './invite/invite.module';
import { CaslModule } from './casl/casl.module';
import { AwsModule } from './aws/aws.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import authConfig from './auth/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true }),
    AuthModule.forRootAsync({
      inject: [authConfig.KEY],
      imports: [ConfigModule.forFeature(authConfig)],
      useFactory: (config: ConfigType<typeof authConfig>) => {
        return {
          connectionURI: config.CONNECTION_URI,
          appInfo: {
            appName: config.appInfo.APP_NAME,
            apiDomain: config.appInfo.API_DOMAIN,
            websiteDomain: config.appInfo.WEBSITE_DOMAIN,
            apiBasePath: config.appInfo.API_BASE_PATH,
            websiteBasePath: config.appInfo.WEBSITE_BASE_PATH,
          },
        };
      },
    }),
    PrismaModule,
    GroupModule,
    FileModule,
    InviteModule,
    CaslModule,
    AwsModule,
    SendgridModule,
  ],
  controllers: [],
  providers: [
    EntityExistsConstrains,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
