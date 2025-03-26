'use strict';

const AWS = require('aws-sdk');

// Get the current stage from environment variables
const stage = process.env.STAGE || 'dev';
console.log(`Running in ${stage} environment`);

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  console.log(`Delete item request received in ${stage} environment`);
  const itemId = event.pathParameters.id;
  console.log(`Deleting item with ID: ${itemId}`);
  
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: event.pathParameters.id
      }
    };

    // Check if item exists before deleting
    const existingItem = await dynamoDb.get(params).promise();
    
    if (!existingItem.Item) {
      console.log(`Item with ID ${itemId} not found for deletion`);
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Item not found' })
      };
    }

    await dynamoDb.delete(params).promise();
    console.log(`Successfully deleted item with ID: ${itemId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Item deleted successfully' })
    };
  } catch (error) {
    console.error('Error deleting item:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Could not delete the item' })
    };
  }
};