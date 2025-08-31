
## Features

- **Advanced Filtering**: Support for `gte`, `gt`, `lte`, `lt`, `in`, `nin`, `eq`, `ne`, `regex` operators.
- **Full-Text Search**: Easily integrate search functionality across specified fields.
- **Sorting**: Order results by one or more fields, ascending or descending.
- **Field Limiting**: Select specific fields to return, reducing payload size.
- **Pagination**: Efficiently handle large datasets with page and limit parameters.
- **Population**: Seamlessly populate related Mongoose documents.
- **TypeScript Support**: Built with TypeScript for a better developer experience.
- **Minimal Dependencies**: Lightweight and focused on core functionality.

## Installation

You can install the package using npm:

```bash
npm install mongoose-api-helpers
```
````

## Usage

### Basic Usage

Import the necessary functions and integrate them into your Mongoose queries.

```javascript
// For CommonJS
const { ApiFeatures, getPagination } = require("mongoose-api-helpers");

// For ES6 Modules / TypeScript
import { ApiFeatures, getPagination } from "mongoose-api-helpers";

// In your controller (example using Express.js)
// Assuming 'Product' is a Mongoose Model and 'req.query' contains your API query parameters.
export const getProducts = async (req, res) => {
  try {
    const features = new ApiFeatures(Product.find(), req.query)
      .filter()
      .search() // Searches default fields if not specified, or all string fields
      .sort()
      .limitFields()
      .paginate()
      .populate(); // Populates all specified in model schema virtuals by default

    const results = await features.query;
    const total = features.total || (await Product.countDocuments()); // Fallback to countDocuments if total is not set by paginate
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    res.status(200).json({
      success: true,
      count: results.length,
      pagination: getPagination(total, limit, page),
      data: results,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message, // Provide error message for client
    });
  }
};
```

### Advanced Usage with Customization

Customize search fields and populate options for fine-grained control.

```typescript
import { ApiFeatures, getPagination } from "mongoose-api-helpers";
import { Request, Response } from "express";
import Product from "../models/Product"; // Your Mongoose Product Model

export const getProductsAdvanced = async (req: Request, res: Response) => {
  try {
    const features = new ApiFeatures(Product.find(), req.query)
      .filter()
      .search(["name", "description", "brand"]) // Custom search fields
      .sort()
      .limitFields()
      .paginate()
      .populate(["category", "reviews"]); // Custom populate options

    const products = await features.query;
    const total = features.total || (await Product.countDocuments());
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: getPagination(total, limit, page),
      data: products,
    });
  } catch (error: any) {
    // Type 'any' for error for simpler example, consider specific error types
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
```

### API Response with Pagination

The `getPagination` function helps format the pagination metadata for your API responses.

```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "total": 100,
    "pages": 10,
    "currentPage": 1,
    "limit": 10,
    "hasNext": true,
    "hasPrevious": false,
    "nextPage": 2,
    "previousPage": null
  },
  "data": [
    // Array of product objects
  ]
}
```

## API Reference

### `ApiFeatures` Class

#### `constructor(query: mongoose.Query, queryString: object)`

- `query`: A Mongoose query object (e.g., `Model.find()`).
- `queryString`: The request query parameters object (e.g., `req.query` from Express).

#### Methods

All methods are chainable and modify the internal `query` object.

- `filter(): this`
  Applies advanced filtering based on query parameters. Supports operators like `[gte]`, `[gt]`, `[lte]`, `[lt]`, `[in]`, `[nin]`, `[eq]`, `[ne]`, `[regex]`.
- `search(searchFields?: string[]): this`
  Implements search functionality.
  - `searchFields` (optional): An array of strings specifying which fields to search within. If not provided, it attempts to search across all string fields in the model.
- `sort(): this`
  Handles sorting of results based on the `sort` query parameter.
- `limitFields(): this`
  Limits the fields returned in the query results based on the `fields` query parameter.
- `paginate(): this`
  Implements pagination based on `page` and `limit` query parameters. Sets `this.total` for convenience.
- `populate(populateOptions?: string | string[] | mongoose.PopulateOptions | mongoose.PopulateOptions[]): this`
  Handles population of related Mongoose documents.
  - `populateOptions` (optional): Can be a string (field name), an array of strings, or Mongoose `PopulateOptions` object(s).

#### Properties

- `query: mongoose.Query`
  The modified Mongoose query object after all chained methods have been applied.
- `total?: number`
  The total number of documents found _before_ pagination, if `paginate()` was called.

### `getPagination(total: number, limit: number, page: number): object`

A helper function to generate pagination metadata for your API responses.

- `total`: The total number of documents available.
- `limit`: The maximum number of results per page.
- `page`: The current page number.

Returns an object with `total`, `pages`, `currentPage`, `limit`, `hasNext`, `hasPrevious`, `nextPage`, and `previousPage` properties.

## Query Parameters

The package understands and processes the following query parameters:

- `page`: The desired page number (e.g., `page=2`).
- `limit`: The number of results per page (e.g., `limit=10`).
- `sort`: Fields to sort by, comma-separated. Prefix with `-` for descending order (e.g., `sort=-price,createdAt`).
- `fields`: Fields to return, comma-separated (e.g., `fields=name,price,category`).
- `search`: The search term to apply (e.g., `search=apple`).
- `populate`: Fields to populate, comma-separated (e.g., `populate=category,reviews`).
- **Filter operators**: For any field, you can use `[gte]`, `[gt]`, `[lte]`, `[lt]`, `[in]`, `[nin]`, `[eq]`, `[ne]`, `[regex]`.

## Examples

### Filtering

Fetch products with a price between 100 and 500, and belonging to the 'electronics' category.

```text
GET /api/products?price[gte]=100&price[lte]=500&category=electronics
```

### Searching

Search for products containing the term 'apple' in their searchable fields.

```text
GET /api/products?search=apple
```

### Sorting

Sort products by price (descending) and then by creation date (ascending).

```text
GET /api/products?sort=-price,createdAt
```

### Field Selection

Return only the `name`, `price`, and `category` fields for each product.

```text
GET /api/products?fields=name,price,category
```

### Pagination

Get the second page of results, with 10 items per page.

```text
GET /api/products?page=2&limit=10
```

### Population

Populate the `category` and `reviews` fields of each product.

```text
GET /api/products?populate=category,reviews
```

## TypeScript Support

This package is written in TypeScript and provides full type definitions out-of-the-box, ensuring a great development experience with type checking and autocompletion.

## Contribution

Contributions are welcome! If you find a bug or have a feature request, please open an issue. If you'd like to contribute code, please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Ensure your code adheres to the existing style.
4.  Write tests for your changes.
5.  Follow the [Git Commit Messages](#git-commit-messages) convention.
6.  Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

Here's an image that symbolizes a well-documented and robust API feature package, perfect for a README file. It includes elements like code, a magnifying glass for searching/filtering, and pagination symbols.

```
