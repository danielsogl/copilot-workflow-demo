// @ts-check
import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";
import ngrx from "@ngrx/eslint-plugin/v9";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import playwright from "eslint-plugin-playwright";

export default defineConfig([
  globalIgnores(["dist/", "coverage/", ".angular/", ".playwright/"]),
  {
    files: ["**/*.ts"],
    ignores: ["tests/**"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
      ngrx.configs.signals,
      ngrx.configs.operators,
      eslintConfigPrettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
  {
    files: ["tests/**"],
    extends: [playwright.configs["flat/recommended"]],
    rules: {},
  },
]);
