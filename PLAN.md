### **Problem Statement**

We are looking for the best candidates who can build a highly functional **onebox email aggregator** with advanced features, similar to **Reachinbox**. Your task is to **create a backend and frontend system** that synchronizes multiple IMAP email accounts in real-time and provides a seamless, searchable, and AI-powered experience.

### **Requirements & Features**

For the **Backend Engineering assignment**, you will begin by building and showcasing the listed features using Postman. If you're able to successfully complete point 5, you will then integrate and display all the features on the frontend. Achieving this will demonstrate your ability to work end-to-end. Lastly, completing point 6 will secure you a direct invitation to the final interview. 

Use Language: Typescript, Node.js runtime.

### **1. Real-Time Email Synchronization**

- Sync multiple **IMAP accounts** in real-time - minimum 2
- Fetch **at least the last 30 days** of emails
- Use **persistent IMAP connections (IDLE mode)** for real-time updates (**No cron jobs!**).

### **2. Searchable Storage using Elasticsearch**

- Store emails in a **locally hosted Elasticsearch** instance (use Docker).
- Implement indexing to **make emails searchable**.
- Support filtering by **folder & account**.

### **3. AI-Based Email Categorization**

- Implement an AI model to categorize emails into the following labels:
    - **Interested**
    - **Meeting Booked**
    - **Not Interested**
    - **Spam**
    - **Out of Office**

### **4. Slack & Webhook Integration**

- Send **Slack notifications** for every new **Interested** email.
- Trigger **webhooks** (use [webhook.site](https://webhook.site) as the webhook URL) for external automation when an email is marked as **Interested**.

### **5. Frontend Interface**

- Build a **simple UI** to display emails, filter by folder/account, and show AI categorization.
- Basic **email search functionality** powered by Elasticsearch.

### **6. AI-Powered Suggested Replies (Direct invitation to final interview)**

- Store the **product and outreach agenda** in a **vector database**.
- Use **RAG (Retrieval-Augmented Generation)** with any LLM to suggest replies.
- Example:
    - **Training data**: "I am applying for a job position. If the lead is interested, share the meeting booking link: https://cal.com/example"
    - **Email received**:*"Hi, Your resume has been shortlisted. When will be a good time for you to attend the technical interview?"*
    - **AI Reply Suggestion**:*"Thank you for shortlisting my profile! I'm available for a technical interview. You can book a slot here: https://cal.com/example"*