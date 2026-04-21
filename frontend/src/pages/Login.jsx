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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 60%)' }} />
      </div>

      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
      </div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-xl mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 8px 30px rgba(37,99,235,0.3)' }}>
            🎓
          </div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-slate-400 mt-2">Sign in to your scholarship dashboard</p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3 mb-6">{error}</motion.div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-50">
              {loading ? 'Signing in...' : '🎓 Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
            <p className="text-xs text-gold-400 font-semibold mb-2.5 flex items-center gap-1.5">🔑 Demo Accounts <span className="text-slate-500 font-normal">(password: password123)</span></p>
            <div className="space-y-1.5 text-xs">
              <p className="text-slate-400">👨‍🎓 Student: <span className="text-brand-400 font-medium">rahul@test.com</span></p>
              <p className="text-slate-400">🛡️ Admin: <span className="text-brand-400 font-medium">admin@edufund.com</span></p>
              <p className="text-slate-400">✅ Verifier: <span className="text-brand-400 font-medium">priya@edufund.com</span></p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account? <Link to="/register" className="text-brand-400 hover:underline font-medium">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
