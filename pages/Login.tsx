
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (userData: { username: string; email?: string; isLoggedIn: boolean, isAdmin?: boolean, referredBy?: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const pendingRef = sessionStorage.getItem('pending_referral') || '';

    // Admin Credentials Check
    if (!isRegistering && email === 'ehtesham@adspredia.site' && password === 'admin123') {
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

    if (isRegistering) {
      if (!username || !email || !password) {
        alert('Required parameters missing for node creation.');
        return;
      }
      if (!validateEmail(email)) {
        setEmailError('Invalid email format detected.');
        return;
      }
    } else {
      if (!email || !password) {
        alert('Authentication credentials required.');
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
        username: isRegistering ? username : email.split('@')[0],
        email: email,
        isLoggedIn: true,
        isAdmin: false,
        referredBy: pendingRef // Capture the referral during the actual login event
      });
      setIsSubmitting(false);
    }, 1500); 
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmailError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 bg-slate-50 overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="bg-white rounded-[4rem] shadow-[0_80px_160px_-40px_rgba(15,23,42,0.12)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          
          <div className="bg-slate-900 p-14 md:p-20 text-white text-center relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-3xl transform transition-all duration-700 group-hover:rotate-6 group-hover:scale-110">
                <i className={`fa-solid ${isRegistering ? 'fa-user-plus' : 'fa-lock-open'} text-4xl text-slate-900`} aria-hidden="true"></i>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-6">
                {isRegistering ? 'Sign Up' : 'Welcome Back'}
              </h1>
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200">
                  {isRegistering ? 'Join the Network' : 'Authorized Access'}
                </p>
              </div>
            </div>
            
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-12 md:p-20 space-y-10">
            <div className="space-y-8">
              {isRegistering && (
                <div className="animate-in fade-in slide-in-from-top-6 duration-500">
                  <label htmlFor="username" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-2">Full Name</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-8 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                      <i className="fa-solid fa-user text-lg" aria-hidden="true"></i>
                    </span>
                    <input 
                      id="username"
                      type="text" 
                      disabled={isSubmitting}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. John Doe" 
                      className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl focus:ring-8 focus:ring-indigo-600/5 outline-none transition-all disabled:opacity-50 font-black text-slate-800 placeholder-slate-300 shadow-inner"
                      required={isRegistering}
                    />
                  </div>
                </div>
              )}

              <div className="animate-in fade-in duration-500">
                <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-2">Email</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-8 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                    <i className="fa-solid fa-envelope text-lg" aria-hidden="true"></i>
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
                    placeholder="name@example.com" 
                    className={`w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl focus:ring-8 ${emailError ? 'focus:ring-red-500 border-red-100' : 'focus:ring-indigo-600/5'} outline-none transition-all disabled:opacity-50 font-black text-slate-800 placeholder-slate-300 shadow-inner`}
                    required
                  />
                </div>
                {emailError && (
                  <p className="text-red-500 text-[10px] mt-4 font-black uppercase tracking-widest flex items-center px-4 animate-bounce">
                    <i className="fa-solid fa-triangle-exclamation mr-3"></i>
                    {emailError}
                  </p>
                )}
              </div>

              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-4 px-2">
                  <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Password</label>
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-8 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                    <i className="fa-solid fa-key text-lg" aria-hidden="true"></i>
                  </span>
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    autoComplete={isRegistering ? "new-password" : "current-password"}
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••" 
                    className="w-full pl-16 pr-20 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl focus:ring-8 focus:ring-indigo-600/5 outline-none transition-all disabled:opacity-50 font-black text-slate-800 placeholder-slate-300 shadow-inner"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-8 flex items-center text-slate-300 hover:text-indigo-600 transition-colors"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full py-8 bg-slate-900 text-white font-black rounded-[2.5rem] hover:bg-indigo-600 transition-all shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)] hover:shadow-indigo-500/40 flex items-center justify-center gap-6 transform active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-xl"></i>
                  <span className="text-[11px] uppercase tracking-[0.4em]">{isRegistering ? 'CREATING ACCOUNT...' : 'AUTHENTICATING...'}</span>
                </>
              ) : (
                <>
                  <span className="text-[11px] uppercase tracking-[0.4em]">{isRegistering ? 'Sign Up' : 'Log In'}</span>
                  <i className="fa-solid fa-arrow-right text-indigo-400 group-hover:translate-x-2 transition-transform"></i>
                </>
              )}
            </button>
          </form>

          <div className="p-12 text-center bg-slate-50/50 border-t border-slate-100">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {isRegistering ? 'Already have an account?' : 'New to AdsPredia?'} 
              <button 
                type="button"
                onClick={() => !isSubmitting && toggleMode()}
                className="text-indigo-600 font-black ml-4 hover:text-indigo-800 transition-colors focus:outline-none border-b-2 border-indigo-100 pb-1"
              >
                {isRegistering ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
