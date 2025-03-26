'use strict';

const AWS = require('aws-sdk');
const crypto = require('crypto');

// Get the current stage from environment variables
const stage = process.env.STAGE || 'dev';
console.log(`Running in ${stage} environment`);

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  console.log(`Create item request received in ${stage} environment`);
  
  try {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);
    
    console.log('Request body:', JSON.stringify(data));
    
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
      Item: {
        id: crypto.randomUUID(), // Using crypto.randomUUID() instead of uuidv4()
        name: data.name,
        description: data.description || '',
        createdAt: timestamp,
        updatedAt: timestamp
      }
    };

    const result = await dynamoDb.put(params).promise();
    console.log('Item created successfully:', JSON.stringify(params.Item));

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(params.Item)
    };
  } catch (error) {
    console.error('Error creating item:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Could not create the item' })
    };
  }
};