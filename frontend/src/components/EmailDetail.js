import React from 'react';
import { User, Calendar, Star, Mail, Sparkles, ArrowLeft } from 'lucide-react';
import moment from 'moment';

const EmailDetail = ({ email, onBack, onGenerateDraft }) => {
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an email</h3>
          <p className="text-gray-500">Choose an email from the list to view its details.</p>
        </div>
      </div>
    );
  }

  const getClassificationColor = (label) => {
    switch (label?.toLowerCase()) {
      case 'interested':
      case 'important':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not interested':
      case 'spam':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getClassificationIcon = (label) => {
    switch (label?.toLowerCase()) {
      case 'interested':
      case 'important':
        return <Star className="w-4 h-4" />;
      case 'not interested':
      case 'spam':
        return <Mail className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {email.subject || '(No Subject)'}
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{email.from || 'Unknown Sender'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{moment(email.date).format('MMMM D, YYYY [at] HH:mm')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Classification Badge */}
            {email.label && (
              <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getClassificationColor(email.label)}`}>
                {getClassificationIcon(email.label)}
                <span>{email.label}</span>
              </span>
            )}
            
            {/* Generate Draft Button */}
            {(email.label?.toLowerCase() === 'interested' || email.label?.toLowerCase() === 'important') && (
              <button
                onClick={() => onGenerateDraft(email)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Draft</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Email Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">From:</span>
                <p className="text-gray-900 mt-1">{email.from || 'Unknown Sender'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">To:</span>
                <p className="text-gray-900 mt-1">{email.to || 'Unknown Recipient'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date:</span>
                <p className="text-gray-900 mt-1">{moment(email.date).format('LLLL')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Message ID:</span>
                <p className="text-gray-900 mt-1 font-mono text-xs">{email.messageId}</p>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="prose max-w-none">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h3>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {email.body || 'No content available for this email.'}
              </div>
            </div>
          </div>

          {/* AI Classification Info */}
          {email.label && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">AI Classification</h4>
              <p className="text-sm text-blue-700">
                This email has been automatically classified as "{email.label}" by our AI model based on its content and context.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
