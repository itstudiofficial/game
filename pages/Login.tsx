
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import Logo from '../components/Logo';

interface LoginProps {
  onLogin: (userData: { 
    id: string; 
    username: string; 
    lastName?: string;
    nickName?: string;
    email: string; 
    city?: string;
    country?: string;
    isLoggedIn: boolean; 
    isAdmin?: boolean; 
    referredBy?: string 
  }) => void;
}

type AuthView = 'login' | 'register' | 'forgot-password';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickName, setNickName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
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

  const validateRealName = (name: string): string | null => {
    const trimmed = name.trim();
    const alphabetRegex = /^[A-Za-z\s]+$/;

    if (!alphabetRegex.test(trimmed)) {
      return "Identity Protocol Error: Names must only contain alphabetic characters.";
    }
    if (trimmed.length < 2) {
      return "Name is too short to be considered authentic.";
    }

    const reservedWords = ['admin', 'moderator', 'test', 'guest', 'user', 'owner', 'adspredia', 'staff', 'support', 'manager'];
    if (reservedWords.some(word => trimmed.toLowerCase().includes(word))) {
      return "This identity is reserved for system administrators.";
    }

    return null;
  };

  const toTitleCase = (str: string) => {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);

    const lowercaseEmail = email.toLowerCase().trim();
    if (!validateEmail(lowercaseEmail)) {
      setAuthError('Invalid email format detected.');
      setIsSubmitting(false);
      return;
    }

    const pendingRef = sessionStorage.getItem('pending_referral') || '';

    try {
      const userId = await storage.getUserIdByEmail(lowercaseEmail);

      if (view === 'login') {
        if (!userId) {
          setAuthError('Account node not found. Verify email or sign up.');
          setIsSubmitting(false);
          return;
        }

        const existingUser = await storage.syncUserFromCloud(userId);
        if (!existingUser) {
          setAuthError('Identity synchronization failed.');
          setIsSubmitting(false);
          return;
        }

        if (existingUser.status === 'banned') {
          setAuthError('Access Denied: This account has been suspended.');
          setIsSubmitting(false);
          return;
        }

        localStorage.removeItem('ct_user');

        onLogin({
          id: userId,
          username: existingUser.username,
          lastName: existingUser.lastName,
          nickName: existingUser.nickName,
          email: lowercaseEmail,
          city: existingUser.city,
          country: existingUser.country,
          isLoggedIn: true,
          isAdmin: existingUser.isAdmin || lowercaseEmail === 'ehtesham@adspredia.site',
          referredBy: existingUser.referredBy
        });
      } else if (view === 'register') {
        // Authenticity Checks
        const firstNameError = validateRealName(fullName);
        if (firstNameError) { setAuthError(`Full Name: ${firstNameError}`); setIsSubmitting(false); return; }
        
        const lastNameError = validateRealName(lastName);
        if (lastNameError) { setAuthError(`Last Name: ${lastNameError}`); setIsSubmitting(false); return; }

        if (email.toLowerCase() !== confirmEmail.toLowerCase()) {
          setAuthError('Emails do not match.');
          setIsSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          setAuthError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }

        if (password.length < 8) {
          setAuthError('Security Protocol: Password must be at least 8 characters.');
          setIsSubmitting(false);
          return;
        }

        if (!city.trim() || !country.trim()) {
          setAuthError('City and Country nodes are required.');
          setIsSubmitting(false);
          return;
        }

        if (userId) {
          setAuthError('Email already registered. Try signing in.');
          setIsSubmitting(false);
          return;
        }

        const newUserId = 'USR-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        localStorage.removeItem('ct_user');

        onLogin({
          id: newUserId,
          username: toTitleCase(fullName.trim()),
          lastName: toTitleCase(lastName.trim()),
          nickName: nickName.trim(),
          email: lowercaseEmail,
          city: toTitleCase(city.trim()),
          country: toTitleCase(country.trim()),
          isLoggedIn: true,
          isAdmin: lowercaseEmail === 'ehtesham@adspredia.site',
          referredBy: pendingRef
        });
      } else if (view === 'forgot-password') {
        if (!userId) {
          setAuthError('Identity Protocol: No account associated with this email.');
        } else {
          setAuthSuccess('Recovery signal dispatched. Please check your email for reset instructions.');
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Critical Auth Error:", error);
      setAuthError('Synchronization failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setAuthError('');
    setAuthSuccess('');
    setFullName('');
    setLastName('');
    setNickName('');
    setEmail('');
    setConfirmEmail('');
    setCity('');
    setCountry('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 bg-slate-50 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className={`w-full ${view === 'register' ? 'max-w-4xl' : 'max-w-xl'} relative z-10 transition-all duration-500`}>
        <div className="bg-white rounded-[3.5rem] shadow-[0_80px_160px_-40px_rgba(15,23,42,0.15)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <i className="fa-solid fa-shield-halved text-8xl"></i>
            </div>
            {hasReferral && (
               <div className="absolute top-4 left-0 right-0 z-20">
                  <span className="px-4 py-1.5 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-400">
                     Referral Sequence Verified
                  </span>
               </div>
            )}
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white rounded-[1.75rem] flex items-center justify-center mx-auto mb-6 shadow-2xl p-4 overflow-hidden">
                <Logo className="h-full w-full" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter mb-2 leading-none">
                {view === 'register' ? 'Sign Up Now' : view === 'forgot-password' ? 'Reset Password' : 'Login Now'}
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 opacity-60">
                {view === 'forgot-password' ? 'Identity Recovery Protocol' : 'Authorized AdsPredia Access'}
              </p>
            </div>
          </div>
          
          <div className="p-8 md:p-14">
            <form onSubmit={handleSubmit} className="space-y-6">
              {view === 'register' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Last Name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Doe" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nick Name</label>
                    <input type="text" value={nickName} onChange={e => setNickName(e.target.value)} placeholder="e.g. johndoe_99" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Confirm Email</label>
                    <input type="email" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} placeholder="Repeat email" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">City</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. New York" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Country</label>
                    <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. United States" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 chars" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                  </div>
                </div>
              ) : view === 'forgot-password' ? (
                <div className="space-y-6 animate-in slide-in-from-top-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Registered Email Identity</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium px-2 leading-relaxed">
                    Provide your primary email node. If an account exists, a recovery token will be generated and dispatched to your inbox.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Email Identity</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Credential</label>
                      <button type="button" onClick={() => switchView('forgot-password')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent outline-none font-bold text-slate-800 shadow-inner focus:border-indigo-100 transition-all" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors">
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {authError && (
                <div className="p-4 bg-rose-50 text-rose-500 text-[10px] font-black uppercase text-center rounded-2xl border border-rose-100 flex items-center justify-center gap-3 animate-in shake-in duration-300">
                  <i className="fa-solid fa-circle-exclamation text-sm"></i>
                  <span className="flex-1">{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-4 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase text-center rounded-2xl border border-emerald-100 flex items-center justify-center gap-3 animate-in zoom-in duration-300">
                  <i className="fa-solid fa-circle-check text-sm"></i>
                  <span className="flex-1">{authSuccess}</span>
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl uppercase tracking-[0.4em] text-[10px] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4">
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    Verifying Identity...
                  </>
                ) : (
                  <>
                    {view === 'register' ? 'Sign Up Now' : view === 'forgot-password' ? 'Transmit Recovery Signal' : 'Login Now'}
                    <i className={`fa-solid ${view === 'forgot-password' ? 'fa-paper-plane' : 'fa-arrow-right-to-bracket'}`}></i>
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center space-y-4">
              <button onClick={() => switchView(view === 'login' ? 'register' : 'login')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all group">
                {view === 'login' ? (
                  <>No Identity? <span className="text-slate-900 group-hover:text-indigo-600">Create account</span></>
                ) : view === 'forgot-password' ? (
                  <>Ready to Authenticate? <span className="text-slate-900 group-hover:text-indigo-600">Return to Login Hub</span></>
                ) : (
                  <>Existing Partner? <span className="text-slate-900 group-hover:text-indigo-600">Sign in Here</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
