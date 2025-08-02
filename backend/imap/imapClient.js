const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const { storeEmail } = require('../services/emailSync');
const { buildXOAuth2 } = require('../utils/imapUtils');

function connectToImap(account) {
  const { email, provider, oauthTokens, password, imapConfig } = account;

  const auth = oauthTokens?.accessToken
    ? { xoauth2: buildXOAuth2(email, oauthTokens.accessToken) }
    : { user: email, password };

  const imap = new Imap({
    user: email,
    ...auth,
    ...imapConfig
  });

  imap.once('ready', () => {
    imap.openBox('INBOX', true, () => {
      imap.on('mail', () => {
        fetchRecentEmails(imap, email);
      });

      // Initial sync
      fetchRecentEmails(imap, email);
    });
  });

  imap.once('error', err => {
    console.error(`IMAP error for ${email}:`, err);
  });

  imap.connect();
  return imap;
}

function fetchRecentEmails(imap, email) {
  console.log(
    `aaaaaaaaaaa
    aaaaaaaaaaaaaaaa
    aaaaaaaaa
    a
    a
    a
    
    aa
    a
    
    a
    a
    a
    `
  )
  const sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  imap.search([['SINCE', sinceDate.toDateString()]], (err, results) => {
    if (err || !results.length) return;
    const fetch = imap.fetch(results, { bodies: '', markSeen: false });

    fetch.on('message', msg => {
      msg.on('body', async stream => {
        const parsed = await simpleParser(stream);
        await storeEmail(parsed, email);
      });
    });
  });
}

module.exports = { connectToImap };
