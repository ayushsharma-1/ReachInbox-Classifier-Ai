const axios = require('axios');
require('dotenv').config();

const WEBHOOK_SITE_URL = process.env.WEBHOOK_SITE_URL;

async function triggerWebhook(email) {
  if (!WEBHOOK_SITE_URL || WEBHOOK_SITE_URL === 'https://webhook.site/YOUR-UNIQUE-URL') {
    console.log('⚠️ Webhook site URL not configured, skipping webhook trigger');
    return;
  }

  try {
    const payload = {
      event: 'interested_email_received',
      timestamp: new Date().toISOString(),
      email: {
        messageId: email.messageId,
        subject: email.subject,
        from: email.from,
        to: email.to,
        date: email.date,
        label: email.label,
        account: email.account
      },
      metadata: {
        source: 'SmartInbox',
        version: '1.0.0',
        trigger: 'ai_categorization'
      }
    };

    const response = await axios.post(WEBHOOK_SITE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SmartInbox-Webhook/1.0'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('✅ Webhook triggered successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to trigger webhook:', error.message);
    throw error;
  }
}

module.exports = { triggerWebhook };
