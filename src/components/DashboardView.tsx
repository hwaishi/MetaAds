import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Target,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardViewProps {
  selectedAccount: string;
  onNavigateTab: (tab: string) => void;
}

const mockChartData = [
  { day: 'Nov 14', spend: 3200, roas: 3.2, conversions: 110 },
  { day: 'Nov 15', spend: 3400, roas: 3.5, conversions: 125 },
  { day: 'Nov 16', spend: 3900, roas: 3.8, conversions: 148 },
  { day: 'Nov 17', spend: 3700, roas: 3.4, conversions: 132 },
  { day: 'Nov 18', spend: 4100, roas: 4.1, conversions: 165 },
  { day: 'Nov 19', spend: 4500, roas: 3.9, conversions: 178 },
  { day: 'Nov 20', spend: 4850, roas: 4.3, conversions: 194 },
];

export const DashboardView: React.FC<DashboardViewProps> = ({ selectedAccount, onNavigateTab }) => {
  const [insights, setInsights] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch(`/api/insights?account_id=${selectedAccount}&date_preset=last_7d`);
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchDiagnostics = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: selectedAccount })
      });
      const data = await res.json();
      setDiagnostics(data.diagnostics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDiagnostics();
  }, [selectedAccount]);

  const handleStageAiEdit = async (diag: any) => {
    try {
      const res = await fetch('/api/creatives/stage-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_account_id: selectedAccount,
          target_parent_id: diag.payload.adset_id || 'as_201',
          name: `AI Fix: ${diag.title}`,
          format: 'image',
          primary_text: 'Optimized fresh creative variant generated automatically to resolve performance anomaly.',
          headline: 'Discover Our Best-Sellers Today',
          cta_type: 'SHOP_NOW',
          ai_rationale: diag.description,
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Successfully staged proposed edit for "${diag.title}" into Approval Queue!`);
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingData || !insights) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-slate-300 font-medium">Syncing with Meta Marketing API v27.0...</span>
        </div>
      </div>
    );
  }

  const m = insights.metrics;

  return (
    <div className="space-y-6 pb-12">
      {/* Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live API Connected (v27.0)
            </span>
            <span className="text-xs text-slate-400">Last Synced: Just now</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Campaign Performance & AI Command Center</h1>
          <p className="text-sm text-slate-400">Real-time metrics, automated fatigue detection, and safe human-in-the-loop staging.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={() => { fetchData(); fetchDiagnostics(); }}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Insights</span>
          </button>
          <button
            onClick={() => onNavigateTab('creative-studio')}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-blue-600/30 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create AI Ad</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => onNavigateTab('approval-queue')}
            className="text-xs underline font-semibold text-emerald-300 hover:text-white"
          >
            View Approval Queue →
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Spend (7d)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">${m.spend.toLocaleString()}</div>
          <div className="flex items-center space-x-1 text-xs text-emerald-400 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4% vs prev week</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Blended ROAS</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{m.roas}x</div>
          <div className="flex items-center space-x-1 text-xs text-emerald-400 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Target &gt; 3.0x</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Blended CPA</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">${m.cpa}</div>
          <div className="flex items-center space-x-1 text-xs text-emerald-400 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>-8.2% cost per acquisition</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Purchases / Leads</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{m.purchases.toLocaleString()}</div>
          <div className="flex items-center space-x-1 text-xs text-slate-400 mt-2">
            <span>CTR: {m.ctr}%</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Diagnostics</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{diagnostics.length} Active</div>
          <div className="flex items-center space-x-1 text-xs text-indigo-400 mt-2">
            <span>Ready for Staging</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Chart & AI Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend & ROAS Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Spend & ROAS Velocity</h2>
              <p className="text-xs text-slate-400">Daily performance trends over the past 7 days</p>
            </div>
            <div className="flex items-center space-x-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Last 7 Days</span>
            </div>
          </div>
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" textAnchor="end" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any, name: any) => [name === 'spend' ? `$${value}` : `${value}x`, name === 'spend' ? 'Spend' : 'ROAS']}
                />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Diagnostic Engine Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Diagnostic Engine</h2>
                <p className="text-xs text-slate-400">Gemini-powered anomaly detection</p>
              </div>
            </div>
            {loadingAi && <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />}
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
            {diagnostics.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No active anomalies detected. Account operating smoothly.</p>
            ) : (
              diagnostics.map((diag) => {
                const isHigh = diag.severity === 'high';
                return (
                  <div
                    key={diag.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isHigh
                        ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60'
                        : 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className={`w-4 h-4 ${isHigh ? 'text-rose-400' : 'text-amber-400'}`} />
                        <span className="text-xs font-bold text-white">{diag.title}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        isHigh ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {diag.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{diag.description}</p>
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-indigo-300 font-medium">{diag.suggested_action}</span>
                      <button
                        onClick={() => handleStageAiEdit(diag)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Stage Edit</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Active Campaigns Performance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Top Active Campaigns</h2>
            <p className="text-xs text-slate-400">Live performance metrics pulled from Meta Graph API</p>
          </div>
          <button
            onClick={() => onNavigateTab('campaigns')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            Manage All Campaigns →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">Campaign Name</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Daily Budget</th>
                <th className="pb-3 px-3">Spend</th>
                <th className="pb-3 px-3">CTR</th>
                <th className="pb-3 px-3">CPA</th>
                <th className="pb-3 px-3">ROAS</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {insights.campaigns.map((cmp: any) => (
                <tr key={cmp.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-3 font-medium text-white max-w-xs truncate">{cmp.name}</td>
                  <td className="py-4 px-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {cmp.status}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-slate-300">${cmp.daily_budget_cents / 100} /day</td>
                  <td className="py-4 px-3 text-slate-300">${cmp.spend.toLocaleString()}</td>
                  <td className="py-4 px-3 text-slate-300">{cmp.ctr}%</td>
                  <td className="py-4 px-3 text-slate-300">${cmp.cpa}</td>
                  <td className="py-4 px-3 font-bold text-emerald-400">{cmp.roas}x</td>
                  <td className="py-4 px-3 text-right">
                    <button
                      onClick={() => onNavigateTab('campaigns')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Edit Budget
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
