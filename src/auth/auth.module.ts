import { MiddlewareConsumer, Module } from '@nestjs/common';

import { AuthMiddleware } from './auth.middleware';
import { SupertokensService } from './supertokens/supertokens.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CaslModule } from 'src/casl/casl.module';
import { ConfigurableModuleClass } from './auth.module-definition';

@Module({
  imports: [CaslModule],
  providers: [SupertokensService, AuthService],
  controllers: [AuthController],
})
export class AuthModule extends ConfigurableModuleClass {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
