import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable, catchError } from 'rxjs';

@Injectable()
export class PrismaNotFoundInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            const target = error.meta.target[0];
            throw new UnprocessableEntityException({
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              message: { [target]: `${target} is already exists` },
              error: 'Unprocessable Entity',
            });
          }
        }
        if (error?.message) {
          const words = error.message?.split(' ');

          if (words[0] === 'No' && words[2] === 'found')
            throw new NotFoundException(error?.message);
        }
        throw error;
      }),
    );
  }
}
