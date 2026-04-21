import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, apiFetch } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const links = user?.role === 'Admin' || user?.role === 'Verifier'
    ? [{ to: '/dashboard', label: '📊 Dashboard' }, { to: '/admin', label: '🛡️ Admin Panel' }, { to: '/scholarships', label: '🎓 Scholarships' }]
    : [{ to: '/dashboard', label: '📊 Dashboard' }, { to: '/scholarships', label: '🎓 Scholarships' }, { to: '/applications', label: '📋 My Applications' }];

  useEffect(() => {
    apiFetch('/notifications').then(n => Array.isArray(n) && setNotifications(n)).catch(() => {});
    const interval = setInterval(() => {
      apiFetch('/notifications').then(n => Array.isArray(n) && setNotifications(n)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unread = notifications.filter(n => !n.read).length;
  const handleLogout = () => { logout(); navigate('/'); };
  const typeIcon = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const typeColor = { success: 'border-l-emerald-500', error: 'border-l-red-500', warning: 'border-l-amber-500', info: 'border-l-brand-500' };

  return (
    <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100 }}
      className="sticky top-0 z-50 glass" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-lg transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>
            🎓
          </div>
          <div>
            <span className="text-lg font-bold text-white">EduFund</span>
            <span className="text-lg font-bold text-gradient-gold ml-0.5">AI</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                location.pathname === l.to
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              style={location.pathname === l.to ? { background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' } : { border: '1px solid transparent' }}
            >{l.label}</Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all text-slate-400 hover:text-white hover:bg-white/5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unread > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 2px 8px rgba(245,158,11,0.5)' }}>
                  {unread}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 glass-strong rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="font-semibold text-sm">🔔 Notifications</p>
                    {unread > 0 && <span className="text-xs text-gradient-gold font-bold">{unread} new</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-sm text-slate-500">No notifications</p>
                    ) : notifications.slice(0, 8).map(n => (
                      <div key={n.id} className={`px-4 py-3 border-l-2 ${typeColor[n.type]} hover:bg-white/[0.02] transition-colors ${!n.read ? 'bg-brand-500/5' : ''}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div className="flex items-start gap-2">
                          <span className="text-sm mt-0.5">{typeIcon[n.type]}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-slate-600 mt-1">{new Date(n.time).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <Link to="/profile" className="hidden md:flex items-center gap-3 rounded-lg px-3 py-1.5 transition-all hover:bg-white/5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>{user?.name?.[0]}</div>
            <div className="text-sm">
              <p className="font-medium text-white leading-tight">{user?.name}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{user?.role}</p>
            </div>
          </Link>

          <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/8">Logout</button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm md:hidden" 
            />
            
            {/* Side Drawer */}
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 glass-strong shadow-2xl p-6 flex flex-col md:hidden"
              style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between mb-10">
                <span className="text-lg font-bold text-gradient-gold">Navigation</span>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {links.map(l => (
                  <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${location.pathname === l.to ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{l.label}</Link>
                ))}
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5">👤 My Profile</Link>
              </div>
              
              <div className="mt-auto pt-6 border-t border-white/5">
                 <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 w-full transition-all text-left">🚪 Logout</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
