const config = {
  transform: {
    '\\.ts$': 'ts-jest',
  },
  testRegex: '.*\\.spec\\.ts',
  moduleFileExtensions: [
    'ts',
    'js',
    'json',
  ],
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/src/$1',
    '^data/(.*)': '<rootDir>/data/$1',
  },
};

module.exports = config;
