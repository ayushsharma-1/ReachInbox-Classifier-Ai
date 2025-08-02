const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE;

let client = null;

try {
  if (ELASTICSEARCH_NODE) {
    client = new Client({
      node: ELASTICSEARCH_NODE
    });
    console.log('Elasticsearch client initialized successfully');
  } else {
    console.warn('Elasticsearch node URL not provided');
  }
} catch (error) {
  console.warn('Failed to initialize Elasticsearch client:', error.message);
}

module.exports = client;
