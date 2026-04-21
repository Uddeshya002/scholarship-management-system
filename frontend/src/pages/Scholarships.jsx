import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Scholarships() {
  const { apiFetch } = useAuth();
  const [scholarships, setScholarships] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/ai/recommendations')
      .then(d => { setScholarships(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setScholarships([]); setLoading(false); });
  }, []);

  const filtered = scholarships.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || s.category_required === category || s.category_required === 'Any';
    return matchSearch && matchCat;
  });

  const handleApply = async (scholarshipId) => {
    setApplying(true);
    try {
      const res = await apiFetch('/applications', { method: 'POST', body: JSON.stringify({ scholarship_id: scholarshipId }) });
      if (res.error) { setToast(`❌ ${res.error}`); }
      else { setToast('✅ Application submitted! AI score: ' + res.ai_eligibility_score + '%'); }
    } catch { setToast('❌ Failed to apply'); }
    finally { setApplying(false); setSelected(null); setTimeout(() => setToast(''), 4000); }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-black text-white mb-3">Explore <span className="text-gradient-hero">Scholarships</span></h1>
        <p className="text-slate-400 max-w-2xl font-medium">Find and apply for opportunities tailored to your profile. Our AI engine ranks each opportunity based on your match probability.</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
        className="flex flex-wrap gap-4 mb-12 p-2 glass rounded-2xl">
        <div className="flex-1 min-w-[280px] relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search scholarships by name or criteria..." className="input-field pl-11" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input-field max-w-[220px]">
          <option value="All">All Categories</option>
          <option value="Any">Open to All</option>
          <option value="SC/ST">SC/ST</option>
          <option value="OBC">OBC</option>
          <option value="EWS">EWS</option>
        </select>
      </motion.div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -8 }}
            className="card group cursor-pointer relative flex flex-col h-full scholarship-glow overflow-hidden" 
            onClick={() => setSelected(s)}>
            
            <div className="absolute top-0 right-0 p-4">
              <div className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${s.eligibility_score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'}`}>
                {s.eligibility_score}% MATCH
              </div>
            </div>

            <div className="mb-6">
              <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform origin-left">📜</span>
              <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors leading-snug">{s.title}</h3>
            </div>
            
            <p className="text-slate-400 text-sm mb-8 line-clamp-3 flex-grow leading-relaxed">{s.description}</p>
            
            <div className="space-y-4">
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${s.eligibility_score}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                  className={`h-full ${s.eligibility_score >= 80 ? 'bg-emerald-500' : 'bg-brand-500'}`} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Funding</p>
                  <p className="text-lg font-black text-white">₹{s.amount?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Deadline</p>
                  <p className="text-sm font-bold text-slate-300">{new Date(s.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Min GPA: {s.min_cgpa}</span>
              <span className="group-hover:text-brand-400 transition-colors">Details →</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-4"
            onClick={() => !applying && setSelected(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()} className="glass-strong rounded-3xl p-10 max-w-xl w-full relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <button onClick={() => setSelected(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">✕</button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-3xl">🎓</div>
                <div>
                  <h2 className="text-2xl font-black text-white">{selected.title}</h2>
                  <div className="flex gap-2 mt-1">
                    <span className="badge-info">AI Score: {selected.eligibility_score}%</span>
                    <span className="badge-gold">Category: {selected.category_required}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</h4>
                  <p className="text-slate-300 leading-relaxed text-sm">{selected.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Grant Amount</p>
                    <p className="text-xl font-black text-white">₹{selected.amount?.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Min Eligibility</p>
                    <p className="text-sm font-bold text-white">{selected.min_cgpa} CGPA / ₹{selected.max_income.toLocaleString()} Income</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => handleApply(selected.id)} disabled={applying}
                  className="btn-primary flex-1 py-4 text-base font-bold flex items-center justify-center gap-2">
                  {applying ? 'Processing...' : '🚀 Submit Application'}
                </button>
                <button onClick={async () => { setApplying(true); try { await apiFetch('/applications/draft', { method: 'POST', body: JSON.stringify({ scholarship_id: selected.id }) }); setToast('📝 Saved as draft!'); } catch { setToast('❌ Failed'); } finally { setApplying(false); setSelected(null); setTimeout(() => setToast(''), 4000); } }}
                  disabled={applying} className="btn-ghost px-8 py-4">
                  Save Draft
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] glass-strong rounded-2xl px-8 py-4 text-sm font-bold shadow-2xl border-brand-500/20">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
