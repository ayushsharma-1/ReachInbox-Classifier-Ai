const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { getAuthUrl, getTokens } = require('./auth/gmail');
const { connectToImap } = require('./imap/gmailClient');
const { google } = require('googleapis');
require('dotenv').config();
const Account = require('./models/Account');
const Email = require('./models/Email');
const EmailDraft = require('./models/EmailDraft');
const esClient = require('./elasticsearch/client');
const { searchEmails } = require('./services/emailSync');
const { sendSlackNotification } = require('./services/slackNotification');
const { triggerWebhook } = require('./services/webhookTrigger');
const { generateEmailDraft, generateContextualReply } = require('./services/geminiAI');

const app = express();
const PORT = 3000;

mongoose.connect(process.env.MONGODB_URI);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/auth/gmail/initiate', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

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
    
    const filter = {};
    if (accountId) filter.account = accountId;
    if (folder) filter.folder = folder;
    if (label) filter.label = label;
    
    const emails = await Email.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('account', 'email');
    
    const total = await Email.countDocuments(filter);
    
    res.json({ 
      success: true, 
      emails, 
      count: emails.length,
      total,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + emails.length) < total
      }
    });
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
    const { accountId, limit = 50, offset = 0 } = req.query;
    
    const filter = { label: 'Interested' };
    if (accountId) filter.account = accountId;
    
    const emails = await Email.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('account', 'email');
    
    const total = await Email.countDocuments(filter);
    
    res.json({ 
      success: true, 
      emails, 
      count: emails.length,
      total,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + emails.length) < total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🤖 AI Draft Management Endpoints

// Get all drafts for a user
app.get('/api/drafts', async (req, res) => {
  try {
    const { accountId, status, limit = 20, offset = 0 } = req.query;
    
    const filter = {};
    if (accountId) filter.account = accountId;
    if (status) filter.status = status;

    const drafts = await EmailDraft.find(filter)
      .populate('account', 'email')
      .sort({ generatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await EmailDraft.countDocuments(filter);

    res.json({ 
      success: true, 
      drafts, 
      total,
      count: drafts.length 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific draft by ID
app.get('/api/drafts/:id', async (req, res) => {
  try {
    const draft = await EmailDraft.findById(req.params.id).populate('account', 'email');
    if (!draft) {
      return res.status(404).json({ success: false, error: 'Draft not found' });
    }
    res.json({ success: true, draft });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update draft content
app.put('/api/drafts/:id', async (req, res) => {
  try {
    const { draftContent, status } = req.body;
    
    const updateData = {};
    if (draftContent) updateData.draftContent = draftContent;
    if (status) updateData.status = status;

    const draft = await EmailDraft.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate('account', 'email');

    if (!draft) {
      return res.status(404).json({ success: false, error: 'Draft not found' });
    }

    res.json({ success: true, draft });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate new draft for specific email
app.post('/api/emails/:emailId/generate-draft', async (req, res) => {
  try {
    const { context } = req.body;
    
    const email = await Email.findById(req.params.emailId).populate('account');
    if (!email) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    const emailData = {
      messageId: email.messageId,
      subject: email.subject,
      from: email.from,
      to: email.to,
      body: email.body,
      label: email.label
    };

    const draftData = context 
      ? await generateContextualReply(emailData, context)
      : await generateEmailDraft(emailData);

    if (!draftData) {
      return res.status(500).json({ success: false, error: 'Failed to generate draft' });
    }

    const emailDraft = new EmailDraft({
      originalEmailId: email.messageId,
      originalSubject: email.subject,
      originalFrom: email.from,
      draftSubject: draftData.draftReply?.subject || draftData.contextualReply?.subject,
      draftContent: draftData.draftReply?.content || draftData.contextualReply?.content,
      aiModel: draftData.draftReply?.aiModel || draftData.contextualReply?.aiModel,
      account: email.account._id,
      category: email.label,
      context: context || '',
      generatedAt: new Date()
    });

    await emailDraft.save();

    res.json({ 
      success: true, 
      message: 'Draft generated successfully',
      draft: emailDraft 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Gemini AI integration
app.post('/api/ai/test-draft', async (req, res) => {
  try {
    const testEmail = {
      messageId: 'test-' + Date.now(),
      subject: req.body.subject || 'Test Meeting Request',
      from: req.body.from || 'recruiter@example.com',
      body: req.body.body || 'Hi, we would like to schedule an interview with you. When would be a good time?',
      label: 'Interested'
    };

    const context = req.body.context || '';
    const draftData = context 
      ? await generateContextualReply(testEmail, context)
      : await generateEmailDraft(testEmail);

    if (!draftData) {
      return res.status(500).json({ success: false, error: 'Failed to generate test draft' });
    }

    res.json({ 
      success: true, 
      message: 'Test draft generated successfully',
      originalEmail: testEmail,
      generatedDraft: draftData 
    });
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
  try {
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
  } catch (error) {
    console.log('⚠️ Elasticsearch not available, running without search functionality');
    console.log('To enable search, start Elasticsearch with: docker-compose up elasticsearch -d');
  }
}

ensureElasticsearchIndex().catch(() => {
  console.log('⚠️ Elasticsearch connection failed, continuing without search functionality');
});

async function fetchUserEmail(accessToken) {
  const { OAuth2 } = google.auth;
  const oauth2Client = new OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const res = await oauth2.userinfo.get();
  return res.data;
}

// 📊 Stats endpoint for dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const { accountId } = req.query;
    
    // Get total email count
    const totalEmails = await Email.countDocuments(accountId ? { account: accountId } : {});
    
    // Get interested emails count
    const interestedEmails = await Email.countDocuments(
      accountId 
        ? { account: accountId, label: 'Interested' }
        : { label: 'Interested' }
    );
    
    // Get not interested emails count
    const notInterestedEmails = await Email.countDocuments(
      accountId 
        ? { account: accountId, label: 'Not Interested' }
        : { label: 'Not Interested' }
    );
    
    // Get drafts count
    const draftsCount = await EmailDraft.countDocuments(
      accountId ? { account: accountId } : {}
    );
    
    res.json({
      success: true,
      stats: {
        totalEmails,
        interestedEmails,
        notInterestedEmails,
        drafts: draftsCount,
        classifiedEmails: interestedEmails + notInterestedEmails,
        unclassifiedEmails: totalEmails - (interestedEmails + notInterestedEmails)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📝 Get not interested emails
app.get('/api/emails/not-interested', async (req, res) => {
  try {
    const { accountId, limit = 50, offset = 0 } = req.query;
    
    const filter = { label: 'Not Interested' };
    if (accountId) filter.account = accountId;
    
    const emails = await Email.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('account', 'email');
    
    const total = await Email.countDocuments(filter);
    
    res.json({ 
      success: true, 
      emails, 
      count: emails.length,
      total,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + emails.length) < total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📂 Get emails by classification
app.get('/api/emails/by-label/:label', async (req, res) => {
  try {
    const { label } = req.params;
    const { accountId, limit = 50, offset = 0 } = req.query;
    
    const filter = { label: label };
    if (accountId) filter.account = accountId;
    
    const emails = await Email.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('account', 'email');
    
    const total = await Email.countDocuments(filter);
    
    res.json({ 
      success: true, 
      emails, 
      count: emails.length,
      total,
      label,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + emails.length) < total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
