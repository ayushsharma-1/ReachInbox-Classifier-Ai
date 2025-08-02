// server.js
const express = require('express');
const mongoose = require('mongoose');
const { getAuthUrl, getTokens } = require('./auth/gmail');
const { connectToImap } = require('./imap/gmailClient');
const { google } = require('googleapis');
require('dotenv').config();
const Account = require('./models/Account');
const Email = require('./models/Email');
const esClient = require('./elasticsearch/client');
const { searchEmails } = require('./services/emailSync');
const { sendSlackNotification } = require('./services/slackNotification');
const { triggerWebhook } = require('./services/webhookTrigger');

const app = express();
const PORT = 3000;

mongoose.connect(process.env.MONGODB_URI);

app.get('/auth/gmail/initiate', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Search emails route
app.get('/api/emails/search', async (req, res) => {
  try {
    const { q: query, folder, accountId, label } = req.query;
    const results = await searchEmails({ query, folder, accountId, label });
    res.json({ success: true, emails: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get emails with filtering - Using Elasticsearch
app.get('/api/emails', async (req, res) => {
  try {
    const { accountId, folder, limit = 50, offset = 0, label } = req.query;
    
    // Use Elasticsearch for all filtering
    const results = await searchEmails({ 
      query: '', // empty query to get all
      folder, 
      accountId, 
      label,
      size: parseInt(limit),
      from: parseInt(offset)
    });
    
    res.json({ success: true, emails: results, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single email
app.get('/api/emails/:id', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }
    res.json({ success: true, email });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🚀 Step 4: Slack & Webhook Integration Test Endpoints

// Test Slack integration
app.post('/api/slack/test', async (req, res) => {
  try {
    const testEmail = {
      messageId: 'test-' + Date.now(),
      subject: 'Test Slack Notification',
      from: 'test@example.com',
      to: 'user@example.com',
      date: new Date(),
      label: 'Interested',
      account: 'test-account'
    };

    await sendSlackNotification(testEmail);
    res.json({ success: true, message: 'Slack notification sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test webhook integration
app.post('/api/webhook/test', async (req, res) => {
  try {
    const testEmail = {
      messageId: 'test-' + Date.now(),
      subject: 'Test Webhook Trigger',
      from: 'test@example.com',
      to: 'user@example.com',
      date: new Date(),
      label: 'Interested',
      account: 'test-account'
    };

    await triggerWebhook(testEmail);
    res.json({ success: true, message: 'Webhook triggered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get emails filtered by 'Interested' label
app.get('/api/emails/interested', async (req, res) => {
  try {
    const results = await searchEmails({ 
      query: '',
      label: 'Interested',
      size: 50,
      from: 0
    });
    
    res.json({ success: true, emails: results, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  const tokens = await getTokens(code);
  const userInfo = await fetchUserEmail(tokens.access_token);

  const account = await Account.findOneAndUpdate(
    { email: userInfo.email },
    {
      email: userInfo.email,
      provider: 'gmail',
      oauthTokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date
      },
      imapConfig: {
        host: 'imap.gmail.com',
        port: 993,
        secure: true
      }
    },
    { upsert: true, new: true }
  );

  connectToImap(userInfo.email, tokens.access_token);
  res.send('IMAP connected for ' + userInfo.email);
});

// Ensure Elasticsearch index exists
async function ensureElasticsearchIndex() {
  const index = 'emails';

  const exists = await esClient.indices.exists({ index });
  if (!exists) {
    console.log(`Creating missing Elasticsearch index: ${index}`);
    await esClient.indices.create({
      index,
      settings: {
        analysis: {
          analyzer: {
            default: {
              type: 'standard'
            }
          }
        }
      },
      mappings: {
        properties: {
          messageId: { type: 'keyword' },
          subject: { type: 'text' },
          from: { type: 'text' },
          to: { type: 'text' },
          date: { type: 'date' },
          body: { type: 'text' },
          account: { type: 'keyword' }
        }
      }
    });
    console.log('✅ emails index created');
  } else {
    console.log('🟢 Elasticsearch index "emails" already exists');
  }
}

ensureElasticsearchIndex().catch(console.error);

async function fetchUserEmail(accessToken) {
  const { OAuth2 } = google.auth;
  const oauth2Client = new OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const res = await oauth2.userinfo.get();
  return res.data;
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



// const express = require('express');
// const mongoose = require('mongoose');
// const { getAuthUrl, getTokens } = require('./auth/gmail');
// const { connectToImap } = require('./imap/gmailClient');
// const { google } = require('googleapis');
// require('dotenv').config();
// const Account = require('./models/Account');
// const Email = require('./models/Email')

// const app = express();
// const PORT = 3000;

// mongoose.connect('mongodb://localhost:27017/emails');

// // Start OAuth flow
// app.get('/auth/gmail/initiate', (req, res) => {
//   const url = getAuthUrl();
//   res.redirect(url);
// });

// // Callback endpoint
// app.get('/oauth2callback', async (req, res) => {
//   const code = req.query.code;
//   const tokens = await getTokens(code);
//   const userInfo = await fetchUserEmail(tokens.access_token);

//    await Account.findOneAndUpdate(
//     { email: userInfo.email },
//     {
//       email: userInfo.email,
//       provider: 'gmail',
//       oauthTokens: {
//         accessToken: tokens.access_token,
//         refreshToken: tokens.refresh_token,
//         expiryDate: tokens.expiry_date
//       }
//     },
//     { upsert: true, new: true }
//   );

//   // Store tokens in DB (later) and start IMAP
//   connectToImap(userInfo.email, tokens.access_token);
//   res.send('IMAP connected for ' + userInfo.email);
// });

// async function fetchUserEmail(accessToken) {
//   const { OAuth2 } = google.auth;
//   const oauth2Client = new OAuth2();
//   oauth2Client.setCredentials({ access_token: accessToken });

//   const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
//   const res = await oauth2.userinfo.get();
//   return res.data;
// }

// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
