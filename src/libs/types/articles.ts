export interface FindArticlesParams {
  page?: number;
  limit?: number;
  authorId?: string;
  published?: boolean;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
