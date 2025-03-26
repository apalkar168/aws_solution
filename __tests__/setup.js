// Mock AWS SDK
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');

// Set environment variables for tests
process.env.DYNAMODB_TABLE = 'serverless-crud-api-test';
process.env.STAGE = 'test';

// Mock console methods to prevent cluttering test output
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

module.exports = {
  AWS,
  AWSMock,
};