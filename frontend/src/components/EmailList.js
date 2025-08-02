import React from 'react';
import { Star, Clock, User, Mail, Sparkles } from 'lucide-react';
import moment from 'moment';

const EmailItem = ({ email, isSelected, onClick, onGenerateDraft }) => {
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
        return <Star className="w-3 h-3" />;
      case 'not interested':
      case 'spam':
        return <Mail className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onClick(email)}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
        isSelected ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {email.from || 'Unknown Sender'}
                </p>
                <p className="text-xs text-gray-500">
                  {email.to}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Classification Badge */}
              {email.label && (
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getClassificationColor(email.label)}`}>
                  {getClassificationIcon(email.label)}
                  <span>{email.label}</span>
                </span>
              )}
              <div className="text-xs text-gray-500 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{moment(email.date).format('MMM D, HH:mm')}</span>
              </div>
            </div>
          </div>

          {/* Subject */}
          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
            {email.subject || '(No Subject)'}
          </h3>

          {/* Preview */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {email.body ? email.body.substring(0, 150) + '...' : 'No content preview available'}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                ID: {email.messageId?.substring(0, 8)}...
              </span>
            </div>
            
            {(email.label?.toLowerCase() === 'interested' || email.label?.toLowerCase() === 'important') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateDraft(email);
                }}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate AI Draft</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailList = ({ emails = [], selectedEmail, onEmailSelect, onGenerateDraft, loading = false, title = "Emails" }) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading emails...</p>
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
          <p className="text-gray-500">
            {title === "All Emails" 
              ? "Connect your Gmail account to start managing emails." 
              : `No ${title.toLowerCase()} to display.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500">
            {emails.length} email{emails.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {emails.map((email) => (
          <EmailItem
            key={email._id || email.messageId}
            email={email}
            isSelected={selectedEmail?._id === email._id || selectedEmail?.messageId === email.messageId}
            onClick={onEmailSelect}
            onGenerateDraft={onGenerateDraft}
          />
        ))}
      </div>
    </div>
  );
};

export default EmailList;
