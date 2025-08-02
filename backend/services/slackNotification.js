const axios = require('axios');
require('dotenv').config();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

async function sendSlackNotification(email) {
  if (!SLACK_WEBHOOK_URL || SLACK_WEBHOOK_URL === 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK') {
    console.log('⚠️ Slack webhook URL not configured, skipping notification');
    return;
  }

  try {
    const message = {
      text: "🎯 New Interested Email Received!",
      attachments: [
        {
          color: "good",
          fields: [
            {
              title: "Subject",
              value: email.subject || '(no subject)',
              short: false
            },
            {
              title: "From",
              value: email.from || 'Unknown sender',
              short: true
            },
            {
              title: "Date",
              value: new Date(email.date).toLocaleString(),
              short: true
            },
            {
              title: "Label",
              value: email.label || 'No label',
              short: true
            },
            {
              title: "Account",
              value: email.account || 'Unknown account',
              short: true
            }
          ],
          footer: "SmartInbox Email Aggregator",
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    const response = await axios.post(SLACK_WEBHOOK_URL, message);
    console.log('✅ Slack notification sent successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error.message);
    throw error;
  }
}

module.exports = { sendSlackNotification };
