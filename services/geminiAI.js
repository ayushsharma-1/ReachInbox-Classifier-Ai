const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmailDraft(email) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.log('⚠️ Gemini API key not configured, skipping draft generation');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an AI assistant helping to generate professional email draft replies. 

Given the following email details:
- Subject: ${email.subject || '(no subject)'}
- From: ${email.from || 'Unknown sender'}
- Email Content: ${email.body || 'No content'}
- Category: ${email.label || 'Unknown'}

Please generate a professional, contextually appropriate draft reply. Consider:
1. The tone should match the original email's formality
2. If it's about a job opportunity, express interest and availability
3. If it's a meeting request, provide availability options
4. If it's a business inquiry, be helpful and informative
5. Keep it concise but comprehensive
6. Include appropriate greetings and closings

Generate ONLY the email content without any additional explanations or metadata.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const draftContent = response.text();

    console.log('✅ Email draft generated successfully using Gemini AI');
    return {
      originalEmail: {
        subject: email.subject,
        from: email.from,
        messageId: email.messageId
      },
      draftReply: {
        subject: `Re: ${email.subject || '(no subject)'}`,
        content: draftContent.trim(),
        generatedAt: new Date(),
        aiModel: 'gemini-1.5-flash'
      }
    };

  } catch (error) {
    console.error('❌ Failed to generate email draft with Gemini AI:', error.message);
    throw error;
  }
}

async function generateContextualReply(email, context = '') {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.log('⚠️ Gemini API key not configured, skipping contextual reply generation');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an AI assistant generating personalized email replies based on user context.

User Context/Background: ${context}

Email to Reply to:
- Subject: ${email.subject || '(no subject)'}
- From: ${email.from || 'Unknown sender'}
- Content: ${email.body || 'No content'}
- Category: ${email.label || 'Unknown'}

Generate a personalized, professional reply that:
1. References the user's background/context when relevant
2. Addresses the sender's specific points or requests
3. Maintains professional tone
4. Includes clear next steps if applicable
5. Is concise but complete

Generate ONLY the email reply content.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const replyContent = response.text();

    console.log('✅ Contextual email reply generated using Gemini AI');
    return {
      originalEmail: {
        subject: email.subject,
        from: email.from,
        messageId: email.messageId
      },
      contextualReply: {
        subject: `Re: ${email.subject || '(no subject)'}`,
        content: replyContent.trim(),
        context: context,
        generatedAt: new Date(),
        aiModel: 'gemini-1.5-flash'
      }
    };

  } catch (error) {
    console.error('❌ Failed to generate contextual reply with Gemini AI:', error.message);
    throw error;
  }
}

module.exports = { 
  generateEmailDraft, 
  generateContextualReply 
};
