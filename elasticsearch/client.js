const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE;
const client = new Client({
  node: ELASTICSEARCH_NODE
});

module.exports = client;
