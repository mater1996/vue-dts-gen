module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021,
    project: './tsconfig.json'
  },
  env: {
    es6: true,
    browser: true,
    node: true
  },
  plugins: ['@typescript-eslint', "eslint-plugin-tsdoc"],
  extends: ['standard-with-typescript'],
  rules: {
    /* TSDOC PLUGIN RULES */
    // Enable the TSDoc plugin
    'tsdoc/syntax': 'warn',
  }
}
