/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        '\\.js$': ['babel-jest', { configFile: './babel.config.testing.js' }],
        // '^.+\\.(js|jsx)$': 'babel-jest',
    },
};
