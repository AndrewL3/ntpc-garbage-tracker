import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

/** @param {{ tsconfigPath?: string }} options */
export function createEslintConfig(options = {}) {
  return tseslint.config(
    { ignores: ["dist/", "node_modules/", ".turbo/"] },
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: options.tsconfigPath,
        },
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_" },
        ],
      },
    },
  );
}
