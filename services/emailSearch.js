const esClient = require('../elasticsearch/client');

async function searchEmailsES({ query, folder, accountId }) {
  const must = [];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['subject', 'from', 'body']
      }
    });
  }

  if (folder) {
    must.push({ match: { folder } });
  }

  if (accountId) {
    must.push({ match: { account: accountId } });
  }
  if (label) {
  must.push({ match: { label } });
}


  const result = await esClient.search({
    index: 'emails',
    query: {
      bool: { must }
    }
  });

  return result.hits.hits.map(hit => hit._source);
}

module.exports = { searchEmailsES };
