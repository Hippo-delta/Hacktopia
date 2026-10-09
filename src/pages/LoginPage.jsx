import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { DEMO_CREDENTIALS } from '../config/authConfig';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    // Brief processing delay for responsive feedback
    setTimeout(() => {
      if (
        trimmedEmail.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() &&
        password === DEMO_CREDENTIALS.password
      ) {
        setIsLoading(false);
        onLoginSuccess({
          email: trimmedEmail,
          name: 'Agent R. Sharma',
          role: 'Lead Investigator',
          unit: 'National Mule Interception Desk',
        });
      } else {
        setIsLoading(false);
        setError('Invalid email or password. Please try again.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#080D18] flex flex-col justify-between text-slate-100 font-sans relative overflow-hidden select-none">
      {/* Background Subtle Network Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="netGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#080D18" stopOpacity="0" />
            </radialGradient>
            <pattern id="gridDots" width="48" height="48" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#3B82F6" fillOpacity="0.25" />
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#22D3EE" strokeWidth="0.5" strokeOpacity="0.04" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridDots)" />
          <circle cx="50%" cy="40%" r="600" fill="url(#netGlow)" />
        </svg>
      </div>

      {/* Subtle Ambient Glow Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
            {/* Abstract financial-network symbol */}
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="2.5" />
              <circle cx="5" cy="18" r="2.5" />
              <circle cx="19" cy="18" r="2.5" />
              <path d="M12 7.5v5M9.8 14.2l-3.3 2.3M14.2 14.2l3.3 2.3" />
            </svg>
          </div>
          <div>
            <span className="text-base font-bold tracking-wider text-white">PABLO</span>
            <span className="ml-2 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Secure Node 256-bit</span>
        </div>
      </header>

      {/* Main Form Center Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[420px] bg-[#111827] rounded-2xl border border-slate-800 shadow-2xl p-7 sm:p-9 relative">
          
          {/* Card subtle top highlight */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-t-2xl" />

          {/* Heading and Subtitle */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-3 shadow-inner">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Welcome back</h1>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              Sign in to access your financial intelligence workspace.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="name@agency.gov"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080D18] border border-slate-700/80 rounded-lg text-sm text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#080D18] border border-slate-700/80 rounded-lg text-sm text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 disabled:opacity-60 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition duration-150"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Reminder Hint */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500">
              Demo Access:{' '}
              <span className="font-mono text-slate-400">yit09@gmail.com</span> /{' '}
              <span className="font-mono text-slate-400">123456</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-[#94A3B8]">
        <p className="font-medium tracking-wide">
          PABLO · Financial Intelligence Platform
        </p>
      </footer>
    </div>
  );
}
