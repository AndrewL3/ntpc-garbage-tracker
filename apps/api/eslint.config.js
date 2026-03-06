import { createEslintConfig } from "@tracker/config/eslint";

export default [
  ...createEslintConfig({
    tsconfigPath: import.meta.dirname,
  }),
  {
    files: ["src/__tests__/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
