
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (userData: { username: string; email?: string; isLoggedIn: boolean }) => void;
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

    if (!username || !password || (isRegistering && !email)) {
      alert('Please fill in all required fields.');
      return;
    }

    if (isRegistering && !validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would be a fetch call to your API
    setTimeout(() => {
      onLogin({
        username,
        email: isRegistering ? email : undefined,
        isLoggedIn: true
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
    <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center bg-slate-50 min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500">
          <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
                <i className={`fa-solid ${isRegistering ? 'fa-user-plus' : 'fa-shield-halved'} text-3xl`} aria-hidden="true"></i>
              </div>
              <h1 className="text-3xl font-black tracking-tight leading-none mb-3">
                {isRegistering ? 'Start Earning' : 'Secure Access'}
              </h1>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest opacity-80">
                {isRegistering 
                  ? 'Join Ads Predia Ecosystem' 
                  : 'Enter Vault Credentials'}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Display Username</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                    <i className="fa-solid fa-at" aria-hidden="true"></i>
                  </span>
                  <input 
                    id="username"
                    type="text" 
                    autoComplete="username"
                    disabled={isSubmitting}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. crypto_king" 
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all disabled:opacity-50 font-bold text-slate-700 placeholder-slate-300 shadow-inner"
                    required
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Email Destination</label>
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
                      placeholder="user@provider.com" 
                      className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 ${emailError ? 'focus:ring-red-500' : 'focus:ring-indigo-600'} outline-none transition-all disabled:opacity-50 font-bold text-slate-700 placeholder-slate-300 shadow-inner`}
                      required={isRegistering}
                    />
                  </div>
                  {emailError && (
                    <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-widest flex items-center px-1">
                      <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                      {emailError}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Account Secret</label>
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
                    className="w-full pl-14 pr-16 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all disabled:opacity-50 font-bold text-slate-700 placeholder-slate-300 shadow-inner"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-300 hover:text-indigo-600 transition-colors"
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
                    className="w-5 h-5 rounded-lg text-indigo-600 mr-3 border-none bg-slate-100 focus:ring-indigo-600" 
                  />
                  Keep Active
                </label>
                <a href="#" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Reset Secret?</a>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 transform active:scale-[0.98] ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-lg"></i>
                  <span className="text-xs uppercase tracking-[0.2em]">{isRegistering ? 'Deploying Account...' : 'Authenticating...'}</span>
                </>
              ) : (
                <span className="text-xs uppercase tracking-[0.2em]">{isRegistering ? 'Sign Up Now' : 'Initialize Vault'}</span>
              )}
            </button>
          </form>

          <div className="p-10 text-center bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isRegistering ? 'Member already?' : 'New to Ads Predia?'} 
              <button 
                type="button"
                onClick={() => !isSubmitting && toggleMode()}
                className="text-indigo-600 font-black ml-2 hover:underline focus:outline-none"
              >
                {isRegistering ? 'Go to Login' : 'Create One Free'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
