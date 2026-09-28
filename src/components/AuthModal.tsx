import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || 'candidate@govtjobai.in');
  };

  const handleDemoLogin = (role: 'student' | 'cyber' | 'women') => {
    login('', role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" /> Secure Candidate Portal
          </div>
          <h3 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Sign in to GovtJob AI' : 'Create Candidate Account'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Access automated eligibility checks, document vault, and application tracking.
          </p>
        </div>

        {/* Quick Demo Personas */}
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Instant Demo Sign-In
          </span>
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('student')}
              className="w-full p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-left transition-all text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                  KS
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Krishnaveni Sadhu</span>
                  <span className="text-[10px] text-slate-500">B.Tech Final Year (CSE) • Andhra Pradesh</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleDemoLogin('cyber')}
              className="w-full p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-left transition-all text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
                  RS
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Rahul Sharma</span>
                  <span className="text-[10px] text-slate-500">Recent Graduate • Cybersecurity Aspirant</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleDemoLogin('women')}
              className="w-full p-2.5 rounded-xl bg-white hover:bg-pink-50 border border-slate-200 text-left transition-all text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-[11px]">
                  AV
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Ananya Varma</span>
                  <span className="text-[10px] text-slate-500">Graduate • Women Exclusive Opportunities</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Krishnaveni Sadhu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs text-blue-600 hover:underline"
            >
              {mode === 'login'
                ? "Don't have an account? Sign Up"
                : 'Already registered? Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
