import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import jsdoc from "eslint-plugin-jsdoc";

export default defineConfig([
  {
    files: [
      "source/scripts/**/*.{js,mjs,cjs}",
	  "source/scripts/tests/**/*.{js,mjs,cjs}"
    ],
    plugins: {
      js,
      jsdoc
    },
    extends: [
      "js/recommended",
      "jsdoc/flat/recommended"
    ],
    languageOptions: { globals: globals.browser },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "semi": ["error", "always"],
      "camelcase": "error",
      "indent": ["error", "tab"],
      "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1, "maxBOF": 0 }],
      // Add or override specific jsdoc rules here if needed, for example:
      "jsdoc/require-jsdoc": ["warn", { "require": { "FunctionDeclaration": true, "MethodDefinition": true, "ClassDeclaration": true } }],
      "jsdoc/tag-lines": "off",
      "jsdoc/no-defaults": "off",
    }
  }
]);