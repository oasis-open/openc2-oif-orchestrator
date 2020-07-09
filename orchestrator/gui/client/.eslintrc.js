module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname
  },
  plugins: [
    '@typescript-eslint',
    'compat',
    'import',
    'jest',
    'jsx-a11y',
    'prettier',
    'promise',
    'react',
    'react-hooks'
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./config/webpack.config.eslint.js')
      }
    }
  },
  rules: {
    /*
     * "off" or 0 - turn the rule off
     * "warn" or 1 - turn the rule on as a warning (doesn't affect exit code)
     * "error" or 2 - turn the rule on as an error (exit code is 1 when triggered)
     */
    // eslint-disable-next-line global-require
    ...require('./config/eslint_rules'),
    'import/extensions': 0,
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 0
  }
};
