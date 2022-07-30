import { Exclude, Expose } from 'class-transformer';
import { IPaginateFunction } from 'src/utils/prisma/pagination';

@Exclude()
export class PaginatedSerialization<T> implements IPaginateFunction<T> {
  @Expose()
  data: T;
  @Expose()
  count: number;
  @Expose()
  totalPages: number;
  @Expose()
  currentPage: number;
  @Expose()
  hasNextPage: boolean;
  @Expose()
  nextPage: number | null;
  @Expose()
  hasPreviousPage: boolean;
  @Expose()
  previousPage: number | null;
  @Expose()
  pageSize: number;

  constructor(partial: Partial<PaginatedSerialization<T>>) {
    Object.assign(this, partial);
  }
}
