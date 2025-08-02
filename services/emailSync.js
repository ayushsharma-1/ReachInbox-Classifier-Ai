// services/emailSync.js
const Email = require('../models/Email');
const Account = require('../models/Account');
const EmailDraft = require('../models/EmailDraft');
const esClient = require('../elasticsearch/client');
const { sendSlackNotification } = require('./slackNotification');
const { triggerWebhook } = require('./webhookTrigger');
const { generateEmailDraft } = require('./geminiAI');
const axios = require('axios');
const FLASK_MODEL_URI = process.env.FLASK_MODEL_URI;

async function storeEmail(parsed, accountEmail) {
  console.log('storeEmail called for:', accountEmail);
  try {
    const account = await Account.findOne({ email: accountEmail });
    if (!account) {
      console.error('Account not found for:', accountEmail);
      return;
    }

    if (!parsed.messageId) {
      console.warn('Skipping email without messageId');
      return;
    }

    const exists = await Email.findOne({ messageId: parsed.messageId });
    if (exists) {
      console.log('Duplicate email skipped:', parsed.subject);
      return;
    }

    // 🧠 AI Categorization
    let label = '';
    try {
      const { data } = await axios.post(FLASK_MODEL_URI, {
        subject: parsed.subject || '',
        body: parsed.text || ''
      });
      label = data.label || '';
    } catch (error) {
      console.error('AI categorization failed:', error.message);
    }

    const emailDoc = new Email({
      messageId: parsed.messageId,
      subject: parsed.subject || '(no subject)',
      from: parsed.from?.text || '',
      to: parsed.to?.text || '',
      date: parsed.date || new Date(),
      body: parsed.text || '',
      account: account._id,
      label
    });

    await emailDoc.save();
    console.log('✅ Email saved to MongoDB:', parsed.subject);

    await esClient.index({
      index: 'emails',
      id: parsed.messageId,
      document: {
        messageId: parsed.messageId,
        subject: parsed.subject || '(no subject)',
        from: parsed.from?.text || '',
        to: parsed.to?.text || '',
        date: parsed.date || new Date(),
        body: parsed.text || '',
        account: account._id.toString(),
        label
      }
    });
    console.log('🔍 Indexed to Elasticsearch:', parsed.subject);

    // 🚀 Step 4: Slack & Webhook Integration
    if (label && label.toLowerCase() === 'interested') {
      console.log('🎯 Interested email detected, triggering notifications...');
      
      const emailData = {
        messageId: parsed.messageId,
        subject: parsed.subject || '(no subject)',
        from: parsed.from?.text || '',
        to: parsed.to?.text || '',
        date: parsed.date || new Date(),
        label: label,
        account: account._id.toString()
      };

      // Send Slack notification
      try {
        await sendSlackNotification(emailData);
      } catch (slackError) {
        console.error('Slack notification failed:', slackError.message);
      }

      // Trigger webhook
      try {
        await triggerWebhook(emailData);
      } catch (webhookError) {
        console.error('Webhook trigger failed:', webhookError.message);
      }

      // 🤖 Generate AI Draft Reply for Interested emails
      try {
        console.log('🤖 Generating AI draft reply for interested email...');
        const draftData = await generateEmailDraft(emailData);
        
        if (draftData) {
          const emailDraft = new EmailDraft({
            originalEmailId: parsed.messageId,
            originalSubject: parsed.subject || '(no subject)',
            originalFrom: parsed.from?.text || '',
            draftSubject: draftData.draftReply.subject,
            draftContent: draftData.draftReply.content,
            aiModel: draftData.draftReply.aiModel,
            account: account._id,
            category: label,
            generatedAt: draftData.draftReply.generatedAt
          });

          await emailDraft.save();
          console.log('✅ AI draft saved to database');
        }
      } catch (aiError) {
        console.error('❌ AI draft generation failed:', aiError.message);
      }
    }

    // 🎯 Generate AI drafts for other important categories
    const importantCategories = ['meeting booked', 'important'];
    if (label && importantCategories.includes(label.toLowerCase())) {
      try {
        console.log(`🤖 Generating AI draft for ${label} email...`);
        const emailData = {
          messageId: parsed.messageId,
          subject: parsed.subject || '(no subject)',
          from: parsed.from?.text || '',
          to: parsed.to?.text || '',
          date: parsed.date || new Date(),
          body: parsed.text || '',
          label: label
        };

        const draftData = await generateEmailDraft(emailData);
        
        if (draftData) {
          const emailDraft = new EmailDraft({
            originalEmailId: parsed.messageId,
            originalSubject: parsed.subject || '(no subject)',
            originalFrom: parsed.from?.text || '',
            draftSubject: draftData.draftReply.subject,
            draftContent: draftData.draftReply.content,
            aiModel: draftData.draftReply.aiModel,
            account: account._id,
            category: label,
            generatedAt: draftData.draftReply.generatedAt
          });

          await emailDraft.save();
          console.log(`✅ AI draft saved for ${label} email`);
        }
      } catch (aiError) {
        console.error('❌ AI draft generation failed:', aiError.message);
      }
    }

  } catch (err) {
    console.error('❌ Error saving email:', err.message);
    console.error(err);
  }
}

async function searchEmails({ query, folder, accountId, label, size = 50, from = 0 }) {
  const must = [];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['subject^2', 'from', 'body']
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
    },
    highlight: {
      fields: {
        subject: {},
        body: {}
      }
    },
    sort: [
      { date: { order: 'desc' } }
    ],
    size: size,
    from: from
  });

  return result.hits.hits.map(hit => ({
    ...hit._source,
    highlight: hit.highlight
  }));
}

module.exports = { storeEmail, searchEmails };
