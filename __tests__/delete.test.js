const { AWSMock } = require('./setup');
const deleteHandler = require('../src/handlers/delete');

describe('Delete Handler', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up AWS mocks
    AWSMock.restore('DynamoDB.DocumentClient');
  });

  test('should delete an item successfully', async () => {
    // Mock existing item
    const existingItem = {
      id: 'test-id-123',
      name: 'Test Item',
      description: 'This is a test item',
      createdAt: 1234567890,
      updatedAt: 1234567890
    };

    // Mock DynamoDB get operation
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      expect(params.Key.id).toBe('test-id-123');
      callback(null, { Item: existingItem });
    });

    // Mock DynamoDB delete operation
    AWSMock.mock('DynamoDB.DocumentClient', 'delete', (params, callback) => {
      expect(params.Key.id).toBe('test-id-123');
      callback(null, {});
    });

    // Mock event
    const event = {
      pathParameters: {
        id: 'test-id-123'
      }
    };

    // Execute handler
    const response = await deleteHandler.handler(event);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe('Item deleted successfully');
    expect(response.headers['Content-Type']).toBe('application/json');
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  test('should return 404 when item does not exist', async () => {
    // Mock DynamoDB get operation to return no item
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      callback(null, {});
    });

    // Mock event
    const event = {
      pathParameters: {
        id: 'non-existent-id'
      }
    };

    // Execute handler
    const response = await deleteHandler.handler(event);

    // Assertions
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).error).toBe('Item not found');
  });

  test('should return 500 if DynamoDB operation fails', async () => {
    // Mock existing item
    const existingItem = {
      id: 'test-id-123',
      name: 'Test Item',
      description: 'This is a test item',
      createdAt: 1234567890,
      updatedAt: 1234567890
    };

    // Mock DynamoDB get operation
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      callback(null, { Item: existingItem });
    });

    // Mock DynamoDB delete operation to fail
    AWSMock.mock('DynamoDB.DocumentClient', 'delete', (params, callback) => {
      callback(new Error('DynamoDB error'));
    });

    // Mock event
    const event = {
      pathParameters: {
        id: 'test-id-123'
      }
    };

    // Execute handler
    const response = await deleteHandler.handler(event);

    // Assertions
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toBe('Could not delete the item');
  });
});