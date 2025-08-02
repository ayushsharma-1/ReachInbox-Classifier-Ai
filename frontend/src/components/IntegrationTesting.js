import React, { useState } from 'react';
import { Slack, Webhook, Mail, CheckCircle, XCircle, Loader, ExternalLink } from 'lucide-react';

const IntegrationCard = ({ title, description, icon: Icon, onTest, testResult, isLoading, color }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {testResult && (
          testResult.success ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )
        )}
      </div>
    </div>

    <div className="space-y-3">
      <button
        onClick={onTest}
        disabled={isLoading}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Testing...</span>
          </>
        ) : (
          <span>Test Integration</span>
        )}
      </button>

      {testResult && (
        <div className={`p-3 rounded-lg text-sm ${
          testResult.success 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-1">
            {testResult.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span className="font-medium">
              {testResult.success ? 'Success' : 'Failed'}
            </span>
          </div>
          <p>{testResult.message}</p>
          {testResult.details && (
            <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
              {JSON.stringify(testResult.details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  </div>
);

const IntegrationTesting = ({ onSlackTest, onWebhookTest, onGmailConnect }) => {
  const [slackResult, setSlackResult] = useState(null);
  const [webhookResult, setWebhookResult] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    slack: false,
    webhook: false,
    gmail: false
  });

  const handleSlackTest = async () => {
    setLoadingStates(prev => ({ ...prev, slack: true }));
    try {
      const result = await onSlackTest();
      setSlackResult({
        success: true,
        message: 'Slack notification sent successfully!',
        details: result
      });
    } catch (error) {
      setSlackResult({
        success: false,
        message: error.message || 'Slack test failed',
        details: error.response?.data
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, slack: false }));
    }
  };

  const handleWebhookTest = async () => {
    setLoadingStates(prev => ({ ...prev, webhook: true }));
    try {
      const result = await onWebhookTest();
      setWebhookResult({
        success: true,
        message: 'Webhook triggered successfully!',
        details: result
      });
    } catch (error) {
      setWebhookResult({
        success: false,
        message: error.message || 'Webhook test failed',
        details: error.response?.data
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, webhook: false }));
    }
  };

  const handleGmailConnect = () => {
    setLoadingStates(prev => ({ ...prev, gmail: true }));
    onGmailConnect();
    // Reset loading state after a delay since we're redirecting
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, gmail: false }));
    }, 2000);
  };

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Integration Testing</h1>
        <p className="text-gray-600">Test and manage your integrations with external services</p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <IntegrationCard
          title="Gmail Connection"
          description="Connect your Gmail account to sync emails and enable AI classification"
          icon={Mail}
          onTest={handleGmailConnect}
          testResult={null}
          isLoading={loadingStates.gmail}
          color="bg-red-500"
        />

        <IntegrationCard
          title="Slack Notifications"
          description="Send notifications to Slack when important emails are detected"
          icon={Slack}
          onTest={handleSlackTest}
          testResult={slackResult}
          isLoading={loadingStates.slack}
          color="bg-purple-500"
        />

        <IntegrationCard
          title="Webhook Integration"
          description="Trigger external webhooks when important emails are classified"
          icon={Webhook}
          onTest={handleWebhookTest}
          testResult={webhookResult}
          isLoading={loadingStates.webhook}
          color="bg-blue-500"
        />
      </div>

      {/* Integration Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Information</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Gmail OAuth2</h4>
              <p className="text-sm text-gray-600">
                Securely connects to your Gmail account using OAuth2 authentication. 
                Emails are automatically synced and classified using our AI model.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Slack className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Slack Webhooks</h4>
              <p className="text-sm text-gray-600">
                Sends real-time notifications to your Slack channel when important emails are detected.
                Configure webhook URL in your environment variables.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Webhook className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">External Webhooks</h4>
              <p className="text-sm text-gray-600">
                Triggers custom webhooks to integrate with your existing systems and workflows.
                Perfect for automation and third-party integrations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Setup Info */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExternalLink className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Environment Configuration</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Make sure to configure the following environment variables in your backend:
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• <code className="bg-yellow-100 px-1 rounded">SLACK_WEBHOOK_URL</code> - Your Slack webhook URL</li>
              <li>• <code className="bg-yellow-100 px-1 rounded">WEBHOOK_URL</code> - External webhook endpoint</li>
              <li>• <code className="bg-yellow-100 px-1 rounded">GMAIL_CLIENT_ID</code> - Gmail OAuth client ID</li>
              <li>• <code className="bg-yellow-100 px-1 rounded">GMAIL_CLIENT_SECRET</code> - Gmail OAuth client secret</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationTesting;
