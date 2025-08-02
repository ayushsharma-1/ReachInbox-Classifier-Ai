import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import DraftList from './components/DraftList';
import Analytics from './components/Analytics';
import IntegrationTesting from './components/IntegrationTesting';

import { emailAPI, statsAPI, draftAPI, integrationAPI, authAPI } from './services/api';

import './index.css';

function App() {
  const [activeView, setActiveView] = useState('inbox');
  const [emails, setEmails] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalEmails: 0,
    interestedEmails: 0,
    notInterestedEmails: 0,
    drafts: 0,
    classifiedEmails: 0,
    unclassifiedEmails: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load data when view changes
  useEffect(() => {
    loadViewData();
  }, [activeView, searchQuery]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load stats first
      await loadStats();
      // Load default view data
      await loadViewData();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load data. Please check your connection.');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const loadViewData = async () => {
    if (loading) return; // Prevent multiple simultaneous loads
    
    setLoading(true);
    try {
      switch (activeView) {
        case 'inbox':
          await loadAllEmails();
          break;
        case 'interested':
          await loadInterestedEmails();
          break;
        case 'not-interested':
          await loadNotInterestedEmails();
          break;
        case 'drafts':
          await loadDrafts();
          break;
        case 'analytics':
          // Analytics data is loaded via stats
          break;
        default:
          // Integration testing and other views don't need data loading
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${activeView} data:`, error);
      toast.error(`Failed to load ${activeView} data`);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await statsAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadAllEmails = async () => {
    try {
      const params = searchQuery ? { limit: 100 } : { limit: 50 };
      let response;
      
      if (searchQuery) {
        response = await emailAPI.searchEmails(searchQuery);
      } else {
        response = await emailAPI.getEmails(params);
      }
      
      setEmails(response.data.emails || []);
    } catch (error) {
      console.error('Failed to load emails:', error);
      setEmails([]);
    }
  };

  const loadInterestedEmails = async () => {
    try {
      const response = await emailAPI.getInterestedEmails({ limit: 50 });
      setEmails(response.data.emails || []);
    } catch (error) {
      console.error('Failed to load interested emails:', error);
      setEmails([]);
    }
  };

  const loadNotInterestedEmails = async () => {
    try {
      const response = await emailAPI.getNotInterestedEmails({ limit: 50 });
      setEmails(response.data.emails || []);
    } catch (error) {
      console.error('Failed to load not interested emails:', error);
      setEmails([]);
    }
  };

  const loadDrafts = async () => {
    try {
      const response = await draftAPI.getDrafts({ limit: 50 });
      setDrafts(response.data.drafts || []);
    } catch (error) {
      console.error('Failed to load drafts:', error);
      setDrafts([]);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedEmail(null);
  };

  const handleRefresh = async () => {
    await loadInitialData();
    toast.success('Data refreshed successfully!');
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setSelectedEmail(null);
    setEmails([]);
    setDrafts([]);
  };

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
  };

  const handleGenerateDraft = async (email) => {
    try {
      setLoading(true);
      toast.loading('Generating AI draft...', { id: 'draft-gen' });
      
      const response = await emailAPI.generateDraft(email._id || email.messageId, '');
      
      toast.success('AI draft generated successfully!', { id: 'draft-gen' });
      
      // Refresh stats and drafts if we're on the drafts view
      await loadStats();
      if (activeView === 'drafts') {
        await loadDrafts();
      }
      
    } catch (error) {
      toast.error('Failed to generate draft: ' + (error.response?.data?.error || error.message), { id: 'draft-gen' });
    } finally {
      setLoading(false);
    }
  };

  const handleSlackTest = async () => {
    const response = await integrationAPI.testSlack();
    return response.data;
  };

  const handleWebhookTest = async () => {
    const response = await integrationAPI.testWebhook();
    return response.data;
  };

  const handleGmailConnect = () => {
    authAPI.initiateGmailAuth();
  };

  const handleDraftEdit = (draft) => {
    toast.info('Draft editing functionality coming soon!');
  };

  const handleDraftDelete = async (draft) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      toast.info('Draft deletion functionality coming soon!');
    }
  };

  const handleDraftView = (draft) => {
    toast.info('Draft view functionality coming soon!');
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'inbox':
        return 'All Emails';
      case 'interested':
        return 'Important Emails';
      case 'not-interested':
        return 'Spam Emails';
      case 'drafts':
        return 'AI Drafts';
      default:
        return 'Emails';
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'analytics':
        return <Analytics stats={stats} loading={loading} />;
      
      case 'connect-gmail':
      case 'slack-test':
      case 'webhook-test':
        return (
          <IntegrationTesting
            onSlackTest={handleSlackTest}
            onWebhookTest={handleWebhookTest}
            onGmailConnect={handleGmailConnect}
          />
        );
      
      case 'drafts':
        return (
          <DraftList
            drafts={drafts}
            loading={loading}
            onEdit={handleDraftEdit}
            onDelete={handleDraftDelete}
            onView={handleDraftView}
          />
        );
      
      default:
        return (
          <div className="flex-1 flex">
            {/* Email List */}
            <div className="w-1/2 border-r border-gray-200">
              <EmailList
                emails={emails}
                selectedEmail={selectedEmail}
                onEmailSelect={handleEmailSelect}
                onGenerateDraft={handleGenerateDraft}
                loading={loading}
                title={getViewTitle()}
              />
            </div>
            
            {/* Email Detail */}
            <div className="w-1/2">
              <EmailDetail
                email={selectedEmail}
                onBack={() => setSelectedEmail(null)}
                onGenerateDraft={handleGenerateDraft}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={handleViewChange}
        stats={stats}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          isLoading={loading}
          connectionStatus={isConnected}
        />
        
        {/* Content */}
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
