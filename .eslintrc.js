module.exports = {
	parser: "@typescript-eslint/parser", // Specifies the ESLint parser

	parserOptions: {
		ecmaVersion: 2020,
		sourceType: "module",
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
	extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
	rules: {
		"@typescript-eslint/no-this-alias": 0,
		"@typescript-eslint/explicit-module-boundary-types": 0,
		"@typescript-eslint/ban-types": 0,
		"@typescript-eslint/no-empty-function": 0,
	},
}
