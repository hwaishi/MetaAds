import React, { useEffect, useState } from 'react';
import { CheckSquare, CheckCircle2, XCircle, ShieldCheck, ArrowRight, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface ApprovalQueueViewProps {
  selectedAccount: string;
}

export const ApprovalQueueView: React.FC<ApprovalQueueViewProps> = ({ selectedAccount }) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/approval-queue?account_id=${selectedAccount}`, {
        headers: { 'X-Demo-User': 'alex@brand.com', 'X-Demo-Role': 'ADMIN' }
      });
      const data = await res.json();
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedAccount]);

  const handleReview = async (id: string, decision: 'APPROVE' | 'REJECT') => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/approval-queue/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-User': 'alex@brand.com',
          'X-Demo-Role': 'ADMIN'
        },
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Review request failed');
      } else {
        if (data.idempotent) {
          setActionMsg('Idempotent replay: original decision returned without duplicates.');
        } else {
          setActionMsg(decision === 'APPROVE' ? 'Ad successfully Approved in simulation (status -> ACTIVE)!' : 'Ad draft rejected and archived.');
        }
        fetchQueue();
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server error');
    }
  };

  if (loading) {
    return <div className="text-white p-8 text-center">Loading approval queue...</div>;
  }

  const pendingItems = queue.filter(q => q.status === 'PENDING_APPROVAL');
  const pastItems = queue.filter(q => q.status !== 'PENDING_APPROVAL');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Mandatory Safety Gate
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Human Approval Staging Queue</h1>
          <p className="text-sm text-slate-400">Review staged ad creations for the selected account before granting simulation clearance.</p>
        </div>
      </div>

      {actionMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Pending Items List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span>Pending Review ({pendingItems.length})</span>
        </h2>

        {pendingItems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <CheckSquare className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
            <h3 className="text-base font-bold text-white">All Clear! No pending items in approval queue for this account.</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              State resets on restart. Staged drafts remain securely held in PAUSED mode until human reviewer approval.
            </p>
          </div>
        ) : (
          pendingItems.map((item) => {
            const p = item.proposed_payload;
            return (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                {/* Top Info Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/30">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-white">{p.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          PENDING APPROVAL (PAUSED)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Created by: {item.created_by} • Target AdSet: {item.target_parent_id}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleReview(item.id, 'REJECT')}
                      className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleReview(item.id, 'APPROVE')}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center space-x-1.5"
                    >
                      <span>Approve in Simulation (ACTIVE)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AI Rationale if any */}
                {item.ai_rationale && (
                  <div className="bg-indigo-950/20 border border-indigo-900/50 p-4 rounded-xl flex items-start space-x-3">
                    <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-indigo-300">AI Diagnostic Rationale</div>
                      <p className="text-xs text-slate-300 mt-1">{item.ai_rationale}</p>
                    </div>
                  </div>
                )}

                {/* Grid Preview & Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Copy Details */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Headline</div>
                        <div className="text-sm font-bold text-white mt-1">{p.headline}</div>
                      </div>
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">CTA Button</div>
                        <div className="text-sm font-bold text-blue-400 mt-1">{p.cta_type}</div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Primary Text (Hook & Body)</div>
                      <p className="text-xs text-slate-200">{p.primary_text}</p>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Destination URL</div>
                      <p className="text-xs text-blue-400 font-mono truncate">{p.destination_url}</p>
                    </div>
                  </div>

                  {/* Rendered Preview Card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-3">Simulation Ad Preview</div>
                    <div className="w-full aspect-square rounded-lg overflow-hidden border border-slate-800 relative">
                      <img src={p.preview_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-md p-2 text-center">
                        <div className="text-[11px] font-bold text-white truncate">{p.headline}</div>
                        <div className="text-[9px] text-blue-400">{p.cta_type}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Past Reviewed Items */}
        {pastItems.length > 0 && (
          <div className="space-y-4 pt-6">
            <h2 className="text-lg font-bold text-white">Review History & Audit Trail</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Ad Name</th>
                    <th className="py-3 px-4">Decision</th>
                    <th className="py-3 px-4">Reviewer Identity</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {pastItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-medium text-white">{item.proposed_payload.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'APPROVED_SIMULATION' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs">{item.reviewed_by || 'Admin'}</td>
                      <td className="py-3 px-4 text-right text-slate-400 text-xs">
                        {new Date(item.reviewed_at || item.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
