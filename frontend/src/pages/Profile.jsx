import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, apiFetch } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    apiFetch('/profile').then(data => {
      // Flatten the data so it's easier to use
      const flattened = {
        ...data,
        ...data.profile
      };
      setProfile(flattened);
      setFormData(flattened);
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/profile', { method: 'PUT', body: JSON.stringify(formData) });
      const flattened = {
        ...res,
        ...res.profile
      };
      setProfile(flattened);
      setEditing(false);
      setToast('✅ Profile updated successfully!');
    } catch { setToast('❌ Update failed'); }
    setTimeout(() => setToast(''), 4000);
  };

  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetStatus('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setResetStatus('✅ Password successfully updated!');
      setTimeout(() => setShowResetModal(false), 2000);
    } catch (err) {
      setResetStatus(`❌ ${err.message}`);
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white">Student <span className="text-gradient-gold">Profile</span></h1>
          <p className="text-slate-400 mt-2 font-medium">Manage your academic and financial credentials for AI matching.</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-ghost border-brand-500/20 text-brand-400 px-8">Edit Credentials</button>
        )}
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold border-4 border-white/5" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              {user?.name?.[0]}
            </div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{user?.role}</p>
            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-tighter">KYC Status</span>
                <span className={`font-bold ${profile?.kyc_verified ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                  {profile?.kyc_verified ? 'VERIFIED ✅' : 'PENDING ⏳'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-tighter">Verification Type</span>
                <span className="text-white">AI-Automatic</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card bg-brand-500/5 border-brand-500/10">
            <h3 className="text-sm font-bold text-brand-400 mb-3 flex items-center gap-2">🛡️ Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Your personal data is encrypted with bank-grade security protocols.</p>
            <button onClick={() => setShowResetModal(true)} className="text-[10px] font-black text-brand-500 uppercase hover:underline">Reset Password →</button>
          </motion.div>
        </div>

        {/* Form Area */}
        <div className="md:col-span-2">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card">
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                    <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                    <input value={formData.email || ''} disabled className="input-field opacity-50 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Current CGPA</label>
                    <input type="number" step="0.01" value={formData.cgpa || ''} onChange={e => setFormData({ ...formData, cgpa: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Family Income (₹)</label>
                    <input type="number" value={formData.income || ''} onChange={e => setFormData({ ...formData, income: e.target.value })} className="input-field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Social Category</label>
                    <select value={formData.category || 'General'} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input-field bg-navy-900 border-white/10">
                      {['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button type="submit" className="btn-primary py-3 px-8 text-sm">Save Changes</button>
                  <button type="button" onClick={() => { setEditing(false); setFormData(profile); }} className="btn-ghost py-3 px-8 text-sm">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Full Name</p>
                      <p className="text-sm font-bold text-white">{profile.name}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Email</p>
                      <p className="text-sm font-bold text-white">{profile.email}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Category</p>
                      <p className="text-sm font-bold text-white">{profile.category || 'General'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Verification Status</p>
                      <p className={`text-sm font-bold ${profile?.kyc_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {profile?.kyc_verified ? 'IDENTITY VERIFIED ✅' : 'ACTION REQUIRED ⚠️'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} 
            className="mt-8 card bg-gold-500/5 border-gold-500/10">
            <div className="flex gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h4 className="font-bold text-gold-400 mb-1">Eligibility Optimization</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Your current profile matches 8 out of 12 active scholarships. Increasing your CGPA to 9.0 would unlock 4 additional high-value merit fellowships.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-navy-950 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-bold text-white mb-2">Update Security</h3>
            <p className="text-slate-400 text-sm mb-6">Enter your new password for your account <b>{user?.email}</b>.</p>
            
            {resetStatus && (
              <div className={`p-3 mb-4 rounded-xl text-sm font-bold ${resetStatus.includes('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {resetStatus}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">New Password</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-navy-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-brand-500 focus:outline-none" />
              </div>
              <button type="submit" disabled={resetLoading} className="w-full btn-primary py-3 mt-4">
                {resetLoading ? 'Updating...' : 'Save New Password'}
              </button>
            </form>
          </motion.div>
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
