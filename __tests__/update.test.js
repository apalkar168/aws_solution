const { AWSMock } = require('./setup');
const updateHandler = require('../src/handlers/update');

describe('Update Handler', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up AWS mocks
    AWSMock.restore('DynamoDB.DocumentClient');
  });

  test('should update an item successfully', async () => {
    // Mock existing item
    const existingItem = {
      id: 'test-id-123',
      name: 'Original Name',
      description: 'Original description',
      createdAt: 1234567890,
      updatedAt: 1234567890
    };

    // Mock updated item
    const updatedItem = {
      id: 'test-id-123',
      name: 'Updated Name',
      description: 'Updated description',
      createdAt: 1234567890,
      updatedAt: expect.any(Number)
    };

    // Mock DynamoDB get operation
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      expect(params.Key.id).toBe('test-id-123');
      callback(null, { Item: existingItem });
    });

    // Mock DynamoDB update operation
    AWSMock.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
      expect(params.Key.id).toBe('test-id-123');
      callback(null, { Attributes: updatedItem });
    });

    // Mock event
    const event = {
      pathParameters: {
        id: 'test-id-123'
      },
      body: JSON.stringify({
        name: 'Updated Name',
        description: 'Updated description'
      })
    };

    // Execute handler
    const response = await updateHandler.handler(event);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(updatedItem);
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
      },
      body: JSON.stringify({
        name: 'Updated Name',
        description: 'Updated description'
      })
    };

    // Execute handler
    const response = await updateHandler.handler(event);

    // Assertions
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).error).toBe('Item not found');
  });

  test('should return 400 if name is missing', async () => {
    // Mock existing item
    const existingItem = {
      id: 'test-id-123',
      name: 'Original Name',
      description: 'Original description',
      createdAt: 1234567890,
      updatedAt: 1234567890
    };

    // Mock DynamoDB get operation
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      callback(null, { Item: existingItem });
    });

    // Mock event with missing name
    const event = {
      pathParameters: {
        id: 'test-id-123'
      },
      body: JSON.stringify({
        description: 'Updated description without a name'
      })
    };

    // Execute handler
    const response = await updateHandler.handler(event);

    // Assertions
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toBe('Name is required');
  });

  test('should return 500 if DynamoDB operation fails', async () => {
    // Mock existing item
    const existingItem = {
      id: 'test-id-123',
      name: 'Original Name',
      description: 'Original description',
      createdAt: 1234567890,
      updatedAt: 1234567890
    };

    // Mock DynamoDB get operation
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      callback(null, { Item: existingItem });
    });

    // Mock DynamoDB update operation to fail
    AWSMock.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
      callback(new Error('DynamoDB error'));
    });

    // Mock event
    const event = {
      pathParameters: {
        id: 'test-id-123'
      },
      body: JSON.stringify({
        name: 'Updated Name',
        description: 'Updated description'
      })
    };

    // Execute handler
    const response = await updateHandler.handler(event);

    // Assertions
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toBe('Could not update the item');
  });
});