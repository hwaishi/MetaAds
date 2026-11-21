import React from 'react';
import { LayoutDashboard, Layers, Sparkles, CheckSquare, Settings, ShieldCheck, Flame, Bell } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
  selectedAccount: string;
  setSelectedAccount: (acc: string) => void;
  accounts: Array<{ id: string; account_name: string; meta_account_id: string }>;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  selectedAccount,
  setSelectedAccount,
  accounts,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Meta Ads AI Controller
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                  v27.0 API
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Diagnostics & Safe Staging Queue</p>
            </div>
          </div>

          {/* Account Selector & Safety Guardrail Badge */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">Safety Guardrails Active:</span>
              <span className="text-emerald-400 font-bold">PAUSED Defaults</span>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs text-slate-400 font-medium">Account:</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name} ({acc.meta_account_id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/60">
          {[
            { id: 'dashboard', label: 'Campaign Dashboard', icon: LayoutDashboard },
            { id: 'campaigns', label: 'Campaigns & Ad Sets', icon: Layers },
            { id: 'creative-studio', label: 'AI Creative & Copy Studio', icon: Sparkles },
            {
              id: 'approval-queue',
              label: 'Approval Queue',
              icon: CheckSquare,
              badge: pendingCount,
            },
            { id: 'settings', label: 'Settings & Audit Logs', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
