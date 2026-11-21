import React, { useEffect, useState } from 'react';
import { Layers, Play, Pause, DollarSign, Target, ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CampaignsViewProps {
  selectedAccount: string;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ selectedAccount }) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({ cmp_101: true });
  const [editingBudget, setEditingBudget] = useState<{ id: string; type: 'campaign' | 'adset'; current: number } | null>(null);
  const [newBudgetVal, setNewBudgetVal] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns?account_id=${selectedAccount}`);
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedAccount]);

  const toggleExpand = (cmpId: string) => {
    setExpandedCampaigns(prev => ({ ...prev, [cmpId]: !prev[cmpId] }));
  };

  const handleToggleStatus = async (id: string, type: 'campaign' | 'adset' | 'ad', currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const body: any = { status: nextStatus };
      if (type === 'campaign') body.campaign_id = id;
      if (type === 'adset') body.adset_id = id;
      if (type === 'ad') body.ad_id = id;

      const res = await fetch('/api/campaigns/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        fetchCampaigns();
        setSuccessMsg(`Successfully updated status to ${nextStatus}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBudget = async () => {
    if (!editingBudget) return;
    const cents = Math.round(parseFloat(newBudgetVal) * 100);
    if (isNaN(cents) || cents <= 0) {
      setErrorMsg('Please enter a valid budget amount.');
      return;
    }

    try {
      const body: any = { daily_budget_cents: cents, account_id: selectedAccount };
      if (editingBudget.type === 'campaign') body.campaign_id = editingBudget.id;
      if (editingBudget.type === 'adset') body.adset_id = editingBudget.id;

      const res = await fetch('/api/campaigns/update-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to update budget');
      } else {
        setSuccessMsg('Budget updated successfully!');
        setEditingBudget(null);
        setNewBudgetVal('');
        fetchCampaigns();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server error');
    }
  };

  if (loading) {
    return <div className="text-white p-8 text-center">Loading campaigns and ad sets...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Hierarchy Tree Manager
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Campaigns, Ad Sets & Ads</h1>
          <p className="text-sm text-slate-400">Inspect and modify budgets, targeting parameters, and live/paused statuses.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline text-rose-300">Dismiss</button>
        </div>
      )}

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.map((cmp) => {
          const isExpanded = !!expandedCampaigns[cmp.id];
          return (
            <div key={cmp.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              {/* Campaign Header */}
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between bg-slate-900/90 border-b border-slate-800/80 gap-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleExpand(cmp.id)}
                    className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-white">{cmp.name}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        cmp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {cmp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Objective: {cmp.objective} • ID: {cmp.meta_campaign_id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Daily Budget</div>
                    <div className="text-sm font-bold text-white flex items-center space-x-1">
                      <span>${cmp.daily_budget_cents / 100}/day</span>
                      <button
                        onClick={() => { setEditingBudget({ id: cmp.id, type: 'campaign', current: cmp.daily_budget_cents / 100 }); setNewBudgetVal(String(cmp.daily_budget_cents / 100)); }}
                        className="text-xs text-blue-400 hover:text-blue-300 underline ml-2"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(cmp.id, 'campaign', cmp.status)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                      cmp.status === 'ACTIVE' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {cmp.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{cmp.status === 'ACTIVE' ? 'Pause' : 'Activate'}</span>
                  </button>
                </div>
              </div>

              {/* Ad Sets & Ads Children */}
              {isExpanded && (
                <div className="p-5 space-y-4 bg-slate-950/40">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ad Sets ({cmp.ad_sets?.length || 0})</h3>
                  {cmp.ad_sets?.map((as: any) => (
                    <div key={as.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 ml-0 md:ml-6 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span className="font-semibold text-white text-sm">{as.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                            {as.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-slate-300">${as.daily_budget_cents / 100}/day</span>
                          <button
                            onClick={() => { setEditingBudget({ id: as.id, type: 'adset', current: as.daily_budget_cents / 100 }); setNewBudgetVal(String(as.daily_budget_cents / 100)); }}
                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                          >
                            Edit Budget
                          </button>
                        </div>
                      </div>

                      {/* Targeting summary */}
                      <div className="bg-slate-950/60 p-3 rounded-lg text-xs text-slate-300 flex items-center space-x-2">
                        <Target className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Targeting: Age {as.targeting.age_min}-{as.targeting.age_max} • Locations: {as.targeting.locations.join(', ')} {as.targeting.interests ? `• Interests: ${as.targeting.interests.join(', ')}` : ''}</span>
                      </div>

                      {/* Associated Ads */}
                      <div className="mt-3 space-y-2">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Associated Ads</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {as.ads?.map((ad: any) => (
                            <div key={ad.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex space-x-3 items-center">
                              <img src={ad.preview_url} alt={ad.name} className="w-14 h-14 rounded-lg object-cover border border-slate-700" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white truncate">{ad.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{ad.headline}</div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                    ad.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                  }`}>
                                    {ad.status}
                                  </span>
                                  <span className="text-[10px] text-slate-300 font-semibold">{ad.roas ? `${ad.roas}x` : `CTR ${ad.ctr}%`}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Update Daily Budget</h3>
            <p className="text-xs text-slate-400">
              Changing daily budget for {editingBudget.type}. Note: Budgets exceeding safety ceiling ($5,000/day) will be blocked.
            </p>
            <div>
              <label className="text-xs text-slate-400 font-medium">New Daily Budget (USD)</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  value={newBudgetVal}
                  onChange={(e) => setNewBudgetVal(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setEditingBudget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBudget}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition"
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
