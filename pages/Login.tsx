
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (userData: { username: string; email?: string; isLoggedIn: boolean, isAdmin?: boolean }) => void;
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
      }, 1000);
      return;
    }

    if (isRegistering) {
      if (!username || !email || !password) {
        alert('Please fill in all fields to create your account.');
        return;
      }
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address.');
        return;
      }
    } else {
      if (!email || !password) {
        alert('Email and Password are required.');
        return;
      }
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address.');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    // Simulating API verification
    setTimeout(() => {
      onLogin({
        username: isRegistering ? username : email.split('@')[0],
        email: email,
        isLoggedIn: true,
        isAdmin: false
      });
      setIsSubmitting(false);
    }, 1200); 
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmailError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center bg-slate-50 min-h-[85vh]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-indigo-100/40">
          <div className="bg-slate-900 p-12 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30 transform hover:rotate-6 transition-transform">
                <i className={`fa-solid ${isRegistering ? 'fa-user-plus' : 'fa-shield-halved'} text-4xl`} aria-hidden="true"></i>
              </div>
              <h1 className="text-4xl font-black tracking-tight leading-none mb-4">
                {isRegistering ? 'Join Us' : 'Login'}
              </h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-70">
                {isRegistering 
                  ? 'Set your profile credentials' 
                  : 'Enter your email and password'}
              </p>
            </div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400/10 rounded-full blur-[80px]"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-12 space-y-8">
            <div className="space-y-6">
              {isRegistering && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-400">
                  <label htmlFor="username" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Username</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                      <i className="fa-solid fa-circle-user" aria-hidden="true"></i>
                    </span>
                    <input 
                      id="username"
                      type="text" 
                      disabled={isSubmitting}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your unique handle" 
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all disabled:opacity-50 font-bold text-slate-700 placeholder-slate-300 shadow-inner"
                      required={isRegistering}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Email Address</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                    <i className="fa-solid fa-envelope" aria-hidden="true"></i>
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
                    placeholder="user@example.com" 
                    className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl focus:ring-2 ${emailError ? 'focus:ring-red-500 border-red-100' : 'focus:ring-indigo-600'} outline-none transition-all disabled:opacity-50 font-bold text-slate-700 placeholder-slate-300 shadow-inner`}
                    required
                  />
                </div>
                {emailError && (
                  <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-widest flex items-center px-1">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Password</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                    <i className="fa-solid fa-key" aria-hidden="true"></i>
                  </span>
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    autoComplete={isRegistering ? "new-password" : "current-password"}
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full pl-14 pr-16 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all disabled:opacity-50 font-bold text-slate-700 placeholder-slate-300 shadow-inner"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
            </div>

            {!isRegistering && (
              <div className="flex items-center justify-between">
                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg text-indigo-600 mr-3 border-none bg-slate-100 focus:ring-indigo-600 cursor-pointer" 
                  />
                  Remember Me
                </label>
                <a href="#" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Forgot Password?</a>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-7 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-indigo-600 transition-all shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:shadow-indigo-200 flex items-center justify-center gap-4 transform active:scale-[0.97] ${isSubmitting ? 'opacity-70 grayscale' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-lg"></i>
                  <span className="text-xs uppercase tracking-[0.2em]">{isRegistering ? 'Creating Vault...' : 'Authorizing...'}</span>
                </>
              ) : (
                <span className="text-xs uppercase tracking-[0.2em]">{isRegistering ? 'Register Now' : 'Login account'}</span>
              )}
            </button>
          </form>

          <div className="p-10 text-center bg-slate-50 border-t border-slate-100/50">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {isRegistering ? 'Already have an account?' : 'New user?'} 
              <button 
                type="button"
                onClick={() => !isSubmitting && toggleMode()}
                className="text-indigo-600 font-black ml-3 hover:text-indigo-800 transition-colors focus:outline-none"
              >
                {isRegistering ? 'Sign In' : 'Create account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
