const { connectToImap } = require('./imapClient');
const Account = require('../models/Account.js');

const activeConnections = {};

async function initAllImapConnections() {
  const accounts = await Account.find({});
  for (const account of accounts) {
    await startImap(account);
  }
}

async function startImap(account) {
  const key = account.email;
  if (activeConnections[key]) return;

  // Await if connectToImap is async
  const conn = await connectToImap(account);
  activeConnections[key] = conn;
}

module.exports = { initAllImapConnections, startImap };
