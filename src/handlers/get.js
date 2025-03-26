'use strict';

const AWS = require('aws-sdk');

// Get the current stage from environment variables
const stage = process.env.STAGE || 'dev';
console.log(`Running in ${stage} environment`);

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  console.log(`Get item request received in ${stage} environment`);
  const itemId = event.pathParameters.id;
  console.log(`Retrieving item with ID: ${itemId}`);
  
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: event.pathParameters.id
      }
    };

    const result = await dynamoDb.get(params).promise();

    if (!result.Item) {
      console.log(`Item with ID ${itemId} not found`);
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Item not found' })
      };
    }

    console.log(`Successfully retrieved item with ID: ${itemId}`);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    console.error('Error retrieving item:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Could not retrieve the item' })
    };
  }
};