require('dotenv').config();
const axios = require('axios');

const FLASK_MODEL_URI = process.env.FLASK_MODEL_URI;

async function testCategorization() {
  const testEmail = {
    subject: "And the winner is... - AWS Presents: Breaking Barriers Virtual Challenge",
    body: `The judges have weighed in, and we're excited to share the news! Go to the AWS Presents: Breaking Barriers Virtual Challenge gallery to congratulate the winners and check out all of the awesome submissions.

Even though the competition is over, you don't have to stop coding. Update your portfolio to inform your followers about new projects and get feedback from fellow hackers.

Questions? If you have any questions about the hackathon, please post on the discussion forum.`
  };
  console.log(FLASK_MODEL_URI);
  try {
    const res = await axios.post(FLASK_MODEL_URI, testEmail);
    console.log('✅ AI label received:', res.data.label);
  } catch (err) {
    console.error('❌ AI model error:', err.response?.data || err.message);
  }
}

testCategorization();
