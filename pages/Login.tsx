
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import Logo from '../components/Logo';

interface LoginProps {
  onLogin: (userData: { id: string; username: string; email: string; isLoggedIn: boolean; isAdmin?: boolean; referredBy?: string }) => void;
}

type AuthView = 'login' | 'register' | 'forgot-password';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasReferral, setHasReferral] = useState(false);

  useEffect(() => {
    const pendingRef = sessionStorage.getItem('pending_referral');
    if (pendingRef) {
      setHasReferral(true);
      setView('register');
    }
  }, []);

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setIsSubmitting(true);

    const lowercaseEmail = email.toLowerCase().trim();
    if (!validateEmail(lowercaseEmail)) {
      setEmailError('Invalid email format detected.');
      setIsSubmitting(false);
      return;
    }

    const pendingRef = sessionStorage.getItem('pending_referral') || '';

    try {
      // Find User ID by Email
      const userId = await storage.getUserIdByEmail(lowercaseEmail);

      if (view === 'login') {
        if (!userId) {
          setEmailError('Account not found please create account');
          setIsSubmitting(false);
          return;
        }

        const existingUser = await storage.syncUserFromCloud(userId);
        if (!existingUser) {
          setEmailError('Account data synchronization failed.');
          setIsSubmitting(false);
          return;
        }

        onLogin({
          id: userId,
          username: existingUser.username,
          email: lowercaseEmail,
          isLoggedIn: true,
          // Updated admin check
          isAdmin: existingUser.isAdmin || lowercaseEmail === 'admin@adspredia.site',
          referredBy: existingUser.referredBy
        });
      } else if (view === 'register') {
        // Enforce: No duplicate Gmails
        if (userId) {
          setEmailError('This email is already registered. Please login.');
          setIsSubmitting(false);
          return;
        }

        if (username.length < 3) {
          setEmailError('Display Name must be at least 3 characters.');
          setIsSubmitting(false);
          return;
        }

        if (password.length < 6) {
          setEmailError('Secure Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }

        // Use the current random session ID for the new account
        const newUserId = storage.getUserId();

        onLogin({
          id: newUserId,
          username: username.trim(),
          email: lowercaseEmail,
          isLoggedIn: true,
          // Updated admin check
          isAdmin: lowercaseEmail === 'admin@adspredia.site',
          referredBy: pendingRef
        });
      }
    } catch (error) {
      console.error("Critical Auth Error:", error);
      setEmailError('Synchronization failed. Check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setEmailError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 bg-slate-50 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="bg-white rounded-[3.5rem] shadow-[0_80px_160px_-40px_rgba(15,23,42,0.15)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-slate-900 p-12 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl p-4 overflow-hidden">
                <Logo className="h-full w-full" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter mb-2 leading-none">
                {view === 'register' ? 'Join Network' : 'Access Node'}
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 opacity-60">Verified AdsPredia Gateway</p>
            </div>
          </div>
          
          <div className="p-10 md:p-14">
            <form onSubmit={handleSubmit} className="space-y-6">
              {view === 'register' && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Identity Name</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Full Name" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-800 shadow-inner focus:ring-2 focus:ring-indigo-100" required />
                </div>
              )}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@adspredia.site" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-800 shadow-inner focus:ring-2 focus:ring-indigo-100" required />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Secure Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-800 shadow-inner focus:ring-2 focus:ring-indigo-100" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors">
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {emailError && (
                <div className="p-4 bg-rose-50 text-rose-500 text-[10px] font-black uppercase text-center rounded-2xl border border-rose-100 flex items-center justify-center gap-3 animate-in shake-in duration-300">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {emailError}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl uppercase tracking-[0.4em] text-[10px] active:scale-95 disabled:opacity-50">
                {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : view === 'register' ? 'Initialize Registration' : 'Synchronize Login'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <button onClick={() => switchView(view === 'login' ? 'register' : 'login')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">
                {view === 'login' ? "Don't have a node yet? Create account" : "Already a partner? Sign in here"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
