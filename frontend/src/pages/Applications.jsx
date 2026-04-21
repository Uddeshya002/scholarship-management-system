import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Applications() {
  const { apiFetch } = useAuth();
  const [apps, setApps] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('applications');
  const [toast, setToast] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = () => {
    Promise.all([apiFetch('/applications'), apiFetch('/payments')])
      .then(([a, p]) => { setApps(a); setPayments(p); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const handleSubmitDraft = async (id) => {
    setActionLoading(id);
    try {
      await apiFetch(`/applications/${id}/submit`, { method: 'PUT' });
      showToast('✅ Application submitted successfully!'); fetchData();
    } catch { showToast('❌ Failed to submit'); }
    finally { setActionLoading(null); }
  };

  const handleReapply = async (id) => {
    setActionLoading(id);
    try {
      await apiFetch(`/applications/${id}/reapply`, { method: 'POST' });
      showToast('✅ Reapplied! AI score recalculated.'); fetchData();
    } catch { showToast('❌ Failed to reapply'); }
    finally { setActionLoading(null); }
  };

  const statusColor = { Approved: 'badge-success', Pending: 'badge-warning', Rejected: 'badge-danger', Draft: 'badge-info', Verified: 'badge-info' };
  const statusStep = { Draft: 0, Pending: 1, Verified: 2, Approved: 3, Rejected: -1 };
  const steps = ['Submission', 'Verification', 'Review', 'Approval'];

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-black text-white">Application <span className="text-gradient-gold">Center</span></h1>
        <p className="text-slate-400 mt-2 font-medium">Track your scholarship pipeline and manage disbursements.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-10 p-1.5 glass rounded-2xl w-fit">
        {['applications', 'payments'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-8 py-3 rounded-xl text-sm font-bold capitalize transition-all ${tab === t ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-500 hover:text-white'}`}>
            {t === 'applications' ? `📋 My Apps (${apps.length})` : `💰 Grants (${payments.length})`}
          </button>
        ))}
      </div>

      {tab === 'applications' && (
        <div className="space-y-8">
          {apps.length === 0 ? (
            <div className="card text-center py-20 bg-white/[0.02]">
              <p className="text-5xl mb-6 grayscale opacity-50">📋</p>
              <p className="text-xl font-bold text-white">No applications yet</p>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">Browse the scholarship catalog and use your AI match score to find the best opportunities.</p>
              <button onClick={() => window.location.href='/scholarships'} className="btn-primary mt-8">Explore Scholarships</button>
            </div>
          ) : apps.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card scholarship-glow group relative">
              
              <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
                <div className="flex gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-2xl">🎓</div>
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-brand-400 transition-colors">{a.scholarship_title}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Application ID: #{a.id} • Filed {new Date(a.created_at).toLocaleDateString()}</p>
                    {a.scholarship_amount && <p className="text-sm font-black text-gradient-gold mt-2">₹{a.scholarship_amount.toLocaleString()}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusColor[a.status]}>{a.status.toUpperCase()}</span>
                  <div className="px-3 py-1 bg-navy-950/50 rounded-lg border border-white/5 text-[10px] font-black text-brand-400">AI MATCH: {a.ai_eligibility_score}%</div>
                </div>
              </div>

              {/* Enhanced Stepper */}
              {a.status !== 'Rejected' && a.status !== 'Draft' && (
                <div className="relative mb-10 px-4">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/5 rounded-full" />
                  <div className="flex items-center justify-between relative z-10">
                    {steps.map((step, si) => {
                      const current = statusStep[a.status] || 1;
                      const active = si < current;
                      const isProcessing = si === current - 1;
                      return (
                        <div key={si} className="flex flex-col items-center">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + si * 0.1 }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-500 ${
                              active ? 'bg-brand-500 border-brand-400 text-white shadow-xl shadow-brand-500/40' : 
                              isProcessing ? 'bg-navy-900 border-brand-500 text-brand-400 animate-pulse' : 
                              'bg-navy-950 border-white/5 text-slate-700'
                            }`}>
                            {active ? '✓' : si + 1}
                          </motion.div>
                          <p className={`text-[10px] font-black uppercase mt-3 tracking-widest ${active || isProcessing ? 'text-brand-400' : 'text-slate-600'}`}>{step}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Context Actions */}
              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <div>
                  {a.status === 'Approved' && <p className="text-xs font-bold text-emerald-400 flex items-center gap-2">✨ Funds have been allocated. Check the Grants tab.</p>}
                  {a.status === 'Pending' && <p className="text-xs font-bold text-slate-500">⏳ Verification in progress. Expected review within 3-5 business days.</p>}
                  {a.status === 'Rejected' && <p className="text-xs font-bold text-red-400">❌ Your profile did not meet the criteria for this specific grant.</p>}
                  {a.status === 'Draft' && <p className="text-xs font-bold text-amber-500">📝 This is a draft. Complete your application to start the review.</p>}
                </div>
                
                <div className="flex gap-3">
                  {a.status === 'Draft' && (
                    <button onClick={() => handleSubmitDraft(a.id)} disabled={actionLoading === a.id}
                      className="btn-primary py-2.5 text-xs">
                      {actionLoading === a.id ? 'Submitting...' : '🚀 Submit Now'}
                    </button>
                  )}
                  {a.status === 'Rejected' && (
                    <button onClick={() => handleReapply(a.id)} disabled={actionLoading === a.id}
                      className="btn-ghost py-2.5 text-xs text-amber-500 border-amber-500/20 hover:bg-amber-500/10">
                      🔄 One-Click Reapply
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'payments' && (
        <div className="space-y-6">
          {payments.length === 0 ? (
            <div className="card text-center py-20 bg-white/[0.02]">
              <p className="text-5xl mb-6 grayscale opacity-50">💰</p>
              <p className="text-xl font-bold text-white">No grants disbursed yet</p>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">Payments are automatically triggered the moment an application is approved by the scholarship board.</p>
            </div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card bg-gradient-to-br from-brand-900/30 to-emerald-900/20 border-white/5 p-8 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Total Financial Aid Received</p>
                    <p className="text-5xl font-black text-gradient-gold">₹{payments.filter(p => p.status === 'Completed').reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center px-8">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Grants</p>
                    <p className="text-2xl font-black text-white">{payments.length}</p>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4">
                {payments.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="card flex flex-wrap items-center justify-between gap-6 py-5 border-white/5 hover:bg-white/[0.02]">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">💸</div>
                      <div>
                        <p className="font-bold text-white">{p.scholarship_title}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Ref: {p.id} • Date: {new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-400">₹{p.amount?.toLocaleString()}</p>
                      <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-tighter">TRANS_SUCCESS</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] glass-strong rounded-2xl px-8 py-4 text-sm font-bold shadow-2xl border-brand-500/20">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
