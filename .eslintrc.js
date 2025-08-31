// .eslintrc.js
const path = require("path");

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json", // explicitly point to tsconfig
    tsconfigRootDir: path.resolve(), // fix inferred root dir
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    // add custom rules here
  },
};
