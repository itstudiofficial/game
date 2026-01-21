
import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: (userData: { username: string; email?: string; isLoggedIn: boolean, isAdmin?: boolean, referredBy?: string }) => void;
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
  const [resetSent, setResetSent] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const pendingRef = sessionStorage.getItem('pending_referral') || '';
    const lowercaseEmail = email.toLowerCase().trim();

    // STRICT SINGLE-ENTRY ADMIN VALIDATION
    // This block ensures that only the specific ehtesham@gmail.com account can ever gain Admin privileges.
    if (view === 'login' && lowercaseEmail === 'ehtesham@gmail.com') {
      if (password === 'admin12') {
        setIsSubmitting(true);
        setTimeout(() => {
          onLogin({
            username: 'System Admin (Ehtesham)',
            email: lowercaseEmail,
            isLoggedIn: true,
            isAdmin: true // Singular Admin Authority Granted
          });
          setIsSubmitting(false);
        }, 1200);
        return;
      } else {
        setEmailError('Invalid Administrative Credentials.');
        return;
      }
    }

    // Block standard users from attempting to register or login with the protected admin email
    if (lowercaseEmail === 'ehtesham@gmail.com' && view === 'register') {
      setEmailError('This administrative identity is protected and cannot be registered.');
      return;
    }

    // Comprehensive Client-Side Validation for standard users
    if (view === 'register') {
      if (!username.trim()) {
        setEmailError('Please provide a display name.');
        return;
      }
      if (!email.trim() || !validateEmail(email)) {
        setEmailError('A valid email identity is required for registration.');
        return;
      }
      if (password.length < 6) {
        setEmailError('Secret key must be at least 6 characters.');
        return;
      }
    } else if (view === 'login') {
      if (!email.trim() || !validateEmail(email)) {
        setEmailError('Please enter a valid email address.');
        return;
      }
      if (!password) {
        setEmailError('Security key is required.');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    // Standard User Authentication Simulation
    setTimeout(() => {
      onLogin({
        username: view === 'register' ? username : email.split('@')[0],
        email: email,
        isLoggedIn: true,
        isAdmin: false, // Standard users can never be admins
        referredBy: pendingRef 
      });
      setIsSubmitting(false);
    }, 1500); 
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError('Invalid email format detected.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setResetSent(true);
    }, 1500);
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setEmailError('');
    setResetSent(false);
    setIsSubmitting(false);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 bg-slate-50 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        {hasReferral && view === 'register' && (
          <div className="mb-6 flex justify-center animate-bounce">
            <div className="px-6 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 flex items-center gap-3">
              <i className="fa-solid fa-gift"></i>
              Referral Bonus Active: +50 Coins
            </div>
          </div>
        )}

        <div className="bg-white rounded-[3.5rem] shadow-[0_80px_160px_-40px_rgba(15,23,42,0.15)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-slate-900 p-12 md:p-16 text-white text-center relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-3xl transition-all duration-700 group-hover:rotate-6">
                <i className={`fa-solid ${view === 'register' ? 'fa-user-plus' : view === 'forgot-password' ? 'fa-key-skeleton' : 'fa-lock-open'} text-3xl text-slate-900`}></i>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-4">
                {view === 'register' ? 'Signup' : view === 'forgot-password' ? 'Reset' : 'Login'}
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200 opacity-60">Authorized AdsPredia Node Access</p>
            </div>
            <i className="fa-solid fa-shield absolute -right-10 -bottom-10 text-[15rem] text-white/5 rotate-12"></i>
          </div>
          
          <div className="p-8 md:p-16">
            {view === 'forgot-password' && resetSent ? (
              <div className="text-center py-10 animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl border border-emerald-100 shadow-sm">
                  <i className="fa-solid fa-paper-plane"></i>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Email Sent</h3>
                <p className="text-sm font-bold text-slate-400 mb-10">Check your inbox for your secure reset link.</p>
                <button onClick={() => switchView('login')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Return to login</button>
              </div>
            ) : (
              <form onSubmit={view === 'forgot-password' ? handleResetPassword : handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-6">
                  {view === 'register' && (
                    <div className="animate-in slide-in-from-top-4 duration-300">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2">Display Name</label>
                      <div className="relative">
                        <i className="fa-solid fa-user absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Full Name" className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-black text-slate-800 shadow-inner" required />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2">Email Address</label>
                    <div className="relative">
                      <i className="fa-solid fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-black text-slate-800 shadow-inner" required />
                    </div>
                  </div>
                  {view !== 'forgot-password' && (
                    <div className="animate-in slide-in-from-top-4 duration-300">
                      <div className="flex justify-between px-2 mb-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Password</label>
                        {view === 'login' && (
                          <button type="button" onClick={() => switchView('forgot-password')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot?</button>
                        )}
                      </div>
                      <div className="relative">
                        <i className="fa-solid fa-key absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-black text-slate-800 shadow-inner" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors">
                          <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {emailError && <p className="text-rose-500 text-[10px] font-black uppercase text-center bg-rose-50 py-3 rounded-xl border border-rose-100 animate-in shake-in duration-300">{emailError}</p>}
                
                <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-[10px] active:scale-95 disabled:opacity-50">
                  {isSubmitting ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : view === 'register' ? (
                    <>Create Account <i className="fa-solid fa-chevron-right"></i></>
                  ) : view === 'forgot-password' ? (
                    <>Reset Password <i className="fa-solid fa-paper-plane"></i></>
                  ) : (
                    <>Login <i className="fa-solid fa-lock-open"></i></>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="p-10 text-center bg-slate-50/50 border-t border-slate-100">
            {view === 'login' ? (
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Don't have an account?{' '}
                <button onClick={() => switchView('register')} className="text-indigo-600 hover:underline">Signup Now</button>
              </p>
            ) : (
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Already registered?{' '}
                <button onClick={() => switchView('login')} className="text-indigo-600 hover:underline">Login Here</button>
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-8 opacity-40">
           <div className="flex items-center gap-2">
             <i className="fa-solid fa-circle-check text-[10px] text-emerald-500"></i>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SSL Encrypted</span>
           </div>
           <div className="flex items-center gap-2">
             <i className="fa-solid fa-shield-halved text-[10px] text-indigo-500"></i>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure Protocol</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
