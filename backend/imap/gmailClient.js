const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { storeEmail } = require('../services/emailSync');



async function connectToImap(email, accessToken) {
  let lastProcessedUid = 0;

  console.log("connectToImap Called");
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: email,
      accessToken: accessToken
    }
  });

  await client.connect();
  await client.mailboxOpen('INBOX');

  // ✅ Fetch emails from the last 30 days
  const sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const searchResults = await client.search({ since: sinceDate });

  console.log(`Found ${searchResults.length} emails since ${sinceDate.toDateString()}`);

  for (const uid of searchResults) {
    const message = await client.fetchOne(uid, { envelope: true, source: true });
    if (message && message.source) {
      const parsed = await simpleParser(message.source);
      await storeEmail(parsed, email);
      lastProcessedUid = uid;
    }
  }

  // 🔁 Realtime sync
client.on('exists', async () => {
  try {
    const newUid = client.mailbox.uidNext - 1;

    if (newUid <= lastProcessedUid) {
      console.log('⏭️ No new UID to process.');
      return;
    }

    console.log('🔔 New message detected via IDLE');
    console.log('📩 Fetching UID:', newUid);

    let retries = 3;
    let message;

    while (retries--) {
      message = await client.fetchOne(newUid, {
        uid: true,
        envelope: true,
        source: true
      });

      if (message) break;

      console.warn(`⚠️ Retry: Message not ready for UID ${newUid}. Waiting...`);
      await new Promise(resolve => setTimeout(resolve, 7000));
    }

    if (!message || !message.source) {
      console.error(`❌ Failed to fetch new message at UID ${newUid}`);
      return;
    }

    const parsed = await simpleParser(message.source);
    await storeEmail(parsed, email);
    lastProcessedUid = newUid;

  } catch (err) {
    console.error('❌ Error during IDLE message fetch:', err);
  }
});


  client.idle();
}

module.exports = { connectToImap };
