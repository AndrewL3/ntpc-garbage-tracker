import { createEslintConfig } from "@tracker/config/eslint";

export default createEslintConfig({
  tsconfigPath: import.meta.dirname,
});
