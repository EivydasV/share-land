import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import supertokens from 'supertokens-node';
import { SupertokensExceptionFilter } from './auth/auth.filter';
import { useContainer } from 'class-validator';
import { PrismaNotFoundInterceptor } from './common/interceptors/prisma-interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1/api');

  app.use(helmet());

  app.useGlobalInterceptors(new PrismaNotFoundInterceptor());
  app.enableCors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
  });

  app.useGlobalFilters(new SupertokensExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidUnknownValues: true,
      // exceptionFactory: (validationErrors: ValidationError[] = []) => {
      //   console.log(validationErrors);

      //   const errors = validationErrors.reduce(
      //     (acc, curr) => ({
      //       [curr.property]: curr.constraints[Object.keys(curr.constraints)[0]],
      //     }),
      //     {},
      //   );
      //   throw new HttpException(
      //     {
      //       status: HttpStatus.UNPROCESSABLE_ENTITY,
      //       validationErrors: errors,
      //     },
      //     HttpStatus.UNPROCESSABLE_ENTITY,
      //   );
      // },
    }),
  );

  await app.listen(5000);
}
bootstrap();
