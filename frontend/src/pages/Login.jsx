import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'Admin' || user.role === 'Verifier' ? '/admin' : '/dashboard');
    } catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetStatus('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setResetStatus('✅ Password successfully reset!');
      setTimeout(() => setShowResetModal(false), 2000);
    } catch (err) {
      setResetStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030712]">
      {/* Premium Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute top-0 w-[800px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] mix-blend-screen" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwaDIwdjIwSDIwaC0yMHYtMjB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-20" />
      </div>

      <div className="absolute top-8 left-8 z-20">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
          <span className="text-sm font-bold">Back to Home</span>
        </Link>
      </div>
      
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* Left Side: Marketing / Branding (Hidden on mobile) */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:flex flex-col justify-center pr-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider mb-8 w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            System Online
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Your Future,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-500">
              Funded by AI.
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            Access thousands of scholarships matched precisely to your academic profile and socioeconomic background using our advanced recommendation engine.
          </p>
          
          <div className="flex items-center gap-4 text-sm text-slate-500 font-bold">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#030712] bg-slate-800 flex items-center justify-center text-[10px] shadow-sm">👤</div>
              ))}
            </div>
            <p>Join 10,000+ students funded</p>
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full max-w-md mx-auto">
          <div className="glass-strong rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Glowing top edge */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl mx-auto mb-6 relative group" style={{ background: 'linear-gradient(135deg, #2563eb, #8b5cf6)' }}>
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                🎓
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-sm text-slate-400">Enter your credentials to access your portal</p>
            </div>

            {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-4 mb-6 flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>{error}</span>
            </motion.div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                  </div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full bg-navy-900/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                  <button type="button" onClick={() => setShowResetModal(true)} className="text-xs font-bold text-brand-400 hover:text-brand-300">Forgot?</button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-navy-900/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, #2563eb, #8b5cf6)' }}>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <><svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Authenticating...</>
                  ) : (
                    <>Sign In <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-center text-sm text-slate-500">
                New to EduFund? <Link to="/register" className="text-brand-400 font-bold hover:text-brand-300 transition-colors">Create an account</Link>
              </p>
            </div>
          </div>

        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-navy-950 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-bold text-white mb-2">Reset Password</h3>
            <p className="text-slate-400 text-sm mb-6">Enter your registered email and your new password to instantly reset it.</p>
            
            {resetStatus && (
              <div className={`p-3 mb-4 rounded-xl text-sm font-bold ${resetStatus.includes('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {resetStatus}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Email</label>
                <input type="email" required value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full bg-navy-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">New Password</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-navy-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-brand-500 focus:outline-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 mt-4">
                {loading ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
