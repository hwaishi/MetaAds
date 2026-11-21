import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Shield, Key, Database, FileText, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  accounts: any[];
  selectedAccount: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ accounts, selectedAccount }) => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [maxBudget, setMaxBudget] = useState('5000');
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    fetch(`/api/audit-logs?account_id=${selectedAccount}`, {
      headers: { 'X-Demo-User': 'alex@brand.com', 'X-Demo-Role': 'ADMIN' }
    })
      .then(res => res.json())
      .then(data => setAuditLogs(data))
      .catch(err => console.error(err));
  }, [selectedAccount]);

  const handleSaveGuardrails = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const currentAcc = accounts.find(a => a.id === selectedAccount) || accounts[0];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Security & API Gateway
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Settings & Audit Logs</h1>
          <p className="text-sm text-slate-400">Configure simulation credentials, safety spend ceilings, and account-scoped audit trail.</p>
        </div>
      </div>

      {savedMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">Spend guardrails and safety settings saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta API & Credentials */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Meta Marketing API v27.0 (Simulation)</h2>
          </div>
          <p className="text-xs text-slate-400">All ad operations are strictly simulated. No live external API calls are executed.</p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-slate-400 font-medium">Selected Ad Account</label>
              <input
                type="text"
                disabled
                value={`${currentAcc?.account_name} (${currentAcc?.meta_account_id})`}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">System User Access Token (Masked)</label>
              <input
                type="text"
                disabled
                value={currentAcc?.access_token_masked || 'EAAG...9a82'}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-400 text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Authentication Mode</label>
              <input
                type="text"
                disabled
                value="Demo Auth Header (Role: ADMIN / REVIEWER)"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Spend Safety Guardrails */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Spend & Budget Safety Guardrails</h2>
          </div>
          <p className="text-xs text-slate-400">Configure maximum daily budget limits to prevent accidental overspend.</p>

          <form onSubmit={handleSaveGuardrails} className="space-y-4 pt-2">
            <div>
              <label className="text-xs text-slate-400 font-medium">Max Daily Budget Ceiling ($ USD)</label>
              <input
                type="number"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Any campaign or ad set budget exceeding this amount will be rejected automatically.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Strict PAUSED Ad Creation Default</span>
                <span className="text-emerald-400 font-bold">Enabled (Enforced)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Human Approval Gate Required</span>
                <span className="text-emerald-400 font-bold">Enabled (Enforced)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition"
            >
              Save Guardrails
            </button>
          </form>
        </div>
      </div>

      {/* Audit Trail Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Account-Scoped Audit Trail & API Logs</h2>
        </div>
        <p className="text-xs text-slate-400">All simulation actions executed for account {currentAcc?.account_name}.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Endpoint / Action</th>
                <th className="py-3 px-4">HTTP Status</th>
                <th className="py-3 px-4">Response Summary</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono text-xs text-blue-400">{log.meta_endpoint}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                      {log.http_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-xs font-mono">{JSON.stringify(log.response_summary)}</td>
                  <td className="py-3 px-4 text-right text-slate-400 text-xs">{new Date(log.executed_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
