import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * @type {import("typescript-eslint").Config}
 */
export default [
  {
    languageOptions: { globals: globals.node },
		rules: {
			"indent": ["error", "tab"]
		},
    files: [
      "src/**/*.ts"
    ]
	},
	...tseslint.configs.stylistic
];