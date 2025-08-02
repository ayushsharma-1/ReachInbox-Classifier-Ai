require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSlackIntegration() {
  console.log('\n🔔 Testing Slack Integration...');
  try {
    const response = await axios.post(`${BASE_URL}/api/slack/test`);
    console.log('✅ Slack test result:', response.data);
  } catch (error) {
    console.error('❌ Slack test failed:', error.response?.data || error.message);
  }
}

async function testWebhookIntegration() {
  console.log('\n🔗 Testing Webhook Integration...');
  try {
    const response = await axios.post(`${BASE_URL}/api/webhook/test`);
    console.log('✅ Webhook test result:', response.data);
  } catch (error) {
    console.error('❌ Webhook test failed:', error.response?.data || error.message);
  }
}

async function testGeminiAIDraft() {
  console.log('\n🤖 Testing Gemini AI Draft Generation...');
  try {
    const testData = {
      subject: 'Job Interview Opportunity - Software Developer Position',
      from: 'hr@techcompany.com',
      body: 'Hello, We were impressed with your application and would like to schedule a technical interview. Could you let us know your availability for next week? We are flexible with timing.',
      context: 'I am a software developer with 3 years of experience in Node.js and React. I am actively looking for new opportunities and available for interviews.'
    };

    const response = await axios.post(`${BASE_URL}/api/ai/test-draft`, testData);
    console.log('✅ Gemini AI test result:', response.data);
    
    if (response.data.generatedDraft) {
      console.log('\n📧 Generated Draft:');
      console.log('Subject:', response.data.generatedDraft.draftReply?.subject || response.data.generatedDraft.contextualReply?.subject);
      console.log('Content:');
      console.log(response.data.generatedDraft.draftReply?.content || response.data.generatedDraft.contextualReply?.content);
    }
  } catch (error) {
    console.error('❌ Gemini AI test failed:', error.response?.data || error.message);
  }
}

async function testDraftManagement() {
  console.log('\n📝 Testing Draft Management API...');
  try {
    const response = await axios.get(`${BASE_URL}/api/drafts?limit=5`);
    console.log('✅ Draft list result:', {
      success: response.data.success,
      total: response.data.total,
      count: response.data.count
    });
    
    if (response.data.drafts && response.data.drafts.length > 0) {
      console.log('📄 Sample draft:', {
        id: response.data.drafts[0]._id,
        subject: response.data.drafts[0].draftSubject,
        category: response.data.drafts[0].category,
        status: response.data.drafts[0].status
      });
    }
  } catch (error) {
    console.error('❌ Draft management test failed:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting SmartInbox Integration Tests...');
  console.log('='.repeat(50));
  
  await testSlackIntegration();
  await testWebhookIntegration();
  await testGeminiAIDraft();
  await testDraftManagement();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!');
  console.log('\n💡 Next Steps:');
  console.log('1. Replace SLACK_WEBHOOK_URL in .env with your actual Slack webhook');
  console.log('2. Add your Gemini API key to .env');
  console.log('3. Start the application with: node index.js');
  console.log('4. Test OAuth flow: http://localhost:3000/auth/gmail/initiate');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testSlackIntegration,
  testWebhookIntegration,
  testGeminiAIDraft,
  testDraftManagement,
  runAllTests
};
