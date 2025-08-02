# SmartInbox - AI-Powered Email Aggregator

A real-time email management system with AI-powered categorization, Elasticsearch search, and Slack/Webhook integrations. Built ### **Authentication**
```bash
# Start OAuth flow
GET /auth/gmail/initiate

# OAuth callback (automatic)
GET /oauth2callback?code=...
```

### **AI Draft Management**
```bash
# Get all drafts
GET /api/drafts?accountId=ID&status=draft&limit=20

# Get specific draft
GET /api/drafts/:id

# Update draft
PUT /api/drafts/:id

# Generate draft for specific email
POST /api/emails/:emailId/generate-draft

# Test AI draft generation
POST /api/ai/test-draft
```e.js, MongoDB, and Elasticsearch.

## 🚀 Features

### ✅ **Step 1: Real-Time Email Synchronization**
- Gmail IMAP integration with OAuth2 authentication
- Fetches last 30 days of emails automatically
- Real-time email sync using IDLE mode (no cron jobs)
- Persistent IMAP connections for instant updates

### ✅ **Step 2: Searchable Storage with Elasticsearch**
- Local Elasticsearch instance (Docker)
- Advanced email search and filtering
- Support for filtering by folder, account, and labels
- Pagination and sorting capabilities

### ✅ **Step 3: AI-Based Email Categorization**
- Automatic email categorization using Flask API
- Categories: **Interested**, **Meeting Booked**, **Not Interested**, **Spam**, **Out of Office**
- Real-time AI labeling during email sync

### ✅ **Step 4: Slack & Webhook Integration**
- Slack notifications for "Interested" emails
- Webhook triggers to webhook.site for external automation
- Test endpoints for integration validation

### ✅ **Step 5: AI-Powered Draft Generation**
- **Gemini AI integration** for automatic email draft generation
- **Smart draft creation** for "Interested" and important emails
- **Contextual replies** based on user background
- **Draft management system** with status tracking
- **RESTful API** for draft operations (CRUD)

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Cloud), Elasticsearch (Local)
- **Search**: Elasticsearch with advanced querying
- **Email**: IMAP with Gmail OAuth2
- **AI**: External Flask API for categorization
- **Integrations**: Slack, Webhooks
- **Authentication**: Google OAuth2

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **Gmail Account** with App Password or OAuth2 setup
- **MongoDB Atlas** account (or local MongoDB)
- **Slack Workspace** (optional, for notifications)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Ashmit-Kumar/SmartInbox.git
cd SmartInbox
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Gmail OAuth2 Configuration
CLIENT_ID=your-google-client-id
CLIENT_SECRET=your-google-client-secret
REDIRECT_URI=http://localhost:3000/oauth2callback

# AI Categorization
FLASK_MODEL_URI=https://email-classifier-yw26.onrender.com/predict

# Gemini AI for Draft Generation
GEMINI_API_KEY=your-gemini-api-key-here

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/emails?retryWrites=true&w=majority
ELASTICSEARCH_NODE=http://localhost:9200

# Slack & Webhook Integration (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
WEBHOOK_SITE_URL=https://webhook.site/YOUR-UNIQUE-URL
```

### 4. Start Elasticsearch
```bash
docker-compose up elasticsearch -d
```

Wait for Elasticsearch to be ready (check logs):
```bash
docker-compose logs elasticsearch
```

### 5. Run the Application
```bash
node index.js
```

You should see:
```
Server running on http://localhost:3000
🟢 Elasticsearch index "emails" already exists
```

## 🔐 Google OAuth2 Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Gmail API**

### 2. Configure OAuth2
1. Go to **APIs & Services** → **Credentials**
2. Create **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized redirect URIs: `http://localhost:3000/oauth2callback`
5. Copy **Client ID** and **Client Secret** to `.env`

### 3. OAuth Consent Screen
1. Configure OAuth consent screen
2. Add your email as test user
3. Add scopes: `https://mail.google.com/` and `https://www.googleapis.com/auth/userinfo.email`

## 📧 Email Setup Process

### 1. Start OAuth Flow
Visit: `http://localhost:3000/auth/gmail/initiate`

### 2. Complete Gmail Authorization
- Login to your Gmail account
- Grant permissions for email access
- You'll be redirected back to the application

### 3. Automatic Email Sync
- Application will automatically fetch last 30 days of emails
- Real-time sync will start for new emails
- Check console for sync progress

## 🔌 API Endpoints

### Email Management
```bash
# Get all emails with filtering
GET /api/emails?limit=10&offset=0&accountId=ID&label=Interested

# Search emails
GET /api/emails/search?q=meeting&folder=INBOX&label=Spam

# Get single email
GET /api/emails/:id

# Get all interested emails
GET /api/emails/interested
```

### Integration Testing
```bash
# Test Slack integration
POST /api/slack/test

# Test webhook integration
POST /api/webhook/test
```

### Authentication
```bash
# Start OAuth flow
GET /auth/gmail/initiate

# OAuth callback (automatic)
GET /oauth2callback?code=...
```

## 🧪 Testing with Postman

### 1. Test Sequence
1. **Authentication**: Start OAuth flow
2. **Email Retrieval**: Test `/api/emails`
3. **Search**: Test `/api/emails/search`
4. **Filtering**: Test with different parameters
5. **Integrations**: Test Slack and webhook endpoints

### 2. Sample Requests

**Get Recent Emails:**
```bash
GET http://localhost:3000/api/emails?limit=5
```

**Search for Meetings:**
```bash
GET http://localhost:3000/api/emails/search?q=meeting
```

**Filter by Label:**
```bash
GET http://localhost:3000/api/emails?label=Interested
```

## 🔧 Slack Integration Setup

### 1. Create Slack App
1. Go to [Slack API](https://api.slack.com/apps)
2. Create new app → From scratch
3. Choose your workspace

### 2. Enable Incoming Webhooks
1. Go to **Incoming Webhooks**
2. Activate incoming webhooks
3. Create webhook for your channel
4. Copy webhook URL to `.env`

### 3. Test Integration
```bash
curl -X POST http://localhost:3000/api/slack/test
```

## 🌐 Webhook Integration Setup

### 1. Get Webhook URL
1. Visit [webhook.site](https://webhook.site)
2. Copy your unique URL
3. Add to `.env` as `WEBHOOK_SITE_URL`

### 2. Test Integration
```bash
curl -X POST http://localhost:3000/api/webhook/test
```

### 3. Monitor Webhooks
- Check webhook.site for received payloads
- Verify payload structure and data

## 🐳 Docker Setup (Alternative)

### Full Docker Setup
```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Elasticsearch Only
```bash
# Start just Elasticsearch
docker-compose up elasticsearch -d

# Check Elasticsearch health
curl http://localhost:9200/_cluster/health
```

## 🔍 Troubleshooting

### Common Issues

**1. Elasticsearch Connection Error**
```bash
# Check if Elasticsearch is running
curl http://localhost:9200

# Check Docker container
docker-compose ps elasticsearch
```

**2. Gmail Authentication Issues**
- Verify OAuth2 credentials in `.env`
- Check redirect URI matches Google Console
- Ensure Gmail API is enabled

**3. Email Sync Not Working**
- Check console logs for IMAP errors
- Verify account permissions
- Test with fresh OAuth token

**4. AI Categorization Failing**
```bash
# Test Flask API directly
curl -X POST https://email-classifier-yw26.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"subject": "Meeting invitation", "body": "Would you like to schedule a call?"}'
```

### Debug Commands

**Check Application Status:**
```bash
# Test all endpoints
curl http://localhost:3000/api/emails
curl http://localhost:3000/api/emails/search?q=test
```

**Check Elasticsearch:**
```bash
# Elasticsearch health
curl http://localhost:9200/_cluster/health

# Check email index
curl http://localhost:9200/emails/_search
```

## 📊 Monitoring

### Application Logs
Monitor console output for:
- ✅ Email sync progress
- 🔍 Elasticsearch indexing
- 🎯 AI categorization results
- 📧 Slack notifications
- 🔗 Webhook triggers

### Elasticsearch Monitoring
```bash
# Index statistics
curl http://localhost:9200/emails/_stats

# Search all emails
curl http://localhost:9200/emails/_search?pretty
```

## 📝 API Response Examples

### Get Emails Response
```json
{
  "success": true,
  "emails": [
    {
      "messageId": "12345",
      "subject": "Meeting Request",
      "from": "sender@example.com",
      "to": "user@gmail.com",
      "date": "2024-01-15T10:30:00Z",
      "body": "Email content here...",
      "label": "important",
      "account": "account_id"
    }
  ],
  "count": 1
}
```

### Search Response
```json
{
  "success": true,
  "emails": [
    {
      "messageId": "12345",
      "subject": "Meeting Request",
      "from": "sender@example.com",
      "highlight": {
        "subject": ["<em>Meeting</em> Request"]
      }
    }
  ]
}
```

## 🚀 Production Deployment

### Environment Variables
Ensure all production values in `.env`:
- Use production MongoDB cluster
- Configure production Elasticsearch
- Set up production Slack/webhook URLs

### Security Considerations
- Never commit `.env` to version control
- Use environment-specific configurations
- Implement proper error handling
- Add rate limiting for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check troubleshooting section
- Review API documentation

---

**Built with ❤️ for efficient email management**
- 🎯 **Interested**: Potential leads and opportunities
- 📅 **Meeting Booked**: Scheduled meetings and appointments
- ❌ **Not Interested**: Declined opportunities
- 🚫 **Spam**: Unwanted emails
- 🏢 **Out of Office**: Automated responses

### 4. Slack & Webhook Integration
- **Slack notifications**: Instant notifications for "Interested" emails
- **Webhook triggers**: External automation via webhook.site
- **Real-time alerts**: Stay updated on important email categories

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Cloud), Elasticsearch (Local)
- **Search**: Elasticsearch with advanced querying
- **Email**: IMAP with Gmail OAuth2
- **AI**: External Flask API for categorization
- **Integrations**: Slack, Webhooks
- **Authentication**: Google OAuth2
- **AI/ML**: Custom categorization model + LLM for reply suggestions
- **Vector Database**: For RAG implementation
- **Integration**: Slack API, Webhooks
- **Frontend**: Modern web interface
- **Containerization**: Docker for Elasticsearch

## 📋 Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- TypeScript
- IMAP-enabled email accounts (minimum 2)
- Slack workspace (for notifications)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Ashmit-Kumar/SmartInbox.git
cd SmartInbox
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file with your configuration:
```env
# Email Accounts
IMAP_ACCOUNT_1_HOST=imap.gmail.com
IMAP_ACCOUNT_1_PORT=993
IMAP_ACCOUNT_1_USER=your-email1@gmail.com
IMAP_ACCOUNT_1_PASSWORD=your-app-password1

IMAP_ACCOUNT_2_HOST=imap.outlook.com
IMAP_ACCOUNT_2_PORT=993
IMAP_ACCOUNT_2_USER=your-email2@outlook.com
IMAP_ACCOUNT_2_PASSWORD=your-app-password2

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_CHANNEL=#email-alerts

# Webhook
WEBHOOK_URL=https://webhook.site/your-unique-url
```

### 4. Start Elasticsearch
```bash
docker-compose up -d elasticsearch
```

### 5. Run the Application
```bash
node index.js
```

## 📁 Project Structure

```
SmartInbox/
├── auth/
│   └── gmail.js            # Gmail OAuth2 authentication
├── elasticsearch/
│   └── client.js           # Elasticsearch client setup
├── imap/
│   ├── gmailClient.js      # Gmail IMAP connection
│   ├── imapClient.js       # Generic IMAP client
│   └── connectionManager.js
├── models/
│   ├── Email.js            # Email data model
│   └── Account.js          # Account data model
├── services/
│   ├── emailSync.js        # Email synchronization & search
│   ├── emailSearch.js      # Email search service
│   ├── slackNotification.js # Slack integration
│   └── webhookTrigger.js   # Webhook integration
├── utils/
│   └── imapUtils.js        # IMAP utility functions
├── docs/
│   └── postman-collection.json
├── index.js                # Main application server
├── docker-compose.yml      # Elasticsearch Docker setup
├── package.json            # Dependencies
├── .env                    # Environment variables
└── README.md              # This file
```

## 🔌 API Endpoints (Actually Implemented)

### Email Management
```bash
# Get all emails with filtering (Elasticsearch)
GET /api/emails?limit=10&offset=0&accountId=ID&label=Interested

# Search emails (Elasticsearch)
GET /api/emails/search?q=meeting&folder=INBOX&label=Spam

# Get single email by ID
GET /api/emails/:id

# Get all interested emails
GET /api/emails/interested
```

### Integration Testing
```bash
# Test Slack integration
POST /api/slack/test

# Test webhook integration
POST /api/webhook/test
```

### Authentication
```bash
# Start OAuth flow
GET /auth/gmail/initiate

# OAuth callback (automatic)
GET /oauth2callback?code=...
```

## 🧪 Testing with Postman

1. Import the provided Postman collection
2. Set up environment variables
3. Test each endpoint sequentially
4. Verify real-time synchronization
5. Check Elasticsearch indexing
6. Validate AI categorization
7. Test Slack and webhook integrations

## 📊 Monitoring & Analytics

- Real-time email sync status
- Categorization accuracy metrics
- Search performance analytics
- Integration health checks

## 🔒 Security Features

- Secure IMAP connection handling
- Environment variable protection
- API rate limiting
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🎯 Development Milestones

- [x] **Phase 1**: IMAP synchronization and Elasticsearch setup
- [x] **Phase 2**: AI categorization implementation
- [x] **Phase 3**: Slack and webhook integration
- [x] **Phase 4**: Frontend interface development
- [ ] **Phase 5**: AI-powered reply suggestions (Bonus)


