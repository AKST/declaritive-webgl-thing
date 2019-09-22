module.exports = {
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleNameMapper: {
    '^/(.*)$': '<rootDir>/$1',
  },
  globals: {
    'ts-jest': {
      diagnostics: true
    }
  },
};
