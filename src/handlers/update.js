'use strict';

const AWS = require('aws-sdk');

// Get the current stage from environment variables
const stage = process.env.STAGE || 'dev';
console.log(`Running in ${stage} environment`);

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  console.log(`Update item request received in ${stage} environment`);
  const itemId = event.pathParameters.id;
  console.log(`Updating item with ID: ${itemId}`);
  
  try {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);
    console.log('Update data:', JSON.stringify(data));
    
    // Check if item exists
    const getParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: event.pathParameters.id
      }
    };
    
    const existingItem = await dynamoDb.get(getParams).promise();
    
    if (!existingItem.Item) {
      console.log(`Item with ID ${itemId} not found for update`);
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Item not found' })
      };
    }

    // Basic validation
    if (!data.name) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Name is required' })
      };
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: event.pathParameters.id
      },
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': data.name,
        ':description': data.description || existingItem.Item.description,
        ':updatedAt': timestamp,
      },
      UpdateExpression: 'SET #name = :name, description = :description, updatedAt = :updatedAt',
      ReturnValues: 'ALL_NEW',
    };

    const result = await dynamoDb.update(params).promise();
    console.log(`Successfully updated item with ID: ${itemId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    console.error('Error updating item:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Could not update the item' })
    };
  }
};