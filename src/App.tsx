import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CampaignsView } from './components/CampaignsView';
import { CreativeStudioView } from './components/CreativeStudioView';
import { ApprovalQueueView } from './components/ApprovalQueueView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('acc_1');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        setAccounts(data);
        if (data.length > 0) setSelectedAccount(data[0].id);
      })
      .catch(err => console.error(err));
  }, []);

  const fetchApprovalQueueCount = async () => {
    try {
      const res = await fetch('/api/approval-queue');
      const data = await res.json();
      const count = data.filter((q: any) => q.status === 'PENDING_APPROVAL').length;
      setPendingCount(count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApprovalQueueCount();
    const interval = setInterval(fetchApprovalQueueCount, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-600 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        accounts={accounts}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView selectedAccount={selectedAccount} onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'campaigns' && (
          <CampaignsView selectedAccount={selectedAccount} />
        )}
        {activeTab === 'creative-studio' && (
          <CreativeStudioView selectedAccount={selectedAccount} onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'approval-queue' && (
          <ApprovalQueueView selectedAccount={selectedAccount} />
        )}
        {activeTab === 'settings' && (
          <SettingsView accounts={accounts} selectedAccount={selectedAccount} />
        )}
      </main>
    </div>
  );
}
