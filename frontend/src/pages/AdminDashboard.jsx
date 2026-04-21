import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

function Counter({ target, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0; const inc = target / 60;
    const t = setInterval(() => { start += inc; if (start >= target) { setVal(target); clearInterval(t); } else setVal(Math.floor(start)); }, 16);
    return () => clearInterval(t);
  }, [target]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

export default function AdminDashboard() {
  const { apiFetch } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState('');
  const [creating, setCreating] = useState(false);
  const [schForm, setSchForm] = useState({ title: '', description: '', amount: '', max_income: '', min_cgpa: '', category_required: 'Any', deadline: '' });

  const refreshData = () => {
    Promise.all([apiFetch('/admin/analytics'), apiFetch('/applications/all')])
      .then(([an, ap]) => { setAnalytics(an); setApps(ap); })
      .finally(() => setLoading(false));
  };

  useEffect(refreshData, []);

  const handleStatus = async (id, status) => {
    await apiFetch(`/applications/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    refreshData();
    setToast(`✅ Application ${status}`);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCreateScholarship = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = { ...schForm, amount: parseFloat(schForm.amount), max_income: parseFloat(schForm.max_income), min_cgpa: parseFloat(schForm.min_cgpa) };
      const res = await apiFetch('/scholarships', { method: 'POST', body: JSON.stringify(payload) });
      if (res.error) setToast(`❌ ${res.error}`);
      else { setToast('✅ Scholarship created successfully!'); setShowCreate(false); setSchForm({ title: '', description: '', amount: '', max_income: '', min_cgpa: '', category_required: 'Any', deadline: '' }); }
    } catch { setToast('❌ Failed to create'); }
    finally { setCreating(false); setTimeout(() => setToast(''), 4000); }
  };

  const filtered = filter === 'All' ? apps : apps.filter(a => a.status === filter);
  const statusColor = { Approved: 'badge-success', Pending: 'badge-warning', Rejected: 'badge-danger', Draft: 'badge-info', Verified: 'badge-info' };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="flex flex-wrap items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white">System <span className="text-gradient-blue">Overview</span></h1>
          <p className="text-slate-400 mt-1 font-medium">Platform analytics and scholarship management.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary px-8 py-3.5 text-base flex items-center gap-3">
          <span className="text-xl">✨</span> Create Scholarship
        </button>
      </motion.div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Applications', value: analytics.total, icon: '📊', color: 'from-brand-500 to-blue-600' },
            { label: 'Funds Disbursed', value: analytics.totalDisbursed, icon: '💰', color: 'from-emerald-500 to-teal-600', prefix: '₹' },
            { label: 'Avg Match Score', value: parseFloat(analytics.avgScore), icon: '🤖', color: 'from-amber-500 to-orange-600', suffix: '%' },
            { label: 'Active Students', value: analytics.totalStudents || 0, icon: '👥', color: 'from-purple-500 to-indigo-600' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="card relative overflow-hidden scholarship-glow">
              <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${s.color} opacity-5 rounded-full`} />
              <div className="flex justify-between items-start mb-4">
                <span className="text-2xl p-2 rounded-xl bg-white/5 border border-white/5">{s.icon}</span>
              </div>
              <p className="text-3xl font-black text-white"><Counter target={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} /></p>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Panel */}
      <div className="card border-white/5">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8 pb-6 border-b border-white/5">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
            Application Pipeline
          </h2>
          <div className="flex gap-2 p-1.5 bg-navy-950/50 rounded-2xl border border-white/5">
            {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-500 hover:text-white'}`}>
                {f} {f !== 'All' && `(${apps.filter(a => a.status === f).length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="pb-4 pl-4">Applicant</th>
                <th className="pb-4">Scholarship</th>
                <th className="pb-4">AI Match</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map((a, i) => (
                <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center font-bold text-brand-400">{a.student_name?.[0]}</div>
                      <div>
                        <p className="font-bold text-sm text-white">{a.student_name}</p>
                        <p className="text-xs text-slate-500">{a.student_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <p className="text-sm font-bold text-slate-300">{a.scholarship_title}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">ID: #{a.id}</p>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${a.ai_eligibility_score >= 80 ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: `${a.ai_eligibility_score}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${a.ai_eligibility_score >= 80 ? 'text-emerald-400' : 'text-brand-400'}`}>{a.ai_eligibility_score}%</span>
                    </div>
                  </td>
                  <td className="py-5"><span className={statusColor[a.status]}>{a.status}</span></td>
                  <td className="py-5 pr-4 text-right">
                    {a.status === 'Pending' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleStatus(a.id, 'Approved')} className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all">✓</button>
                        <button onClick={() => handleStatus(a.id, 'Rejected')} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">✕</button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">— COMPLETED —</span>
                    )}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-20 text-center text-slate-500 font-medium">No applications found in this pipeline phase.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs View */}
      {analytics?.recentLogs && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} 
          className="card mt-12 bg-navy-950/40 border-white/5">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-slate-500 rounded-full" />
            System Audit Log
          </h2>
          <div className="space-y-3">
            {analytics.recentLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-6 text-xs p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                <span className="text-slate-600 font-bold uppercase tracking-tighter w-40">{new Date(log.timestamp).toLocaleString()}</span>
                <span className="text-slate-400 font-medium flex-1">{log.action} on <span className="text-slate-200">{log.target_table}</span></span>
                <span className="text-slate-600 font-black text-[10px]">LOG_ID: {log.id}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-950/90 backdrop-blur-md z-[70] flex items-center justify-center p-4"
            onClick={() => !creating && setShowCreate(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()} className="glass-strong rounded-3xl p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-2xl">✨</div>
                <div>
                  <h2 className="text-2xl font-black text-white">Create Scholarship</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Define new opportunities for the system.</p>
                </div>
              </div>

              <form onSubmit={handleCreateScholarship} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Scholarship Title</label>
                    <input value={schForm.title} onChange={e => setSchForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. STEM Excellence Grant 2024" className="input-field" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea value={schForm.description} onChange={e => setSchForm(p => ({ ...p, description: e.target.value }))} required rows={3} placeholder="Provide full details and requirements..." className="input-field resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Grant Amount (₹)</label>
                    <input type="number" value={schForm.amount} onChange={e => setSchForm(p => ({ ...p, amount: e.target.value }))} required placeholder="50000" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Max Annual Income (₹)</label>
                    <input type="number" value={schForm.max_income} onChange={e => setSchForm(p => ({ ...p, max_income: e.target.value }))} required placeholder="600000" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Min CGPA Required</label>
                    <input type="number" step="0.1" max="10" value={schForm.min_cgpa} onChange={e => setSchForm(p => ({ ...p, min_cgpa: e.target.value }))} required placeholder="7.5" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Category Restriction</label>
                    <select value={schForm.category_required} onChange={e => setSchForm(p => ({ ...p, category_required: e.target.value }))} className="input-field">
                      <option value="Any">Any Category</option>
                      <option value="SC/ST">SC/ST Only</option>
                      <option value="OBC">OBC Only</option>
                      <option value="EWS">EWS Only</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Application Deadline</label>
                    <input type="date" value={schForm.deadline} onChange={e => setSchForm(p => ({ ...p, deadline: e.target.value }))} required className="input-field" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={creating} className="btn-primary flex-1 py-4 text-base font-bold">
                    {creating ? 'Creating...' : '✨ Publish Opportunity'}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} disabled={creating} className="btn-ghost px-10">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
