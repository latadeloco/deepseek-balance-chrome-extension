import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "icons/**", "package-lock.json"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
      },
    },
  },
];
