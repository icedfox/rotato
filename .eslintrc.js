module.exports = {
  'extends': 'airbnb-base',
  'plugins': [
      'import'
  ],
  'env': {
    'node': true
  },
  'rules': {
    'comma-dangle': ['error', 'never'],
    'arrow-parens': ['error', 'always'],
    'curly': ['error', 'all'],
    'indent': 0,
    'max-len': ['error', 120, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    'arrow-body-style': ['error', 'always'],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-shadow': ['error', { 'allow': ['error', 'callback'] }],
    'class-methods-use-this': 0
  }
};
