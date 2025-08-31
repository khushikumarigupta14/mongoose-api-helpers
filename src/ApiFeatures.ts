import { Query, Document, FilterQuery } from "mongoose";
import { QueryString, PaginationInfo } from "./types";

/**
 * ApiFeatures
 * Provides advanced API query functionality: filtering, search, sorting, field limiting,
 * pagination, and population.
 *
 * @template T - Mongoose Document type
 */
export class ApiFeatures<T extends Document> {
  public query: Query<T[], T>;
  public queryString: QueryString;
  public total: number | null;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
    this.total = null;
  }

  /**
   * Apply filtering based on query parameters
   */
  async filter(): Promise<this> {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search", "populate"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Replace operators with MongoDB syntax
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in|nin|eq|ne|regex|options)\b/g,
      (match) => `$${match}`,
    );

    const filters = JSON.parse(queryStr);

    // Handle date filtering
    if (filters.date) {
      const dateFilter: Partial<{ $gte?: Date; $lte?: Date }> = {};
      if (filters.date.$gte) dateFilter.$gte = new Date(filters.date.$gte);
      if (filters.date.$lte) dateFilter.$lte = new Date(filters.date.$lte);
      filters.date = dateFilter;
    }

    // Apply filters to the query
    this.query = this.query.find(filters as FilterQuery<T>);

    // Count total documents if pagination requested
    if (this.queryString.page) {
      this.total = await this.query.model.countDocuments(filters as FilterQuery<T>);
    }

    return this;
  }

  /**
   * Apply search on specified fields
   */
  search(searchFields: string[] = ["name", "email", "title"]): this {
    if (this.queryString.search) {
      const searchRegex = new RegExp(this.queryString.search, "i");
      const searchQuery = {
        $or: searchFields.map((field) => ({ [field]: searchRegex })),
      };
      this.query = this.query.find(searchQuery as FilterQuery<T>);
    }
    return this;
  }

  /**
   * Apply sorting
   */
  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  /**
   * Limit fields to select
   */
  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  /**
   * Apply pagination
   */
  paginate(): this {
    const page = parseInt(this.queryString.page as string, 10) || 1;
    const limit = parseInt(this.queryString.limit as string, 10) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  /**
   * Apply population
   */
  populate(populateOptions: string[] = []): this {
    const populateFields = this.queryString.populate
      ? this.queryString.populate.split(",")
      : populateOptions;

    populateFields.forEach((field) => {
      this.query = this.query.populate(field) as unknown as Query<T[], T>;
    });

    return this;
  }
}

/**
 * Generate pagination info
 */
export const getPagination = (total: number, limit: number, page: number): PaginationInfo => {
  const pages = Math.ceil(total / limit);
  const hasNext = page < pages;
  const hasPrevious = page > 1;

  return {
    total,
    pages,
    currentPage: page,
    limit,
    hasNext,
    hasPrevious,
    nextPage: hasNext ? page + 1 : null,
    previousPage: hasPrevious ? page - 1 : null,
  };
};
