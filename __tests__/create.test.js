const { AWSMock } = require('./setup');
const createHandler = require('../src/handlers/create');
const crypto = require('crypto');

// Mock crypto.randomUUID for predictable testing
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn().mockReturnValue('mock-uuid-12345'),
}));

describe('Create Handler', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up AWS mocks
    AWSMock.restore('DynamoDB.DocumentClient');
  });

  test('should create an item successfully', async () => {
    // Mock DynamoDB put operation
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      callback(null, { Item: params.Item });
    });

    // Mock event
    const event = {
      body: JSON.stringify({
        name: 'Test Item',
        description: 'This is a test item'
      })
    };

    // Execute handler
    const response = await createHandler.handler(event);

    // Assertions
    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual(expect.objectContaining({
      id: 'mock-uuid-12345',
      name: 'Test Item',
      description: 'This is a test item'
    }));
    expect(response.headers['Content-Type']).toBe('application/json');
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  test('should return 400 if name is missing', async () => {
    // Mock event with missing name
    const event = {
      body: JSON.stringify({
        description: 'This is a test item without a name'
      })
    };

    // Execute handler
    const response = await createHandler.handler(event);

    // Assertions
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toBe('Name is required');
  });

  test('should return 500 if DynamoDB operation fails', async () => {
    // Mock DynamoDB put operation to fail
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      callback(new Error('DynamoDB error'));
    });

    // Mock event
    const event = {
      body: JSON.stringify({
        name: 'Test Item',
        description: 'This is a test item'
      })
    };

    // Execute handler
    const response = await createHandler.handler(event);

    // Assertions
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toBe('Could not create the item');
  });
});