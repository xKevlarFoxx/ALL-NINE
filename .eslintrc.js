module.exports = {
    root: true,
    extends: [
      'universe/native',
      'prettier',
    ],
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  };