import React from 'react';
import { Mail, Inbox, Star, Send, FileText, BarChart3, Settings, Plus } from 'lucide-react';

const Sidebar = ({ activeView, onViewChange, stats = {} }) => {
  const menuItems = [
    {
      id: 'inbox',
      label: 'All Emails',
      icon: Inbox,
      count: stats.totalEmails || 0,
      color: 'text-gray-600'
    },
    {
      id: 'interested',
      label: 'Important',
      icon: Star,
      count: stats.interestedEmails || 0,
      color: 'text-yellow-600'
    },
    {
      id: 'not-interested',
      label: 'Spam',
      icon: Mail,
      count: stats.notInterestedEmails || 0,
      color: 'text-red-600'
    },
    {
      id: 'drafts',
      label: 'AI Drafts',
      icon: FileText,
      count: stats.drafts || 0,
      color: 'text-blue-600'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      count: null,
      color: 'text-green-600'
    },
  ];

  const integrationItems = [
    {
      id: 'connect-gmail',
      label: 'Connect Gmail',
      icon: Plus,
      color: 'text-primary-600'
    },
    {
      id: 'slack-test',
      label: 'Test Slack',
      icon: Send,
      color: 'text-purple-600'
    },
    {
      id: 'webhook-test',
      label: 'Test Webhook',
      icon: Settings,
      color: 'text-orange-600'
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">SmartInbox</h1>
            <p className="text-xs text-gray-500">AI Email Management</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Email Management
          </h3>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count !== null && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Integration Section */}
        <div className="mt-8 space-y-1">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Integrations
          </h3>
          {integrationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : item.color}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>SmartInbox v1.0.0</p>
          <p>AI-Powered Email Management</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
