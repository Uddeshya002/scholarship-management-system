import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user, apiFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/applications'),
      apiFetch('/ai/recommendations')
    ]).then(([apps, recs]) => {
      const approved = apps.filter(a => a.status === 'Approved');
      const pending = apps.filter(a => a.status === 'Pending' || a.status === 'under_review');
      const avgScore = apps.length ? (apps.reduce((s, a) => s + (a.ai_eligibility_score || 0), 0) / apps.length).toFixed(1) : 0;
      
      setStats({
        total: apps.length,
        approved: approved.length,
        pending: pending.length,
        avgScore,
        recentApps: apps.slice(0, 3)
      });
      setRecommendations(Array.isArray(recs) ? recs.slice(0, 3) : []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-black text-white">Welcome back, <span className="text-gradient-gold">{user?.name}</span> 👋</h1>
        <p className="text-slate-400 mt-1 font-medium">Here's your scholarship journey overview.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Applications', value: stats.total, icon: '📄', color: 'from-brand-500 to-blue-600' },
          { label: 'Approved', value: stats.approved, icon: '✅', color: 'from-emerald-500 to-teal-600' },
          { label: 'Pending Review', value: stats.pending, icon: '⏳', color: 'from-amber-500 to-orange-600' },
          { label: 'Avg AI Match Score', value: stats.avgScore + '%', icon: '🤖', color: 'from-brand-400 to-cyan-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            className="card relative overflow-hidden group scholarship-glow">
            <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${s.color} opacity-10 rounded-full group-hover:scale-110 transition-transform`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-500 rounded-full" />
                Latest Applications
              </h2>
              <Link to="/applications" className="text-sm text-brand-400 hover:text-white transition-colors">View All →</Link>
            </div>
            
            <div className="space-y-4">
              {stats.total === 0 ? (
                <p className="text-center py-8 text-slate-500 text-sm">No applications yet. Start exploring scholarships!</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentApps.map(a => (
                    <div key={a.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{a.scholarship_title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Score: {a.ai_eligibility_score}%</p>
                      </div>
                      <span className={`badge-${a.status === 'Approved' ? 'success' : a.status === 'Rejected' ? 'danger' : 'warning'}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="card">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold-500 rounded-full" />
              Academic Performance Trend
            </h2>
            <div className="h-64 relative">
              {stats.avgScore > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Sem 1', gpa: 8.2 }, 
                    { name: 'Sem 2', gpa: 8.5 }, 
                    { name: 'Current', gpa: parseFloat(user?.profile?.cgpa || 9.0) }
                  ]}>
                    <defs>
                      <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 10]} hide />
                    <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid #1e293b', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="gpa" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGpa)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="text-4xl mb-4">📈</span>
                  <p className="text-sm font-bold text-white">Trend Data Pending</p>
                  <p className="text-xs text-slate-500 mt-2">Complete your profile and apply to your first scholarship to generate match performance trends.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="card border-brand-500/20 bg-brand-500/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-xl">🤖</div>
              <div>
                <h2 className="text-base font-bold">AI Recommendations</h2>
                <p className="text-[11px] text-slate-500 font-medium">Ranked for your profile</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {recommendations.map((r, i) => (
                <div key={r.id} className="group relative p-4 rounded-xl bg-navy-900/50 border border-white/5 hover:border-brand-500/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold truncate pr-8">{r.title}</h3>
                    <span className="text-[10px] font-black text-brand-400">{r.eligibility_score}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${r.eligibility_score}%` }} transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                      className="h-full bg-brand-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">₹{r.amount.toLocaleString()} • Ends {new Date(r.deadline).toLocaleDateString()}</p>
                </div>
              ))}
              <Link to="/scholarships" className="block text-center text-xs font-bold text-brand-400 hover:text-white py-2 transition-colors">See All Matches →</Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="card bg-gold-500/5 border-gold-500/10">
            <h3 className="text-sm font-bold text-gold-400 mb-3 flex items-center gap-2">
              🏆 Pro Tip
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students with a complete profile have a 40% higher chance of matching with top-tier scholarships. Update your CGPA and income details regularly.
            </p>
            <Link to="/profile" className="inline-block mt-3 text-xs font-bold text-gold-500 hover:underline">Update Profile</Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
