import { Query, Document, FilterQuery } from "mongoose";

export interface PaginationInfo {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  search?: string;
  populate?: string;
  [key: string]: any;
}
