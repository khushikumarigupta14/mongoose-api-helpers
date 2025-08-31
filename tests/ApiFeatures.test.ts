import mongoose, { Schema, Document, model } from "mongoose";
import { ApiFeatures, getPagination } from "../src";
import { QueryString } from "../src/types";

interface IUser extends Document {
  name: string;
  email: string;
}

const userSchema = new Schema<IUser>({
  name: String,
  email: String,
});

const User = model<IUser>("UserTest", userSchema);

describe("ApiFeatures", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/testdb", {
      dbName: "testdb",
    });
    await User.deleteMany({});
    await User.create([
      { name: "Alice", email: "alice@example.com" },
      { name: "Bob", email: "bob@example.com" },
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it("should filter documents", async () => {
    const qs: QueryString = { name: "Alice" };
    const api = new ApiFeatures(User.find(), qs);
    await api.filter();
    const docs = await api.query;
    expect(docs.length).toBe(1);
    expect(docs[0].name).toBe("Alice");
  });

  it("should search documents", async () => {
    const qs: QueryString = { search: "bob" };
    const api = new ApiFeatures(User.find(), qs);
    api.search(["name"]);
    const docs = await api.query;
    expect(docs.length).toBe(1);
    expect(docs[0].name).toBe("Bob");
  });

  it("should paginate correctly", () => {
    const pagination = getPagination(50, 10, 3);
    expect(pagination.pages).toBe(5);
    expect(pagination.currentPage).toBe(3);
    expect(pagination.hasNext).toBe(true);
    expect(pagination.hasPrevious).toBe(true);
  });
});
