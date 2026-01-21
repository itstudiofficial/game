
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
    }
  }, []);

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError('Invalid email format detected.');
      return;
    }
    setIsSubmitting(true);
    // Simulate API call for password reset
    setTimeout(() => {
      setIsSubmitting(false);
      setResetSent(true);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const pendingRef = sessionStorage.getItem('pending_referral') || '';

    // Admin Credentials Check
    if (view === 'login' && email === 'ehtesham@adspredia.site' && password === 'admin123') {
      setIsSubmitting(true);
      setTimeout(() => {
        onLogin({
          username: 'Admin Ehtesham',
          email: email,
          isLoggedIn: true,
          isAdmin: true
        });
        setIsSubmitting(false);
      }, 1500);
      return;
    }

    if (view === 'register') {
      if (!username || !email || !password) {
        alert('Required parameters missing for account creation.');
        return;
      }
      if (!validateEmail(email)) {
        setEmailError('Invalid email format detected.');
        return;
      }
    } else {
      if (!email || !password) {
        alert('Login credentials required.');
        return;
      }
      if (!validateEmail(email)) {
        setEmailError('Invalid email format.');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    // Simulating Secure API verification
    setTimeout(() => {
      onLogin({
        username: view === 'register' ? username : email.split('@')[0],
        email: email,
        isLoggedIn: true,
        isAdmin: false,
        referredBy: pendingRef 
      });
      setIsSubmitting(false);
    }, 1500); 
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setEmailError('');
    setResetSent(false);
    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 bg-slate-50 overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/4 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        {hasReferral && (
          <div className="mb-6 flex justify-center animate-bounce">
            <div className="px-6 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 flex items-center gap-3">
              <i className="fa-solid fa-gift"></i>
              Referral Link Active: +50 Coins pending
            </div>
          </div>
        )}

        <div className="bg-white rounded-[3.5rem] shadow-[0_80px_160px_-40px_rgba(15,23,42,0.15)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          
          <div className="bg-slate-900 p-12 md:p-16 text-white text-center relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-3xl transform transition-all duration-700 group-hover:rotate-6 group-hover:scale-110">
                <i className={`fa-solid ${
                  view === 'register' ? 'fa-user-plus' : 
                  view === 'forgot-password' ? 'fa-key-skeleton' : 'fa-lock-open'
                } text-3xl md:text-4xl text-slate-900`}></i>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-4">
                {view === 'register' ? 'Create Account' : 
                 view === 'forgot-password' ? 'Reset Password' : 'Welcome Back'}
              </h1>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200">
                  {view === 'register' ? 'Join our earning network' : 
                   view === 'forgot-password' ? 'Security Recovery Protocol' : 'Authorized Access Required'}
                </p>
              </div>
            </div>
            
            {/* Visual Flair */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="p-8 md:p-16">
            {view === 'forgot-password' ? (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                {!resetSent ? (
                  <form onSubmit={handleResetPassword} className="space-y-8">
                    <p className="text-slate-500 text-sm font-medium text-center leading-relaxed">
                      Enter your email address. We will send you a secure link to reset your password.
                    </p>
                    <div className="space-y-3">
                      <label htmlFor="reset-email" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2">Email Address</label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-7 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                          <i className="fa-solid fa-envelope text-base"></i>
                        </span>
                        <input 
                          id="reset-email"
                          type="email" 
                          disabled={isSubmitting}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError('');
                          }}
                          placeholder="your@email.com" 
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl focus:ring-8 focus:ring-indigo-600/5 outline-none transition-all disabled:opacity-50 font-black text-slate-800 placeholder-slate-300 shadow-inner"
                          required
                        />
                      </div>
                      {emailError && <p className="text-red-500 text-[9px] font-black uppercase px-4">{emailError}</p>}
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-4 uppercase tracking-widest text-[10px]"
                    >
                      {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Send Reset Link'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => switchView('login')}
                      className="w-full text-center text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors"
                    >
                      Back to Login
                    </button>
                  </form>
                ) : (
                  <div className="text-center space-y-8 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl border border-emerald-100 shadow-sm">
                      <i className="fa-solid fa-paper-plane"></i>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Email Dispatched</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        A secure recovery link has been sent to <span className="text-indigo-600 font-bold">{email}</span>. 
                        Please check your inbox.
                      </p>
                    </div>
                    <button 
                      onClick={() => switchView('login')}
                      className="w-full py-6 bg-slate-50 text-slate-900 border border-slate-200 font-black rounded-2xl hover:bg-white hover:shadow-lg transition-all text-[10px] uppercase tracking-widest"
                    >
                      Return to Login
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-6">
                  {view === 'register' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                      <label htmlFor="username" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2">Full Name</label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-7 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                          <i className="fa-solid fa-id-card text-base"></i>
                        </span>
                        <input 
                          id="username"
                          type="text" 
                          disabled={isSubmitting}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. John Doe" 
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl focus:ring-8 focus:ring-indigo-600/5 outline-none transition-all disabled:opacity-50 font-black text-slate-800 placeholder-slate-300 shadow-inner"
                          required={view === 'register'}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-2">Email Address</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-7 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                        <i className="fa-solid fa-envelope text-base"></i>
                      </span>
                      <input 
                        id="email"
                        type="email" 
                        autoComplete="email"
                        disabled={isSubmitting}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        placeholder="your@email.com" 
                        className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl focus:ring-8 ${emailError ? 'focus:ring-red-500 border-red-100' : 'focus:ring-indigo-600/5'} outline-none transition-all disabled:opacity-50 font-black text-slate-800 placeholder-slate-300 shadow-inner`}
                        required
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-500 text-[9px] mt-3 font-black uppercase tracking-widest flex items-center px-4">
                        <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                        {emailError}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3 px-2">
                      <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Password</label>
                      {view === 'login' && (
                        <button 
                          type="button" 
                          onClick={() => switchView('forgot-password')}
                          className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-7 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                        <i className="fa-solid fa-key text-base"></i>
                      </span>
                      <input 
                        id="password"
                        type={showPassword ? "text" : "password"} 
                        autoComplete={view === 'register' ? "new-password" : "current-password"}
                        disabled={isSubmitting}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password" 
                        className="w-full pl-14 pr-16 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl focus:ring-8 focus:ring-indigo-600/5 outline-none transition-all disabled:opacity-50 font-black text-slate-800 placeholder-slate-300 shadow-inner"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-300 hover:text-indigo-600 transition-all"
                      >
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`group relative w-full py-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] hover:shadow-indigo-500/40 flex items-center justify-center gap-5 transform active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-lg"></i>
                      <span className="text-[10px] uppercase tracking-[0.4em]">{view === 'register' ? 'Creating Account...' : 'Logging in...'}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] uppercase tracking-[0.4em]">{view === 'register' ? 'Sign Up' : 'Login'}</span>
                      <i className="fa-solid fa-arrow-right text-indigo-400 group-hover:translate-x-1.5 transition-transform"></i>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="p-10 text-center bg-slate-50/50 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {view === 'register' ? 'Already have an account?' : 'Need an account?'} 
              <button 
                type="button"
                onClick={() => !isSubmitting && switchView(view === 'register' ? 'login' : 'register')}
                className="text-indigo-600 font-black ml-3 hover:text-indigo-800 transition-colors focus:outline-none border-b border-indigo-100 pb-0.5"
              >
                {view === 'register' ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
