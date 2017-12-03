module.exports = {
  extends: 'airbnb-base',
  env: {
    "mocha": true,
  },
  rules: {
    "arrow-parens": ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    "no-console": "off",
    "object-curly-spacing": ["error", "never"],
  }
};
