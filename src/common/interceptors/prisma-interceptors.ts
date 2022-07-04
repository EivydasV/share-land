import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';

@Injectable()
export class PrismaNotFoundInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
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
