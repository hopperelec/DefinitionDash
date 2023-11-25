/** @type { import("eslint").Linter.FlatConfig } */
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:svelte/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    extraFileExtensions: [".svelte"],
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  overrides: [
    {
      files: ["*.svelte"],
      plugins: ["svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: {
          ts: "@typescript-eslint/parser",
          js: "espree",
        },
      },
    },
    {
      files: ["*.js"],
      parser: "espree",
    },
  ],
  settings: {
    svelte: {
      kit: {
        paths: {
          base: process.env.BASE_PATH,
        },
      },
    },
  },
};
