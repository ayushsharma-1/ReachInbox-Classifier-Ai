import React from 'react';
import { BarChart3, Mail, Star, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Analytics = ({ stats = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const {
    totalEmails = 0,
    interestedEmails = 0,
    notInterestedEmails = 0,
    drafts = 0,
    classifiedEmails = 0,
    unclassifiedEmails = 0
  } = stats;

  const classificationRate = totalEmails > 0 ? ((classifiedEmails / totalEmails) * 100).toFixed(1) : 0;
  const importantRate = totalEmails > 0 ? ((interestedEmails / totalEmails) * 100).toFixed(1) : 0;

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Analytics</h1>
        <p className="text-gray-600">Overview of your email management and AI classification performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Emails"
          value={totalEmails}
          icon={Mail}
          color="bg-blue-500"
          subtitle="All emails in database"
        />
        <StatCard
          title="Important Emails"
          value={interestedEmails}
          icon={Star}
          color="bg-yellow-500"
          subtitle={`${importantRate}% of total`}
        />
        <StatCard
          title="Spam Emails"
          value={notInterestedEmails}
          icon={AlertTriangle}
          color="bg-red-500"
          subtitle="Filtered by AI"
        />
        <StatCard
          title="AI Drafts"
          value={drafts}
          icon={FileText}
          color="bg-purple-500"
          subtitle="Generated responses"
        />
      </div>

      {/* Classification Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Classification Rate */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Classification Rate</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Classified Emails</span>
                <span className="font-medium">{classificationRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${classificationRate}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Classified</p>
                <p className="text-lg font-semibold text-gray-900">{classifiedEmails}</p>
              </div>
              <div>
                <p className="text-gray-600">Unclassified</p>
                <p className="text-lg font-semibold text-gray-900">{unclassifiedEmails}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Email Distribution</h3>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Important</span>
              </div>
              <span className="text-sm font-medium">{interestedEmails}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Spam</span>
              </div>
              <span className="text-sm font-medium">{notInterestedEmails}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Unclassified</span>
              </div>
              <span className="text-sm font-medium">{unclassifiedEmails}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Performance */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Classification Accuracy</h4>
            <p className="text-sm text-gray-600">AI model successfully classifies emails with high precision</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Draft Generation</h4>
            <p className="text-sm text-gray-600">Automated responses for important emails save time</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Smart Filtering</h4>
            <p className="text-sm text-gray-600">Focus on important emails while filtering out spam</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
