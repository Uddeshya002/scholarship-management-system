import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] } });

const features = [
  { icon: '🎓', title: 'Smart Scholarship Matching', desc: 'Our ML engine analyzes your academic profile, financial background, and category to find scholarships you actually qualify for.' },
  { icon: '🤖', title: 'AI Eligibility Score', desc: 'Get an instant percentage match for every scholarship, so you can focus on the ones with the highest chance of success.' },
  { icon: '⚡', title: 'One-Click Apply & Drafts', desc: 'Apply instantly or save as draft and return later. Your progress is never lost.' },
  { icon: '📊', title: 'Real-Time Tracking', desc: 'Visual step-by-step progress tracker shows exactly where your application stands in the review pipeline.' },
  { icon: '💰', title: 'Auto Disbursement', desc: 'Database triggers automatically generate payments and receipts the moment your application is approved.' },
  { icon: '🔐', title: 'Bank-Grade Security', desc: 'JWT tokens, bcrypt hashing, role-based access control, rate limiting, and full audit trail logging.' },
];

const stats = [
  { value: '10K+', label: 'Scholarships Listed' },
  { value: '95%', label: 'AI Match Accuracy' },
  { value: '₹50Cr+', label: 'Funds Disbursed' },
  { value: '50K+', label: 'Students Helped' },
];

const steps = [
  { num: '01', title: 'Create Profile', desc: 'Register and enter your academic details, income, and category for AI matching.', icon: '👤' },
  { num: '02', title: 'Browse & Match', desc: 'Our AI ranks every scholarship by your eligibility score in real-time.', icon: '🔍' },
  { num: '03', title: 'Apply Instantly', desc: 'One-click apply with auto-filled data. Save drafts anytime.', icon: '📝' },
  { num: '04', title: 'Receive Funds', desc: 'Once approved, payments are auto-triggered directly to your account.', icon: '💸' },
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-5 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-xl" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
            🎓
          </div>
          <div>
            <span className="text-xl font-bold text-white">EduFund</span>
            <span className="text-xl font-bold text-gradient-gold ml-1">AI</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-400 hover:text-white transition-colors font-medium px-4 py-2">Sign In</Link>
          <Link to="/register" className="btn-gold text-sm">Get Started Free →</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-16 pb-28 text-center relative">
        {/* Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full animate-pulse-soft" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)' }} />
          <div className="absolute top-40 left-20 w-[200px] h-[200px] rounded-full animate-float-slow" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
          <div className="absolute top-20 right-20 w-[150px] h-[150px] rounded-full animate-float" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
        </div>

        <motion.div {...fadeUp(0)} className="relative">
          <span className="inline-flex items-center gap-2 badge-gold text-sm mb-8 px-5 py-2">
            🏆 AI-Powered Scholarship Management System
          </span>
        </motion.div>
        
        <motion.h1 {...fadeUp(0.1)} className="relative text-5xl md:text-7xl font-black leading-[1.1] mb-7 tracking-tight">
          Your Gateway to<br />
          <span className="text-gradient-hero">Scholarships & Aid</span>
        </motion.h1>
        
        <motion.p {...fadeUp(0.2)} className="relative text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered eligibility prediction, automated disbursement workflows, and transparent application tracking — designed for students, powered by data.
        </motion.p>
        
        <motion.div {...fadeUp(0.3)} className="relative flex flex-wrap gap-4 justify-center">
          <Link to="/register" className="btn-gold text-base px-10 py-4 flex items-center gap-2">
            🎓 Start Your Journey <span className="text-sm opacity-70">— It's Free</span>
          </Link>
          <Link to="/login" className="btn-ghost text-base px-10 py-4">
            Sign In to Dashboard
          </Link>
        </motion.div>

        {/* Stats Bar */}
        <motion.div {...fadeUp(0.5)} className="relative mt-20 glass-card rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.1 }} className="text-center">
                <p className="text-3xl md:text-4xl font-black text-gradient-gold">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-8 pb-28">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <span className="badge-info text-sm mb-4 inline-block">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3">Four Steps to <span className="text-gradient-gold">Financial Aid</span></h2>
        </motion.div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div key={i} {...fadeUp(i * 0.12)} className="relative">
              <div className="card text-center group hover:-translate-y-2 transition-all duration-500">
                <div className="text-4xl mb-4">{step.icon}</div>
                <span className="text-xs font-black text-brand-500/50 tracking-widest">{step.num}</span>
                <h3 className="text-lg font-bold mt-2 mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 text-slate-700 z-10">→</div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 pb-28">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <span className="badge-gold text-sm mb-4 inline-block">Platform Features</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3">Built for <span className="text-gradient-blue">Modern Education</span></h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">A comprehensive, end-to-end platform for students, institutions, and administrators to seamlessly manage financial aid.</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)} whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="card cursor-default group scholarship-glow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 group-hover:text-brand-400 transition-colors">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DBMS Highlight */}
      <section className="max-w-7xl mx-auto px-8 pb-28">
        <motion.div {...fadeUp()} className="glass-card rounded-3xl p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 60%)' }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 60%)' }} />
          
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="badge-gold text-sm mb-4 inline-block">Platform Capabilities</span>
              <h3 className="text-2xl md:text-3xl font-bold mt-3 mb-5">Enterprise-Grade<br /><span className="text-gradient-gold">Management System</span></h3>
              <p className="text-slate-400 leading-relaxed mb-6">Our platform handles everything from smart applicant matching to automated disbursement, ensuring a flawless experience for all users.</p>
              <Link to="/register" className="btn-primary inline-flex items-center gap-2">Explore the Platform →</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                '✅ AI-Powered Matching', '✅ Automated Disbursements', '✅ Status Tracking',
                '✅ Secure Document Vault', '✅ Real-time Analytics', '✅ Role-Based Access',
                '✅ Audit Trail Logging', '✅ Instant Notifications'
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                  className="text-sm text-slate-300 py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 pb-20">
        <motion.div {...fadeUp()} className="text-center py-16 rounded-3xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(245,158,11,0.05) 100%)', border: '1px solid rgba(59,130,246,0.1)' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your <span className="text-gradient-gold">Perfect Scholarship?</span></h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">Join thousands of students already using AI-powered matching to secure financial aid.</p>
          <Link to="/register" className="btn-gold text-lg px-10 py-4 inline-flex items-center gap-2">🎓 Create Free Account</Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg">🎓</span>
          <span className="font-bold text-white">EduFund</span>
          <span className="font-bold text-gradient-gold">AI</span>
        </div>
        <p className="text-slate-600">© 2026 EduFund AI — AI-Powered Scholarship & Financial Aid Management System</p>
        <p className="text-slate-700 mt-1">Built with React • Node.js • MySQL • Machine Learning</p>
      </footer>
    </div>
  );
}
